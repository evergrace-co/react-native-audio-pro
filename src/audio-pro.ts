import {AppRegistry, DeviceEventEmitter, NativeEventEmitter, Platform} from 'react-native';

import AudioPro from './AudioProModule';
import {Event} from './constants';
import {CustomUpdateOptions, EventPayloadByEvent, Track, UpdateOptions} from './types';
import {defaultPlayerOptions, defaultUpdateOptions} from './options';
import {handleDefaultEvents} from './events';

export const emitter =
	Platform.OS === 'ios' ? new NativeEventEmitter(AudioPro) : DeviceEventEmitter;

let isSetup = false;

/**
 * Initializes the player with the specified options.
 *
 * @param playbackService
 * @param config The options to initialize the player with.
 * @see https://rnap.dev/docs/api/functions/lifecycle
 */
export async function setup(
	playbackService: () => Promise<void>,
	config?: CustomUpdateOptions,
): Promise<void> {
	// TODO: Add logging option
	try {
		if (isSetup) {
			throw new Error('AudioPro has already run setup.');
		}
		isSetup = true;

		const combinedPlaybackService = async () => {
			void playbackService();
			handleDefaultEvents();
		};

		if (Platform.OS === 'android') {
			AppRegistry.registerHeadlessTask('AudioPro', () => combinedPlaybackService);
		} else {
			void combinedPlaybackService();
		}

		// Setup
		await AudioPro.setupPlayer(defaultPlayerOptions);
		await AudioPro.updateOptions({
			...defaultUpdateOptions,
			options: config,
		} as UpdateOptions);
	} catch (e) {
		return Promise.reject(e);
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
 * Replaces the current track or loads the track
 *
 * @param track The track to load.
 * @param playWhenReady
 */
export async function load(track: Track, playWhenReady = true): Promise<number | void> {
	return AudioPro.load(track, playWhenReady);
	// TODO: Add playWhenReady to native
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
 * Stops playback. Behavior is the same as AudioPro.pause() where playWhenReady becomes false,
 * but instead of just pausing playback, the item is unloaded.
 * This function causes any further loading / buffering to stop.
 */
export async function stop(): Promise<void> {
	return AudioPro.stop();
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
 * Retries the current item when the playback state is `State.Error`.
 */
export async function retry() {
	return AudioPro.retry();
}
