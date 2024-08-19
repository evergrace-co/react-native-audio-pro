export enum Event {
  PlayerError = 'player-error',

  /** Fired when the state of the player changes. */
  PlaybackState = 'playback-state',
  /** Fired when a playback error occurs. */
  PlaybackError = 'playback-error',
  /** Fired after playback has paused due to the queue having reached the end. */
  PlaybackQueueEnded = 'playback-queue-ended',
  /**
   * Fired when another track has become active or when there is no longer is an
   * active track.
   **/
  PlaybackActiveTrackChanged = 'playback-active-track-changed',
  /**
   * Fired when playback play when ready has changed.
   **/
  PlaybackPlayWhenReadyChanged = 'playback-play-when-ready-changed',
  /**
   * Fired when playback progress has been updated.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#playbackprogressupdated
   **/
  PlaybackProgressUpdated = 'playback-progress-updated',
  /**
   * Fired when the user presses the play button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remoteplay
   **/
  RemotePlay = 'remote-play',
  /**
   * Fired when the user presses the pause button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remotepause
   **/
  RemotePause = 'remote-pause',
  /**
   * Fired when the user presses the stop button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remotestop
   **/
  RemoteStop = 'remote-stop',
  /**
   * Fired when the user presses the next track button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remotenext
   **/
  RemoteNext = 'remote-next',
  /**
   * Fired when the user presses the previous track button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remoteprevious
   **/
  RemotePrevious = 'remote-previous',
  /**
   * Fired when the user presses the jump forward button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remotejumpforward
   **/
  RemoteJumpForward = 'remote-jump-forward',
  /**
   * Fired when the user presses the jump backward button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remotejumpbackward
   **/
  RemoteJumpBackward = 'remote-jump-backward',
  /**
   * Fired when the user changes the position of the timeline.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remoteseek
   **/
  RemoteSeek = 'remote-seek',
  /**
   * Fired when the app needs to handle an audio interruption.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remoteduck
   **/
  RemoteDuck = 'remote-duck',
  /**
   * (Android only) Fired when the user presses the skip button.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#remoteskip
   **/
  RemoteSkip = 'remote-skip',
  /**
   * (iOS only) Fired when chapter metadata is received.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#chaptermetadatareceived
   **/
  MetadataChapterReceived = 'metadata-chapter-received',
  /**
   * Fired when metadata is received at a specific time in the audio.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#timedmetadatareceived
   **/
  MetadataTimedReceived = 'metadata-timed-received',
  /**
   * Fired when common (static) metadata is received.
   * See https://evergrace-co.github.io/react-native-audio-pro/docs/api/events#commonmetadatareceived
   **/
  MetadataCommonReceived = 'metadata-common-received',
}
