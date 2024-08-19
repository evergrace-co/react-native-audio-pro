import AudioPro from '../AudioProModule';

export enum Capability {
  Play = AudioPro.CAPABILITY_PLAY,
  Pause = AudioPro.CAPABILITY_PAUSE,
  Stop = AudioPro.CAPABILITY_STOP,
  SeekTo = AudioPro.CAPABILITY_SEEK_TO,
  Skip = AudioPro.CAPABILITY_SKIP,
  SkipToNext = AudioPro.CAPABILITY_SKIP_TO_NEXT,
  SkipToPrevious = AudioPro.CAPABILITY_SKIP_TO_PREVIOUS,
  JumpForward = AudioPro.CAPABILITY_JUMP_FORWARD,
  JumpBackward = AudioPro.CAPABILITY_JUMP_BACKWARD,
}