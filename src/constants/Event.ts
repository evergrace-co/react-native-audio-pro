export enum Event {
	/** Fired when an error occurs in the player. */
	PlayerError = 'player-error',
	/** Fired when the state of the player changes. */
	PlaybackState = 'playback-state',
	/** Fired when a playback error occurs. */
	PlaybackError = 'playback-error',
	/** Fired after playback has paused due to the queue having reached the end. */
	PlaybackQueueEnded = 'playback-queue-ended',
	/**
	 * Fired when another track has become active or when there no longer is an
	 * active track.
	 **/
	PlaybackActiveTrackChanged = 'playback-active-track-changed',
	/**
	 * Fired when playback play when ready has changed.
	 **/
	PlaybackPlayWhenReadyChanged = 'playback-play-when-ready-changed',
	/**
	 * Fired when playback progress has been updated.
	 * See https://rnap.dev/docs/api/events#playbackprogressupdated
	 **/
	PlaybackProgressUpdated = 'playback-progress-updated',
	/**
	 * Fired when the user presses the next track button.
	 * See https://rnap.dev/docs/api/events#remotenext
	 **/
	RemoteNext = 'remote-next',
	/**
	 * Fired when the user presses the previous track button.
	 * See https://rnap.dev/docs/api/events#remoteprevious
	 **/
	RemotePrevious = 'remote-previous',
	/**
	 * (Android only) Fired when the user presses the skip button.
	 * See https://rnap.dev/docs/api/events#remoteskip
	 **/
	RemoteSkip = 'remote-skip',
}
