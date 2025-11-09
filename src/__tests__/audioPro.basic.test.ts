import { NativeModules } from 'react-native';

import { AudioPro } from '../audioPro';
import { internalStore } from '../internalStore';

import type { AudioProTrack } from '../types';

describe('AudioPro basic functionality', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('calls native play method with correct parameters', () => {
		const track = {
			id: 'test-track',
			url: 'https://example.com/audio.mp3',
			title: 'Test Track',
			artwork: 'https://example.com/artwork.jpg',
		};

		AudioPro.play(track);

		expect(NativeModules.AudioPro.play).toHaveBeenCalledWith(
			expect.objectContaining({
				url: 'https://example.com/audio.mp3',
				title: 'Test Track',
			}),
			expect.any(Object),
		);
	});

	it('calls native pause method', () => {
		AudioPro.pause();
		expect(NativeModules.AudioPro.pause).toHaveBeenCalled();
	});

	it('calls native resume method', () => {
		AudioPro.resume();
		expect(NativeModules.AudioPro.resume).toHaveBeenCalled();
	});

	it('calls native stop method', () => {
		AudioPro.stop();
		expect(NativeModules.AudioPro.stop).toHaveBeenCalled();
	});
});

describe('AudioPro ambient functionality', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('calls native ambientPlay method with correct parameters', () => {
		const options = {
			url: 'https://example.com/ambient.mp3',
			loop: true,
		};

		AudioPro.ambientPlay(options);

		expect(NativeModules.AudioPro.ambientPlay).toHaveBeenCalledWith(
			expect.objectContaining({
				url: 'https://example.com/ambient.mp3',
				loop: true,
			}),
		);
	});

	it('calls native ambientStop method', () => {
		AudioPro.ambientStop();
		expect(NativeModules.AudioPro.ambientStop).toHaveBeenCalled();
	});

	it('calls native ambientPause method', () => {
		AudioPro.ambientPause();
		expect(NativeModules.AudioPro.ambientPause).toHaveBeenCalled();
	});

	it('calls native ambientResume method', () => {
		AudioPro.ambientResume();
		expect(NativeModules.AudioPro.ambientResume).toHaveBeenCalled();
	});
});

describe('AudioPro playback control functionality', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('calls native seekTo method with correct position', () => {
		AudioPro.seekTo(5000);
		expect(NativeModules.AudioPro.seekTo).toHaveBeenCalledWith(5000);
	});

	it('calls native seekForward method with default amount', () => {
		AudioPro.seekForward();
		expect(NativeModules.AudioPro.seekForward).toHaveBeenCalledWith(30000);
	});

	it('calls native seekBack method with custom amount', () => {
		AudioPro.seekBack(15000);
		expect(NativeModules.AudioPro.seekBack).toHaveBeenCalledWith(15000);
	});

	it('calls native setPlaybackSpeed method with correct speed', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		AudioPro.setPlaybackSpeed(1.5);
		expect(NativeModules.AudioPro.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
		consoleSpy.mockRestore();
	});

	it('calls native setVolume method with correct volume', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		AudioPro.setVolume(0.8);
		expect(NativeModules.AudioPro.setVolume).toHaveBeenCalledWith(0.8);
		consoleSpy.mockRestore();
	});

	it('updates progress interval in store', () => {
		AudioPro.setProgressInterval(1000);
		expect(internalStore.getState().setConfigureOptions).toHaveBeenCalledWith(
			expect.objectContaining({
				progressIntervalMs: 1000,
			}),
		);
	});
});

describe('AudioPro getter methods', () => {
	it('returns correct timings', () => {
		const timings = AudioPro.getTimings();
		expect(timings).toEqual({
			position: 0,
			duration: 0,
		});
	});

	it('returns correct player state', () => {
		const state = AudioPro.getState();
		expect(state).toBe('PLAYING');
	});

	it('returns correct playing track', () => {
		const track = AudioPro.getPlayingTrack();
		expect(track).toEqual({
			url: 'https://example.com/audio.mp3',
		});
	});

	it('returns correct playback speed', () => {
		const speed = AudioPro.getPlaybackSpeed();
		expect(speed).toBe(1.0);
	});

	it('returns correct volume', () => {
		const volume = AudioPro.getVolume();
		expect(volume).toBe(1.0);
	});

	it('returns correct progress interval', () => {
		const interval = AudioPro.getProgressInterval();
		expect(interval).toBe(1000);
	});
});

describe('AudioPro configuration', () => {
	it('updates configuration options in store', () => {
		AudioPro.configure({
			debug: true,
			progressIntervalMs: 500,
			debugIncludesProgress: true,
		});

		expect(internalStore.getState().setConfigureOptions).toHaveBeenCalledWith(
			expect.objectContaining({
				debug: true,
				progressIntervalMs: 500,
				debugIncludesProgress: true,
			}),
		);
	});

	it('forces skip controls off when next/prev controls are enabled', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

		AudioPro.configure({ showNextPrevControls: true, showSkipControls: true });

		const calls = (internalStore.getState().setConfigureOptions as jest.Mock).mock.calls;
		const config = calls[calls.length - 1][0];
		expect(config.showNextPrevControls).toBe(true);
		expect(config.showSkipControls).toBe(false);
		expect(warnSpy).toHaveBeenCalledWith(
			'[react-native-audio-pro]: showNextPrevControls and showSkipControls are mutually exclusive. showSkipControls will be set to false.',
		);

		warnSpy.mockRestore();
	});

	it('converts deprecated skipInterval seconds to milliseconds', () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

		AudioPro.configure({ skipInterval: 12 });

		const calls = (internalStore.getState().setConfigureOptions as jest.Mock).mock.calls;
		const config = calls[calls.length - 1][0];
		expect(config.skipInterval).toBeUndefined();
		expect(config.skipIntervalMs).toBe(12000);
		expect(warnSpy).toHaveBeenCalledWith(
			'[react-native-audio-pro]: skipInterval is deprecated and will be removed in a future release. Use `skipIntervalMs` instead.',
		);

		warnSpy.mockRestore();
	});
});

describe('AudioPro error cases', () => {
	it('handles invalid track parameters', () => {
		const invalidTrack: AudioProTrack = {
			id: 'test-track',
			url: '', // Empty URL
			title: 'Test Track',
			artwork: '', // Empty artwork
		};

		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		AudioPro.play(invalidTrack);
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it('clamps volume to valid range', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		AudioPro.setVolume(1.5); // Too high
		expect(NativeModules.AudioPro.setVolume).toHaveBeenCalledWith(1.0);

		AudioPro.setVolume(-0.5); // Too low
		expect(NativeModules.AudioPro.setVolume).toHaveBeenCalledWith(0);
		consoleSpy.mockRestore();
	});

	it('clamps playback speed to valid range', () => {
		const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
		AudioPro.setPlaybackSpeed(2.5); // Too high
		expect(NativeModules.AudioPro.setPlaybackSpeed).toHaveBeenCalledWith(2.0);

		AudioPro.setPlaybackSpeed(0.1); // Too low
		expect(NativeModules.AudioPro.setPlaybackSpeed).toHaveBeenCalledWith(0.25);
		consoleSpy.mockRestore();
	});
});

describe('AudioPro clear functionality', () => {
	it('resets player state and cleans up', () => {
		AudioPro.clear();

		expect(NativeModules.AudioPro.clear).toHaveBeenCalled();
		expect(internalStore.getState().setTrackPlaying).toHaveBeenCalledWith(null);
		expect(internalStore.getState().setVolume).toHaveBeenCalledWith(1.0);
	});
});
