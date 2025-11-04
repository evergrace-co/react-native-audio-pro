import { useShallow } from 'zustand/shallow';

import { internalStore } from './internalStore';

import type { AudioProStore } from './internalStore';
import type { AudioProPlaybackErrorPayload, AudioProTrack } from './types';
import type { AudioProState } from './values';

export interface UseAudioProReturn {
	state: AudioProState;
	position: number;
	duration: number;
	playingTrack: AudioProTrack | null;
	playbackSpeed: number;
	volume: number;
	error: AudioProPlaybackErrorPayload | null;
}

const selectAll = (state: AudioProStore): UseAudioProReturn => ({
	state: state.playerState,
	position: state.position,
	duration: state.duration,
	playingTrack: state.trackPlaying,
	playbackSpeed: state.playbackSpeed,
	volume: state.volume,
	error: state.error,
});

const select = internalStore as unknown as {
	<T>(selector: (state: AudioProStore) => T): T;
	<T>(selector: (state: AudioProStore) => T, equalityFn?: (left: T, right: T) => boolean): T;
};

/**
 * React hook for accessing the current state of the audio player.
 *
 * When used without arguments, it subscribes to all player state values.
 * To avoid unnecessary re-renders, you may pass a selector function to
 * subscribe only to the specific piece of state your component needs.
 */
export function useAudioPro(): UseAudioProReturn;
export function useAudioPro<T>(
	selector: (state: AudioProStore) => T,
	equalityFn?: (left: T, right: T) => boolean,
): T;
export function useAudioPro<T>(
	selector?: (state: AudioProStore) => T,
	equalityFn?: (left: T, right: T) => boolean,
): UseAudioProReturn | T {
	const selectAllWithShallow = useShallow(selectAll);

	if (selector) {
		return select(selector, equalityFn);
	}

	return internalStore(selectAllWithShallow);
}
