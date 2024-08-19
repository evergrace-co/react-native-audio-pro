import AudioPro from '../AudioProModule';

export enum Capability {
  Play = AudioPro.CAPABILITY_PLAY,
  PlayFromId = AudioPro.CAPABILITY_PLAY_FROM_ID,
  PlayFromSearch = AudioPro.CAPABILITY_PLAY_FROM_SEARCH,
  Pause = AudioPro.CAPABILITY_PAUSE,
  Stop = AudioPro.CAPABILITY_STOP,
  SeekTo = AudioPro.CAPABILITY_SEEK_TO,
  Skip = AudioPro.CAPABILITY_SKIP,
  SkipToNext = AudioPro.CAPABILITY_SKIP_TO_NEXT,
  SkipToPrevious = AudioPro.CAPABILITY_SKIP_TO_PREVIOUS,
  JumpForward = AudioPro.CAPABILITY_JUMP_FORWARD,
  JumpBackward = AudioPro.CAPABILITY_JUMP_BACKWARD,
  SetRating = AudioPro.CAPABILITY_SET_RATING,
  Like = AudioPro.CAPABILITY_LIKE,
  Dislike = AudioPro.CAPABILITY_DISLIKE,
  Bookmark = AudioPro.CAPABILITY_BOOKMARK,
}
