import type {DefaultPlayerOptions, UpdateOptions} from './types';
import {Capability} from './constants';

const PLAYER_PROGRESS_UPDATE_INTERVAL = 1;
const PLAYER_JUMP_DURATION = 30;
const PLAYER_ANDROID_GRACE_PERIOD = 5;

export const defaultPlayerConfig: DefaultPlayerOptions = {
	minBuffer: 30,
	maxBuffer: 50,
	backBuffer: 0,
	playBuffer: 2.5,
	maxCacheSize: 0,
	iosCategory: 'playback',
	iosCategoryMode: 'default',
	androidAudioContentType: 'music',
	autoUpdateMetadata: true,
	autoHandleInterruptions: false,
};

export const defaultUpdateConfig: UpdateOptions = {
	capabilities: [
		Capability.Play,
		Capability.Pause,
		Capability.SeekTo,
		Capability.SkipToPrevious,
		Capability.SkipToNext,
	],
	notificationCapabilities: [
		Capability.Play,
		Capability.Pause,
		Capability.SkipToPrevious,
		Capability.SkipToNext,
	],
	compactCapabilities: [
		Capability.Play,
		Capability.Pause,
		Capability.SkipToPrevious,
		Capability.SkipToNext,
	],
	progressUpdateEventInterval: PLAYER_PROGRESS_UPDATE_INTERVAL,
	forwardJumpInterval: PLAYER_JUMP_DURATION,
	backwardJumpInterval: PLAYER_JUMP_DURATION,
	android: {
		alwaysPauseOnInterruption: true,
		appKilledPlaybackBehavior: 'stop-playback-and-remove-notification',
		stopForegroundGracePeriod: PLAYER_ANDROID_GRACE_PERIOD,
	},
};
