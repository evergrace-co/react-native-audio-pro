import type { AudioProStore } from '../internalStore';
import type { AudioProEvent } from '../types';

const { internalStore } = jest.requireActual(
	'../internalStore',
) as typeof import('../internalStore');
const { AudioProEventType, AudioProState, DEFAULT_CONFIG } = jest.requireActual(
	'../values',
) as typeof import('../values');

type StoreSnapshot = Pick<
	AudioProStore,
	| 'playerState'
	| 'position'
	| 'duration'
	| 'playbackSpeed'
	| 'volume'
	| 'debug'
	| 'debugIncludesProgress'
	| 'trackPlaying'
	| 'configureOptions'
	| 'error'
>;

const baseState: StoreSnapshot = {
	playerState: AudioProState.IDLE,
	position: 0,
	duration: 0,
	playbackSpeed: 1,
	volume: 1,
	debug: false,
	debugIncludesProgress: false,
	trackPlaying: null,
	configureOptions: { ...DEFAULT_CONFIG },
	error: null,
};

function resetStore(overrides: Partial<StoreSnapshot> = {}) {
	internalStore.setState({
		...baseState,
		configureOptions: { ...DEFAULT_CONFIG },
		...overrides,
	});
}

describe('internalStore.updateFromEvent', () => {
	beforeEach(() => {
		resetStore();
		jest.restoreAllMocks();
	});

	it('warns when a non-error event omits the track payload', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.PLAYBACK_SPEED_CHANGED,
			payload: { speed: 1.1 },
		} as AudioProEvent);

		expect(warnSpy).toHaveBeenCalledWith(
			'[react-native-audio-pro]: Event PLAYBACK_SPEED_CHANGED missing required track property',
		);
	});

	it('updates the player state and clears existing errors', () => {
		resetStore({
			playerState: AudioProState.PLAYING,
			error: { error: 'boom', errorCode: 1 },
		});

		const event: AudioProEvent = {
			type: AudioProEventType.STATE_CHANGED,
			track: {
				id: 'track-1',
				url: 'https://example.com/audio.mp3',
				title: 'Title',
				artwork: 'https://example.com/art.jpg',
			},
			payload: { state: AudioProState.STOPPED },
		};

		internalStore.getState().updateFromEvent(event);

		const state = internalStore.getState();
		expect(state.playerState).toBe(AudioProState.STOPPED);
		expect(state.error).toBeNull();
	});

	it('captures playback errors without mutating the player state', () => {
		resetStore({ playerState: AudioProState.PLAYING });

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.PLAYBACK_ERROR,
			payload: { error: 'uh oh', errorCode: 99 },
		} as AudioProEvent);

		const state = internalStore.getState();
		expect(state.playerState).toBe(AudioProState.PLAYING);
		expect(state.error).toEqual({ error: 'uh oh', errorCode: 99 });
	});

	it('updates progress metrics when they change', () => {
		resetStore({ position: 5, duration: 10 });

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.PROGRESS,
			track: {
				id: 'track-1',
				url: 'https://example.com/audio.mp3',
				title: 'Title',
				artwork: 'https://example.com/art.jpg',
			},
			payload: { position: 15, duration: 30 },
		} as AudioProEvent);

		const state = internalStore.getState();
		expect(state.position).toBe(15);
		expect(state.duration).toBe(30);
	});

	it('retains the existing track when event metadata is identical', () => {
		const track = {
			id: 'track-1',
			url: 'https://example.com/audio.mp3',
			title: 'Title',
			artwork: 'https://example.com/art.jpg',
		} as const;

		resetStore({ trackPlaying: track });

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.PROGRESS,
			track: { ...track },
			payload: { position: 5 },
		} as AudioProEvent);

		const state = internalStore.getState();
		expect(state.trackPlaying).toBe(track);
	});

	it('clears the playing track when native signals an unload', () => {
		const track = {
			id: 'track-1',
			url: 'https://example.com/audio.mp3',
			title: 'Title',
			artwork: 'https://example.com/art.jpg',
		} as const;

		resetStore({ trackPlaying: track });

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.SEEK_COMPLETE,
			track: null,
		} as AudioProEvent);

		expect(internalStore.getState().trackPlaying).toBeNull();
	});

	it('ignores remote command events', () => {
		resetStore({ position: 10 });

		internalStore.getState().updateFromEvent({
			type: AudioProEventType.REMOTE_NEXT,
			track: {
				id: 'track-1',
				url: 'https://example.com/audio.mp3',
				title: 'Title',
				artwork: 'https://example.com/art.jpg',
			},
		} as AudioProEvent);

		expect(internalStore.getState().position).toBe(10);
	});
});
