import { create } from 'zustand';

import { normalizeVolume } from './utils';
import { AudioProEventType, AudioProState, DEFAULT_CONFIG } from './values';

import type {
	AudioProConfigureOptions,
	AudioProEvent,
	AudioProPlaybackErrorPayload,
	AudioProTrack,
} from './types';

export interface AudioProStore {
	playerState: AudioProState;
	position: number;
	duration: number;
	playbackSpeed: number;
	volume: number;
	debug: boolean;
	debugIncludesProgress: boolean;
	trackPlaying: AudioProTrack | null;
	configureOptions: AudioProConfigureOptions;
	error: AudioProPlaybackErrorPayload | null;
	setDebug: (debug: boolean) => void;
	setDebugIncludesProgress: (includeProgress: boolean) => void;
	setTrackPlaying: (track: AudioProTrack | null) => void;
	setConfigureOptions: (options: AudioProConfigureOptions) => void;
	setPlaybackSpeed: (speed: number) => void;
	setVolume: (volume: number) => void;
	setError: (error: AudioProPlaybackErrorPayload | null) => void;
	updateFromEvent: (event: AudioProEvent) => void;
}

function getTrackIdentity(track: AudioProTrack | null | undefined): string | null {
	if (!track) {
		return null;
	}
	return track.id ?? track.url ?? null;
}

function tracksMatch(a: AudioProTrack | null | undefined, b: AudioProTrack | null | undefined) {
	const aId = getTrackIdentity(a);
	const bId = getTrackIdentity(b);
	return aId !== null && aId === bId;
}

function hasTrackMetadataChanged(prev: AudioProTrack, next: AudioProTrack) {
	return (
		prev.id !== next.id ||
		prev.url !== next.url ||
		prev.title !== next.title ||
		prev.artwork !== next.artwork ||
		prev.album !== next.album ||
		prev.artist !== next.artist
	);
}

export const internalStore = create<AudioProStore>((set, get) => ({
	playerState: AudioProState.IDLE,
	position: 0,
	duration: 0,
	playbackSpeed: 1.0,
	volume: normalizeVolume(1.0),
	debug: false,
	debugIncludesProgress: false,
	trackPlaying: null,
	configureOptions: { ...DEFAULT_CONFIG },
	error: null,
	setDebug: (debug) => set({ debug }),
	setDebugIncludesProgress: (includeProgress) => set({ debugIncludesProgress: includeProgress }),
	setTrackPlaying: (track) => set({ trackPlaying: track }),
	setConfigureOptions: (options) => set({ configureOptions: options }),
	setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
	setVolume: (volume) => set({ volume: normalizeVolume(volume) }),
	setError: (error) => set({ error }),
	updateFromEvent: (event) => {
		// Early exit for simple remote commands and duck events (no state change)
		if (
			event.type === AudioProEventType.REMOTE_NEXT ||
			event.type === AudioProEventType.REMOTE_PREV ||
			event.type === AudioProEventType.DUCK_BEGIN ||
			event.type === AudioProEventType.DUCK_END
		) {
			return;
		}

		const { type, track, payload } = event;
		const current = get();
		const updates: Partial<AudioProStore> = {};

		// Warn if a non-error event has no track
		if (track === undefined && type !== AudioProEventType.PLAYBACK_ERROR) {
			console.warn(`[react-native-audio-pro]: Event ${type} missing required track property`);
		}

		// 1. State changes
		if (
			type === AudioProEventType.STATE_CHANGED &&
			payload?.state &&
			payload.state !== current.playerState
		) {
			updates.playerState = payload.state;
			// Clear error when leaving ERROR state
			if (payload.state !== AudioProState.ERROR && current.error !== null) {
				updates.error = null;
			}
		}

		// 2. Playback errors
		// According to the contract in logic.md:
		// - PLAYBACK_ERROR and ERROR state are separate and must not be conflated
		// - ERROR state must be explicitly triggered by native logic
		// - PLAYBACK_ERROR events should not automatically imply or trigger a STATE_CHANGED: ERROR
		if (type === AudioProEventType.PLAYBACK_ERROR && payload?.error) {
			updates.error = {
				error: payload.error,
				errorCode: payload.errorCode,
			};
			// Note: We do NOT automatically transition to ERROR state here
			// Native code is responsible for emitting STATE_CHANGED: ERROR if needed
		}

		// 2.5 Track ended
		// According to the contract in logic.md:
		// - Native is responsible for detecting the end of a track
		// - Native must emit both STATE_CHANGED: STOPPED and TRACK_ENDED
		// - TypeScript should not infer or emit state transitions on its own
		if (type === AudioProEventType.TRACK_ENDED) {
			// Note: We do NOT automatically transition to STOPPED state here
			// Native code is responsible for emitting STATE_CHANGED: STOPPED
			// We only receive the TRACK_ENDED event for informational purposes
		}

		// 3. Speed changes
		if (
			type === AudioProEventType.PLAYBACK_SPEED_CHANGED &&
			payload?.speed !== undefined &&
			payload.speed !== current.playbackSpeed
		) {
			updates.playbackSpeed = payload.speed;
		}

		// 4. Progress updates
		if (payload?.position !== undefined && payload.position !== current.position) {
			updates.position = payload.position;
		}
		if (payload?.duration !== undefined && payload.duration !== current.duration) {
			updates.duration = payload.duration;
		}

		// 5. Track loading/unloading
		if (track) {
			const prev = current.trackPlaying;
			const eventSignalsTrackSwap =
				type === AudioProEventType.STATE_CHANGED &&
				(payload?.state === AudioProState.LOADING ||
					payload?.state === AudioProState.PLAYING);
			const shouldAdoptTrack = !prev || tracksMatch(prev, track) || eventSignalsTrackSwap;

			if (shouldAdoptTrack && (!prev || hasTrackMetadataChanged(prev, track))) {
				updates.trackPlaying = track;
			}
		} else if (
			track === null &&
			type !== AudioProEventType.PLAYBACK_ERROR &&
			current.trackPlaying !== null
		) {
			// Explicit unload of track (not during error)
			updates.trackPlaying = null;
		}

		// 6. Apply batched updates
		if (Object.keys(updates).length > 0) {
			set(updates);
		}
	},
}));
