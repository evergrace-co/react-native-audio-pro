"use strict";

import { useShallow } from 'zustand/shallow';
import { internalStore } from "./internalStore.js";
const selectAll = state => ({
  state: state.playerState,
  position: state.position,
  duration: state.duration,
  playingTrack: state.trackPlaying,
  playbackSpeed: state.playbackSpeed,
  volume: state.volume,
  isRepeating: state.isRepeating,
  error: state.error
});
const select = internalStore;

/**
 * React hook for accessing the current state of the audio player.
 *
 * When used without arguments, it subscribes to all player state values.
 * To avoid unnecessary re-renders, you may pass a selector function to
 * subscribe only to the specific piece of state your component needs.
 */

export function useAudioPro(selector, equalityFn) {
  const selectAllWithShallow = useShallow(selectAll);
  if (selector) {
    return select(selector, equalityFn);
  }
  return internalStore(selectAllWithShallow);
}
//# sourceMappingURL=useAudioPro.js.map