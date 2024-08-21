package co.evergrace.kotlinaudiopro.models

enum class PlaybackEndedReason {
    PLAYED_UNTIL_END, PLAYER_STOPPED, SKIPPED_TO_NEXT, SKIPPED_TO_PREVIOUS, JUMPED_TO_INDEX
}
