import { NativeModules } from 'react-native';

import { ambientEmitter, emitter } from './emitter';
import { internalStore } from './internalStore';
import {
	guardTrackPlaying,
	logDebug,
	normalizeVolume,
	validateTrack,
	validateFilePath,
} from './utils';
import {
	AudioProAmbientEventType,
	AudioProEventType,
	AudioProState,
	DEFAULT_CONFIG,
	DEFAULT_SEEK_MS,
} from './values';

import type {
	AmbientAudioPlayOptions,
	AudioProAmbientEventCallback,
	AudioProConfigureOptions,
	AudioProEventCallback,
	AudioProPlayOptions,
	AudioProTrack,
} from './types';

const NativeAudioPro = NativeModules.AudioPro;

/**
 * Checks if the current player state is valid for the given operation
 *
 * @param operation - The operation name for logging purposes
 * @returns true if the player state is valid for the operation, false otherwise
 * @internal
 */
function isValidPlayerStateForOperation(operation: string): boolean {
	const { playerState } = internalStore.getState();
	if (playerState === AudioProState.IDLE || playerState === AudioProState.ERROR) {
		logDebug(`AudioPro: ${operation} ignored - player in`, playerState, 'state');
		return false;
	}
	return true;
}

export const AudioPro = {
	/**
	 * Configure the audio player with the specified options
	 *
	 * Note: Configuration changes are stored but only applied when the next `play()` call is made.
	 * This is by design and applies to all configuration options.
	 *
	 * @param options - Configuration options for the audio player
	 * @param options.contentType - Type of content being played (MUSIC or SPEECH)
	 * @param options.debug - Enable debug logging
	 * @param options.debugIncludesProgress - Include progress events in debug logs
	 * @param options.progressIntervalMs - Interval in milliseconds for progress events
	 * @param options.skipIntervalMs - Interval in milliseconds for skip forward/back actions
	 * @param options.showNextPrevControls - Whether to show next/previous controls in notification
	 * @param options.showSkipControls - Whether to show skip forward/back controls in notification
	 */
	/**
	 * Configure the audio player with the specified options.
	 *
	 * Note: Configuration changes are stored but only applied when the next `play()` call is made.
	 * This is by design and applies to all configuration options.
	 *
	 * Mutual exclusivity between showNextPrevControls and showSkipControls is enforced here.
	 * If both are true, showSkipControls will be set to false and a warning logged.
	 *
	 * @param options - Configuration options for the audio player
	 */
	configure(options: AudioProConfigureOptions): void {
		const { setConfigureOptions, setDebug, setDebugIncludesProgress } =
			internalStore.getState();
		let config: AudioProConfigureOptions = { ...DEFAULT_CONFIG, ...options };
		if (config.showNextPrevControls === true && config.showSkipControls === true) {
			// If both are true, showSkipControls must be false.
			console.warn(
				'[react-native-audio-pro]: showNextPrevControls and showSkipControls are mutually exclusive. showSkipControls will be set to false.',
			);
			config = { ...config, showSkipControls: false };
		}
		if (config.skipInterval) {
			// Warn if deprecated skipInterval configuration was used
			console.warn(
				'[react-native-audio-pro]: skipInterval is deprecated and will be removed in a future release. Use `skipIntervalMs` instead.',
			);
			// Remove deprecated skipInterval property, and transform to value in milliseconds
			const { skipInterval: skipIntervalDeprecated, ...fixedConfig } = config;
			config = { ...fixedConfig, skipIntervalMs: skipIntervalDeprecated * 1000 };
		}
		setConfigureOptions(config);
		setDebug(!!options.debug);
		setDebugIncludesProgress(options.debugIncludesProgress ?? false);
		logDebug('AudioPro: configure()', config);
	},

	/**
	 * Load and play an audio track
	 *
	 * @param track - The audio track to play
	 * @param track.id - Unique identifier for the track
	 * @param track.url - URL of the audio file (http://, https://, or file://)
	 * @param track.title - Title of the track
	 * @param track.artwork - URL of the artwork image (http://, https://, or file://)
	 * @param track.album - Optional album name
	 * @param track.artist - Optional artist name
	 * @param options - Optional playback options
	 * @param options.autoPlay - Whether to start playback immediately (default: true)
	 * @param options.headers - Custom HTTP headers for audio and artwork requests
	 */
	play(track: AudioProTrack, options: AudioProPlayOptions = {}) {
		const resolvedTrack = { ...track };

		// Validate URL schemes for track and artwork
		validateFilePath(resolvedTrack.url);
		validateFilePath(resolvedTrack.artwork);

		if (!validateTrack(resolvedTrack)) {
			const errorMessage = '[react-native-audio-pro]: Invalid track provided to play().';
			console.error(errorMessage);
			emitter.emit('AudioProEvent', {
				type: AudioProEventType.PLAYBACK_ERROR,
				track: null,
				payload: {
					error: errorMessage,
					errorCode: -1,
				},
			});
			return;
		}

		const { error, setError, configureOptions, playbackSpeed, setTrackPlaying, volume } =
			internalStore.getState();

		// Clear errors and set track as playing
		setTrackPlaying(resolvedTrack);
		if (error) {
			setError(null);
		}

		// Prepare options for native module
		const nativeOptions = {
			...configureOptions,
			...options,
			playbackSpeed,
			volume: normalizeVolume(volume),
		};

		logDebug('AudioPro: play()', track, 'options:', options, 'nativeOptions:', nativeOptions);

		NativeAudioPro.play(resolvedTrack, nativeOptions);
	},

	/**
	 * Pause the current playback
	 * No-op if no track is playing or player is in IDLE or ERROR state
	 */
	pause() {
		if (!guardTrackPlaying('pause')) return;
		logDebug('AudioPro: pause()');
		if (!isValidPlayerStateForOperation('pause()')) return;
		NativeAudioPro.pause();
	},

	/**
	 * Resume playback if paused
	 * No-op if no track is playing or player is in IDLE or ERROR state
	 */
	resume() {
		if (!guardTrackPlaying('resume')) return;
		logDebug('AudioPro: resume()');
		if (!isValidPlayerStateForOperation('resume()')) return;

		// Clear any existing error
		const { error, setError } = internalStore.getState();
		if (error) {
			setError(null);
		}
		NativeAudioPro.resume();
	},

	/**
	 * Stop the playback, resetting to position 0
	 * This keeps the track loaded but resets the position
	 */
	stop() {
		logDebug('AudioPro: stop()');
		const { error, setError } = internalStore.getState();
		if (error) {
			setError(null);
		}
		NativeAudioPro.stop();
	},

	/**
	 * Fully reset the player to IDLE state
	 * Tears down the player instance and removes all media sessions
	 */
	clear() {
		logDebug('AudioPro: clear()');
		const { error, setError, setTrackPlaying, setVolume } = internalStore.getState();
		if (error) {
			setError(null);
		}
		setTrackPlaying(null);
		setVolume(normalizeVolume(1.0));
		NativeAudioPro.clear();
	},

	/**
	 * Seek to a specific position in the current track
	 *
	 * @param positionMs - Position in milliseconds to seek to
	 */
	seekTo(positionMs: number) {
		if (!guardTrackPlaying('seekTo')) return;
		logDebug('AudioPro: seekTo()', positionMs);
		if (!isValidPlayerStateForOperation('seekTo()')) return;
		if (positionMs < 0) return;
		NativeAudioPro.seekTo(positionMs);
	},

	/**
	 * Seek forward by the specified amount
	 *
	 * @param amountMs - Amount in milliseconds to seek forward (default: 30000ms)
	 */
	seekForward(amountMs: number = DEFAULT_SEEK_MS) {
		if (!guardTrackPlaying('seekForward')) return;
		logDebug('AudioPro: seekForward()', amountMs);
		if (!isValidPlayerStateForOperation('seekForward()')) return;
		if (amountMs <= 0) return;
		NativeAudioPro.seekForward(amountMs);
	},

	/**
	 * Seek backward by the specified amount
	 *
	 * @param amountMs - Amount in milliseconds to seek backward (default: 30000ms)
	 */
	seekBack(amountMs: number = DEFAULT_SEEK_MS) {
		if (!guardTrackPlaying('seekBack')) return;
		logDebug('AudioPro: seekBack()', amountMs);
		if (!isValidPlayerStateForOperation('seekBack()')) return;
		if (amountMs <= 0) return;
		NativeAudioPro.seekBack(amountMs);
	},

	/**
	 * Add a listener for audio player events
	 *
	 * @param callback - Callback function to handle audio player events
	 * @returns Subscription that can be used to remove the listener
	 */
	addEventListener(callback: AudioProEventCallback) {
		return emitter.addListener('AudioProEvent', callback);
	},

	/**
	 * Get the current playback position and total duration
	 *
	 * @returns Object containing position and duration in milliseconds
	 */
	getTimings() {
		const { position, duration } = internalStore.getState();
		return { position, duration };
	},

	/**
	 * Get the current playback state
	 *
	 * @returns Current playback state (IDLE, STOPPED, LOADING, PLAYING, PAUSED, ERROR)
	 */
	getState() {
		return internalStore.getState().playerState;
	},

	/**
	 * Get the currently playing track
	 *
	 * @returns Currently playing track or null if no track is playing
	 */
	getPlayingTrack() {
		return internalStore.getState().trackPlaying;
	},

	/**
	 * Set the playback speed rate
	 *
	 * @param speed - Playback speed rate (0.25 to 2.0, normal speed is 1.0)
	 */
	setPlaybackSpeed(speed: number) {
		const validatedSpeed = Math.max(0.25, Math.min(2.0, speed));
		if (validatedSpeed !== speed) {
			console.warn(
				`[react-native-audio-pro]: Playback speed ${speed} out of range, clamped to ${validatedSpeed}`,
			);
		}

		logDebug('AudioPro: setPlaybackSpeed()', validatedSpeed);
		const { setPlaybackSpeed, trackPlaying } = internalStore.getState();
		setPlaybackSpeed(validatedSpeed);

		if (trackPlaying) {
			if (!isValidPlayerStateForOperation('setPlaybackSpeed() native call')) return;
			NativeAudioPro.setPlaybackSpeed(validatedSpeed);
		}
	},

	/**
	 * Get the current playback speed rate
	 *
	 * @returns Current playback speed rate (0.25 to 2.0, normal speed is 1.0)
	 */
	getPlaybackSpeed() {
		return internalStore.getState().playbackSpeed;
	},

	/**
	 * Set the playback volume
	 *
	 * @param volume - Volume level (0.0 to 1.0, where 0.0 is mute and 1.0 is full volume)
	 */
	setVolume(volume: number) {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		if (clampedVolume !== volume) {
			console.warn(
				`[react-native-audio-pro]: Volume ${volume} out of range, clamped to ${clampedVolume}`,
			);
		}

		const normalizedVolume = normalizeVolume(clampedVolume);
		logDebug('AudioPro: setVolume()', normalizedVolume);

		const { setVolume, trackPlaying } = internalStore.getState();
		setVolume(normalizedVolume);

		if (trackPlaying) {
			if (!isValidPlayerStateForOperation('setVolume()')) return;
			NativeAudioPro.setVolume(normalizedVolume);
		}
	},

	/**
	 * Get the current playback volume
	 *
	 * @returns Current volume level (0.0 to 1.0)
	 */
	getVolume() {
		return internalStore.getState().volume;
	},

	/**
	 * Get the last error that occurred
	 *
	 * @returns Last error or null if no error has occurred
	 */
	getError() {
		return internalStore.getState().error;
	},

	/**
	 * Set the frequency at which progress events are emitted
	 *
	 * @param ms - Interval in milliseconds (100ms to 10000ms)
	 */
	setProgressInterval(ms: number) {
		const MIN_INTERVAL = 100;
		const MAX_INTERVAL = 10000;

		const clampedMs = Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, ms));
		if (clampedMs !== ms) {
			console.warn(
				`[react-native-audio-pro]: Progress interval ${ms}ms out of range, clamped to ${clampedMs}ms`,
			);
		}

		logDebug('AudioPro: setProgressInterval()', clampedMs);
		const { setConfigureOptions, configureOptions } = internalStore.getState();
		setConfigureOptions({ ...configureOptions, progressIntervalMs: clampedMs });
	},

	/**
	 * Get the current progress interval
	 *
	 * @returns The current progress interval in milliseconds
	 */
	getProgressInterval() {
		return (
			internalStore.getState().configureOptions.progressIntervalMs ??
			DEFAULT_CONFIG.progressIntervalMs
		);
	},

	// ==============================
	// AMBIENT AUDIO METHODS
	// ==============================

	/**
	 * Play an ambient audio track
	 *
	 * @param options - Ambient audio options
	 * @param options.url - URL of the audio file to play (http://, https://, or file://)
	 * @param options.loop - Whether to loop the audio (default: true)
	 */
	ambientPlay(options: AmbientAudioPlayOptions): void {
		const { url: originalUrl, loop = true } = options;

		if (!originalUrl) {
			const errorMessage = '[react-native-audio-pro]: Invalid URL provided to ambientPlay().';
			console.error(errorMessage);
			ambientEmitter.emit('AudioProAmbientEvent', {
				type: AudioProAmbientEventType.AMBIENT_ERROR,
				payload: {
					error: errorMessage,
				},
			});
			return;
		}
		// Validate URL scheme for ambient track
		validateFilePath(originalUrl);
		const resolvedUrl = originalUrl;

		const { debug } = internalStore.getState();

		logDebug('AudioPro: ambientPlay()', { url: resolvedUrl, loop });
		NativeAudioPro.ambientPlay({ url: resolvedUrl, loop, debug });
	},

	/**
	 * Stop ambient audio playback
	 */
	ambientStop(): void {
		logDebug('AudioPro: ambientStop()');
		NativeAudioPro.ambientStop();
	},

	/**
	 * Set the volume of ambient audio playback
	 *
	 * @param volume - Volume level (0.0 to 1.0)
	 */
	ambientSetVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		if (clampedVolume !== volume) {
			console.warn(
				`[react-native-audio-pro]: Volume ${volume} out of range, clamped to ${clampedVolume}`,
			);
		}

		const normalizedVolume = normalizeVolume(clampedVolume);
		logDebug('AudioPro: ambientSetVolume()', normalizedVolume);
		NativeAudioPro.ambientSetVolume(normalizedVolume);
	},

	/**
	 * Pause ambient audio playback
	 * No-op if already paused or not playing
	 */
	ambientPause(): void {
		logDebug('AudioPro: ambientPause()');
		NativeAudioPro.ambientPause();
	},

	/**
	 * Resume ambient audio playback
	 * No-op if already playing or no active track
	 */
	ambientResume(): void {
		logDebug('AudioPro: ambientResume()');
		NativeAudioPro.ambientResume();
	},

	/**
	 * Seek to a specific position in the ambient audio
	 * Silently ignore if not supported or no active track
	 *
	 * @param positionMs - Position in milliseconds
	 */
	ambientSeekTo(positionMs: number): void {
		logDebug('AudioPro: ambientSeekTo()', positionMs);
		NativeAudioPro.ambientSeekTo(positionMs);
	},

	/**
	 * Add a listener for ambient audio events
	 *
	 * @param callback - Callback function to handle ambient audio events
	 * @returns Subscription that can be used to remove the listener
	 */
	addAmbientListener(callback: AudioProAmbientEventCallback) {
		return ambientEmitter.addListener('AudioProAmbientEvent', callback);
	},
};
