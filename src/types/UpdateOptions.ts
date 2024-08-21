import {Capability} from '../constants';

export type CustomUpdateOptions = {
	// General (in seconds)
	forwardJumpInterval?: number;
	backwardJumpInterval?: number;
	progressUpdateEventInterval?: number;

	// iOS
	capabilities?: Capability[];

	// Android
	notificationCapabilities?: Capability[];
	compactCapabilities?: Capability[];
};

export type DefaultUpdateOptions = {
	forwardJumpInterval: number;
	backwardJumpInterval: number;
	progressUpdateEventInterval: number; // in seconds
	android: {
		/**
		 * Whether the audio playback notification is also removed when the playback
		 * stops. **If `stoppingAppPausesPlayback` is set to false, this will be
		 * ignored.**
		 */
		appKilledPlaybackBehavior: 'stop-playback-and-remove-notification';
		/**
		 * Whether the remote-duck event will be triggered on every interruption
		 */
		alwaysPauseOnInterruption: true;
		/**
		 * Time in seconds to wait once the player should transition to not
		 * considering the service as in the foreground. If playback resumes within
		 * this grace period, the service remains in the foreground state.
		 * Defaults to 5 seconds.
		 */
		stopForegroundGracePeriod: number;
	};

	// iOS
	capabilities: Capability[];

	// Android
	notificationCapabilities: Capability[];
	compactCapabilities: Capability[];
};

export type UpdateOptions = DefaultUpdateOptions & CustomUpdateOptions;
