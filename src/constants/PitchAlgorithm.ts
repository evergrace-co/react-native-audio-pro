import AudioPro from '../AudioProModule';

export enum PitchAlgorithm {
  /**
   * A high-quality time pitch algorithm that doesn’t perform pitch correction.
   * */
  Linear = AudioPro.PITCH_ALGORITHM_LINEAR,
  /**
   * A highest-quality time pitch algorithm that’s suitable for music.
   **/
  Music = AudioPro.PITCH_ALGORITHM_MUSIC,
  /**
   * A modest quality time pitch algorithm that’s suitable for voice.
   **/
  Voice = AudioPro.PITCH_ALGORITHM_VOICE,
}
