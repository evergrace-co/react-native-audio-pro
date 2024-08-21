export enum HandledEvent {
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
}
