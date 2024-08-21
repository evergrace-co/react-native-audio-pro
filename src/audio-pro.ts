import {AppRegistry, DeviceEventEmitter, NativeEventEmitter, Platform} from 'react-native';

import AudioPro from './AudioProModule';
import {Event, RepeatMode} from './constants';
import {
	AddTrack,
	CustomUpdateOptions,
	EventPayloadByEvent,
	PlaybackState,
	Progress,
	RemoteDuckEvent,
	RemoteJumpBackwardEvent,
	RemoteJumpForwardEvent,
	RemoteSeekEvent,
	Track,
	UpdateOptions,
} from './types';
import {defaultPlayerOptions, defaultUpdateOptions} from './options';
import {HandledEvent} from './constants/HandledEvent';

export const emitter =
	Platform.OS === 'ios' ? new NativeEventEmitter(AudioPro) : DeviceEventEmitter;

let isSetup = false;
/**
 * Initializes the player with the specified options.
 *
 * @param config The options to initialize the player with.
 * @see https://rnap.dev/docs/api/functions/lifecycle
 */
export async function setup(config?: CustomUpdateOptions): Promise<void> {
	try {
		if (isSetup) {
			throw new Error('AudioPro has already been setup.');
		}

		// Setup
		await AudioPro.setupPlayer(defaultPlayerOptions);
		await AudioPro.updateOptions({
			...defaultUpdateOptions,
			options: config,
		} as UpdateOptions);

		/**
		 * DEFAULT EVENT HANDLING
		 */

		// Duck
		const handleRemoteDuck = (event: RemoteDuckEvent) => {
			// TODO: Ensure this works natively on both platforms, then remove and set default on Options
			if (event.paused || event.permanent) {
				if (event.permanent && Platform.OS === 'android') {
					void stop();
				} else {
					void pause();
				}
			} else {
				void play();
			}
		};
		emitter.addListener(HandledEvent.RemoteDuck, handleRemoteDuck);

		// Play
		const handleRemotePlay = () => play();
		emitter.addListener(HandledEvent.RemotePlay, handleRemotePlay);

		// Pause
		const handleRemotePause = () => pause();
		emitter.addListener(HandledEvent.RemotePause, handleRemotePause);

		// Stop
		const handleRemoteStop = () => stop();
		emitter.addListener(HandledEvent.RemoteStop, handleRemoteStop);

		// Seek
		const handleRemoteSeek = ({position}: RemoteSeekEvent) => seekTo(position);
		emitter.addListener(HandledEvent.RemoteSeek, handleRemoteSeek);

		// Jump forward
		const handleRemoteJumpForward = ({interval}: RemoteJumpForwardEvent) => seekBy(interval);
		emitter.addListener(HandledEvent.RemoteJumpForward, handleRemoteJumpForward);

		// Jump backward
		const handleRemoteJumpBackward = ({interval}: RemoteJumpBackwardEvent) => seekBy(-interval);
		emitter.addListener(HandledEvent.RemoteJumpBackward, handleRemoteJumpBackward);

		isSetup = true;
	} catch (e) {
		return Promise.reject(e);
	}
}

/**
 * Register the playback service.
 */
export function registerPlaybackService(factory: () => Promise<void>) {
	if (Platform.OS === 'android') {
		// Registers the headless task
		AppRegistry.registerHeadlessTask('AudioPro', () => factory);
	} else {
		// Initializes and runs the service in the next tick
		setImmediate(factory);
	}
}

/**
 * Add an event listener.
 */
export function addEventListener<T extends Event>(
	event: T,
	listener: EventPayloadByEvent[T] extends never
		? () => void
		: (event: EventPayloadByEvent[T]) => void,
) {
	return emitter.addListener(event, listener);
}

/**
 * Adds a track to the queue.
 *
 * @param track The track to add to the queue.
 * By default the track will be added to the end of the queue.
 */
export async function add(track: AddTrack): Promise<number | void> {
	return AudioPro.add([track], -1);
}

/**
 * Replaces the current track or loads the track as the first in the queue.
 *
 * @param track The track to load.
 */
export async function load(track: Track): Promise<number | void> {
	return AudioPro.load(track);
}

/**
 * Resets the player stopping the current track and clearing the queue.
 */
export async function reset(): Promise<void> {
	return AudioPro.reset();
}

/**
 * Plays or resumes the current track.
 */
export async function play(): Promise<void> {
	return AudioPro.play();
}

/**
 * Pauses the current track.
 */
export async function pause(): Promise<void> {
	return AudioPro.pause();
}

/**
 * Stops the current track.
 */
export async function stop(): Promise<void> {
	return AudioPro.stop();
}

/**
 * Sets weather the player will play automatically when it is ready to do so.
 * This is the equivalent of calling `AudioPro.play()` when `playWhenReady = true`
 * or `AudioPro.pause()` when `playWhenReady = false`.
 */
export async function setPlayWhenReady(playWhenReady: boolean): Promise<boolean> {
	return AudioPro.setPlayWhenReady(playWhenReady);
}

/**
 * Gets weather the player will play automatically when it is ready to do so.
 */
