package co.evergrace.audiopro.models

sealed class MediaSessionCallback {
    object PLAY : MediaSessionCallback()
    object PAUSE : MediaSessionCallback()
    object NEXT : MediaSessionCallback()
    object PREVIOUS : MediaSessionCallback()
    object FORWARD : MediaSessionCallback()
    object REWIND : MediaSessionCallback()
    object STOP : MediaSessionCallback()
    class SEEK(val positionMs: Long): MediaSessionCallback()
}
