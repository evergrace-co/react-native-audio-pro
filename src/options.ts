import type {PlayerOptions, UpdateOptions} from './types';
import {AndroidAudioContentType, Capability} from './constants';

const PLAYER_PROGRESS_UPDATE_INTERVAL = 1;
const PLAYER_JUMP_DURATION = 30;
const PLAYER_ANDROID_GRACE_PERIOD = 5;

export const defaultPlayerOptions: PlayerOptions = {
	minBuffer: 50,
	maxBuffer: 50,
	backBuffer: 0,
	playBuffer: 2.5,
	maxCacheSize: 0,
	iosCategory: undefined,
	iosCategoryMode: undefined,
	iosCategoryOptions: undefined,
	androidAudioContentType: AndroidAudioContentType.Music,
	autoUpdateMetadata: true,
	autoHandleInterruptions: false,
};
// TODO: Remove deprecated `waitForBuffer` from defaultPlayerOptions codes

export const defaultUpdateOptions: UpdateOptions = {
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
