jest.useFakeTimers();

jest.mock('react-native', () => ({
	Platform: {
		OS: 'ios',
	},
	NativeModules: {
		AudioPro: {
			play: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
			stop: jest.fn(),
			ambientPlay: jest.fn(),
			ambientStop: jest.fn(),
			ambientPause: jest.fn(),
			ambientResume: jest.fn(),
			seekTo: jest.fn(),
			seekForward: jest.fn(),
			seekBack: jest.fn(),
			setPlaybackSpeed: jest.fn(),
			setVolume: jest.fn(),
			clear: jest.fn(),
		},
	},
	NativeEventEmitter: jest.fn().mockImplementation(() => ({
		addListener: jest.fn(() => ({ remove: jest.fn() })),
		removeListener: jest.fn(),
	})),
}));

const mockState = {
	playerState: 'PLAYING',
	position: 0,
	duration: 0,
	trackPlaying: { url: 'https://example.com/audio.mp3' },
	volume: 1.0,
	playbackSpeed: 1.0,
	configureOptions: {
		progressIntervalMs: 1000,
	},
	error: null,
	debug: false,
	debugIncludesProgress: false,
};

const mockActions = {
	setTrackPlaying: jest.fn(),
	setError: jest.fn(),
	setPlaybackSpeed: jest.fn(),
	setVolume: jest.fn(),
	setConfigureOptions: jest.fn(),
	setDebug: jest.fn(),
	setDebugIncludesProgress: jest.fn(),
	updateFromEvent: jest.fn(),
};

jest.mock('./src/internalStore', () => {
	const internalStore = jest.fn((selector) => selector(mockState));
	internalStore.getState = () => ({
		...mockState,
		...mockActions,
	});
	internalStore.setState = jest.fn();
	internalStore.subscribe = jest.fn();
	return { internalStore };
});

jest.mock('./src/emitter', () => ({
	emitter: {
		emit: jest.fn(),
		addListener: jest.fn(() => ({ remove: jest.fn() })),
	},
	ambientEmitter: {
		emit: jest.fn(),
		addListener: jest.fn(() => ({ remove: jest.fn() })),
	},
}));