export async function getPlayWhenReady(): Promise<boolean> {
	return AudioPro.getPlayWhenReady();
}

/**
 * Seeks to a specified time position in the current track.
 * @param position The position to seek to in seconds.
 */
export async function seekTo(position: number): Promise<void> {
	return AudioPro.seekTo(position);
}

/**
 * Seeks by a relative time offset in the current track.
 * @param offset The time offset to seek by in seconds.
 */
export async function seekBy(offset: number): Promise<void> {
	return AudioPro.seekBy(offset);
}

/**
 * Sets the volume of the player.
 * @param level The volume as a number between 0 and 1.
 */
export async function setVolume(level: number): Promise<void> {
	return AudioPro.setVolume(level);
}

/**
 * Sets the playback rate.
 * @param rate The playback rate to change to, where 0.5 would be half speed,
 * 1 would be regular speed, 2 would be double speed etc.
 */
export async function setRate(rate: number): Promise<void> {
	return AudioPro.setRate(rate);
}

/**
 * Sets the queue.
 * @param tracks The tracks to set as the queue.
 */
export async function setQueue(tracks: Track[]): Promise<void> {
	return AudioPro.setQueue(tracks);
}

/**
 * Sets the queue repeat mode.
 * @param mode The repeat mode to set.
 * @see https://rnap.dev/docs/api/constants/repeat-mode
 */
export async function setRepeatMode(mode: RepeatMode): Promise<RepeatMode> {
	return AudioPro.setRepeatMode(mode);
}

/**
 * Gets the volume of the player as a number between 0 and 1.
 */
export async function getVolume(): Promise<number> {
	return AudioPro.getVolume();
}

/**
 * Gets the playback rate where 0.5 would be half speed, 1 would be
 * regular speed and 2 would be double speed etc.
 */
export async function getRate(): Promise<number> {
	return AudioPro.getRate();
}

/**
 * Gets a track object from the queue.
 * @param index The index of the track.
 * @returns The track object or undefined if there isn't a track object at that
 * index.
 */
export async function getTrack(index: number): Promise<Track | undefined> {
	return AudioPro.getTrack(index);
}

/**
 * Gets the whole queue.
 */
export async function getQueue(): Promise<Track[]> {
	return AudioPro.getQueue();
}

/**
 * Gets the index of the active track in the queue or undefined if there is no
 * current track.
 */
export async function getActiveTrackIndex(): Promise<number | undefined> {
	return (await AudioPro.getActiveTrackIndex()) ?? undefined;
}

/**
 * Gets the active track or undefined if there is no current track.
 */
export async function getActiveTrack(): Promise<Track | undefined> {
	return (await AudioPro.getActiveTrack()) ?? undefined;
}

/**
 * Gets the index of the current track or null if there is no current track.
 * @deprecated use `AudioPro.getActiveTrackIndex()` instead.
 */
export async function getCurrentTrack(): Promise<number | null> {
	return AudioPro.getActiveTrackIndex();
}

/**
 * Gets the duration of the current track in seconds.
 * @deprecated Use `AudioPro.getProgress().then((progress) => progress.duration)` instead.
 */
export async function getDuration(): Promise<number> {
	return AudioPro.getDuration();
}

/**
 * Gets the buffered position of the current track in seconds.
 * @deprecated Use `AudioPro.getProgress().then((progress) => progress.buffered)` instead.
 */
export async function getBufferedPosition(): Promise<number> {
	return AudioPro.getBufferedPosition();
}

/**
 * Gets the playback position of the current track in seconds.
 * @deprecated Use `AudioPro.getProgress().then((progress) => progress.position)` instead.
 */
export async function getPosition(): Promise<number> {
	return AudioPro.getPosition();
}

/**
 * Gets information on the progress of the currently active track, including its
 * current playback position in seconds, buffered position in seconds and
 * duration in seconds.
 */
export async function getProgress(): Promise<Progress> {
	return AudioPro.getProgress();
}

/**
 * Gets the playback state of the player.
 * @see https://rnap.dev/docs/api/constants/state
 */
export async function getPlaybackState(): Promise<PlaybackState> {
	return AudioPro.getPlaybackState();
}

/**
 * Gets the repeat mode.
 * @see https://rnap.dev/docs/api/constants/repeat-mode
 */
export async function getRepeatMode(): Promise<RepeatMode> {
	return AudioPro.getRepeatMode();
}

/**
 * Retries the current item when the playback state is `State.Error`.
 */
export async function retry() {
	return AudioPro.retry();
}

// TODO: Remove all references of Web player
// TODO: Removed deprecated `AudioPro.isServiceRunning()` method
// TODO: Removed AudioPro.move(fromIndex, toIndex)
// TODO: Removed AudioPro.remove(...)
// TODO: Removed AudioPro.updateMetadataForTrack(...)
// TODO: Removed AudioPro.clearNowPlayingMetadata();
// TODO: Removed AudioPro.updateNowPlayingMetadata()
// TODO: Removed AudioPro.removeUpcomingTracks()
// TODO: Removed AudioPro.skip()
// TODO: Removed AudioPro.skipToPrevious(initialPosition)
