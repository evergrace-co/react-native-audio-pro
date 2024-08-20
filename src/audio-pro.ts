import {DeviceEventEmitter, NativeEventEmitter, Platform} from 'react-native';

import AudioPro from './AudioProModule';
import {RepeatMode} from './constants';
import type {AddTrack, PlaybackState, PlayerOptions, Progress, Track, UpdateOptions} from './types';
import resolveAssetSource from './resolveAssetSource';
import {defaultPlayerOptions, defaultUpdateOptions} from './options';

// TODO: Start using NativeEventEmitter for Android as well
export const emitter =
	Platform.OS === 'ios' ? new NativeEventEmitter(AudioPro) : DeviceEventEmitter;

function resolveImportedAssetOrPath(pathOrAsset: string | number | undefined) {
	return pathOrAsset === undefined
		? undefined
		: typeof pathOrAsset === 'string'
		? pathOrAsset
		: resolveImportedAsset(pathOrAsset);
}

function resolveImportedAsset(id?: number) {
	return id ? (resolveAssetSource(id) as {uri: string} | null) ?? undefined : undefined;
}

/**
 * Initializes the player with the specified options.
 *
 * Note that on Android this method must only be called while the app is in the
 * foreground, otherwise it will throw an error with code
 * `'android_cannot_setup_player_in_background'`. In this case you can wait for
 * the app to be in the foreground and try again.
 *
 * @param options The options to initialize the player with.
 * @see https://rnap.dev/docs/api/functions/lifecycle
 */
export async function setupPlayer(options: PlayerOptions = {}): Promise<void> {
	return AudioPro.setupPlayer({
		...defaultPlayerOptions,
		options,
	});
}

/**
 * Updates the configuration for the components.
 * @param options The options to update.
 * @see https://rnap.dev/docs/api/functions/player#updateoptionsoptions
 */
export async function updateOptions(options: UpdateOptions): Promise<void> {
	return AudioPro.updateOptions({
		...defaultUpdateOptions,
		options,
	});
}

// TODO: Remove all references of Web player
// TODO: Removed deprecated `AudioPro.isServiceRunning()` method

/**
 * Adds one or more tracks to the queue.
 *
 * @param tracks The tracks to add to the queue.
 * @param insertBeforeIndex (Optional) The index to insert the tracks before.
 * By default the tracks will be added to the end of the queue.
 */
export async function add(tracks: AddTrack[], insertBeforeIndex?: number): Promise<number | void>;
/**
 * Adds a track to the queue.
 *
 * @param track The track to add to the queue.
 * @param insertBeforeIndex (Optional) The index to insert the track before.
 * By default the track will be added to the end of the queue.
 */
export async function add(track: AddTrack, insertBeforeIndex?: number): Promise<number | void>;
export async function add(
	tracks: AddTrack | AddTrack[],
	insertBeforeIndex = -1,
): Promise<number | void> {
	const resolvedTracks = (Array.isArray(tracks) ? tracks : [tracks]).map((track) => ({
		...track,
		url: resolveImportedAssetOrPath(track.url),
		artwork: resolveImportedAssetOrPath(track.artwork),
	}));
	return resolvedTracks.length < 1 ? undefined : AudioPro.add(resolvedTracks, insertBeforeIndex);
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
 * Move a track within the queue.
 *
 * @param fromIndex The index of the track to be moved.
 * @param toIndex The index to move the track to. If the index is larger than
 * the size of the queue, then the track is moved to the end of the queue.
 */
export async function move(fromIndex: number, toIndex: number): Promise<void> {
	return AudioPro.move(fromIndex, toIndex);
}

/**
 * Removes multiple tracks from the queue by their indexes.
 *
 * If the current track is removed, the next track will activated. If the
 * current track was the last track in the queue, the first track will be
 * activated.
 *
 * @param indexes The indexes of the tracks to be removed.
 */
export async function remove(indexes: number[]): Promise<void>;
/**
 * Removes a track from the queue by its index.
 *
 * If the current track is removed, the next track will activated. If the
 * current track was the last track in the queue, the first track will be
 * activated.
 *
 * @param index The index of the track to be removed.
 */
export async function remove(index: number): Promise<void>;
export async function remove(indexOrIndexes: number | number[]): Promise<void> {
	return AudioPro.remove(Array.isArray(indexOrIndexes) ? indexOrIndexes : [indexOrIndexes]);
}

// TODO: Removed AudioPro.updateMetadataForTrack(...)
// TODO: Removed AudioPro.clearNowPlayingMetadata();
// TODO: Removed AudioPro.updateNowPlayingMetadata()
// TODO: Removed AudioPro.removeUpcomingTracks()
// TODO: Removed AudioPro.skip()
// TODO: Removed AudioPro.skipToPrevious(initialPosition)

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
 * Gets the queue repeat mode.
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
