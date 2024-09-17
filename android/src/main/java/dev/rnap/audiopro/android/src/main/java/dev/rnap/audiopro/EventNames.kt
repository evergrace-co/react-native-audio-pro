package dev.rnap.audiopro

enum class EventNames(val value: String) {
    ON_PLAY("onPlay"),
    ON_PAUSE("onPause"),
    ON_SKIP_TO_NEXT("onSkipToNext"),
    ON_SKIP_TO_PREVIOUS("onSkipToPrevious"),
    ON_BUFFERING("onBuffering"),
    ON_LOADING("onLoading"),
    ON_ERROR("onError"),
    ON_FINISHED("onFinished"),
    ON_DURATION_RECEIVED("onDurationReceived"),
    ON_SEEK("onSeek")
}
