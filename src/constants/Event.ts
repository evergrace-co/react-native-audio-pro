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
	 *
	 * @deprecated use `playback-active-track-changed` instead.
	 **/
	PlaybackTrackChanged = 'playback-track-changed',
	/**
	 * Fired when another track has become active or when there no longer is an
	 * active track.
	 **/
	PlaybackActiveTrackChanged = 'playback-active-track-changed',
	/**
	 * Fired when the current track receives metadata encoded in. (e.g. ID3 tags,
	 * Icy Metadata, Vorbis Comments or QuickTime metadata).
	 * @deprecated use `AudioChapterMetadataReceived, AudioTimedMetadataReceived, AudioCommonMetadataReceived` instead.
	 **/
	PlaybackMetadataReceived = 'playback-metadata-received',
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
	 * Fired when the user presses the play button.
	 * See https://rnap.dev/docs/api/events#remoteplay
	 **/
	RemotePlay = 'remote-play',
	/**
	 * Fired when the user presses the pause button.
	 * See https://rnap.dev/docs/api/events#remotepause
	 **/
	RemotePause = 'remote-pause',
	/**
	 * Fired when the user presses the stop button.
	 * See https://rnap.dev/docs/api/events#remotestop
	 **/
	RemoteStop = 'remote-stop',
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
	 * Fired when the user presses the jump forward button.
	 * See https://rnap.dev/docs/api/events#remotejumpforward
	 **/
	RemoteJumpForward = 'remote-jump-forward',
	/**
	 * Fired when the user presses the jump backward button.
	 * See https://rnap.dev/docs/api/events#remotejumpbackward
	 **/
	RemoteJumpBackward = 'remote-jump-backward',
	/**
	 * Fired when the user changes the position of the timeline.
	 * See https://rnap.dev/docs/api/events#remoteseek
	 **/
	RemoteSeek = 'remote-seek',
	/**
	 * Fired when the app needs to handle an audio interruption.
	 * See https://rnap.dev/docs/api/events#remoteduck
	 **/
	RemoteDuck = 'remote-duck',
	/**
	 * (Android only) Fired when the user presses the skip button.
	 * See https://rnap.dev/docs/api/events#remoteskip
	 **/
	RemoteSkip = 'remote-skip',
	/**
	 * (iOS only) Fired when chapter metadata is received.
	 * See https://rnap.dev/docs/api/events#chaptermetadatareceived
	 **/
	MetadataChapterReceived = 'metadata-chapter-received',
	/**
	 * Fired when metadata is received at a specific time in the audio.
	 * See https://rnap.dev/docs/api/events#timedmetadatareceived
	 **/
	MetadataTimedReceived = 'metadata-timed-received',
	/**
	 * Fired when common (static) metadata is received.
	 * See https://rnap.dev/docs/api/events#commonmetadatareceived
	 **/
	MetadataCommonReceived = 'metadata-common-received',
}
