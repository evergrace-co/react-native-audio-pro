import AudioPro from '../AudioProModule';

export enum RepeatMode {
  /** Playback stops when the last track in the queue has finished playing. */
  Off = AudioPro.REPEAT_OFF,
  /** Repeats the current track infinitely during ongoing playback. */
  Track = AudioPro.REPEAT_TRACK,
  /** Repeats the entire queue infinitely. */
  Queue = AudioPro.REPEAT_QUEUE,
}
