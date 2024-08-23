package co.evergrace.audiopro.event

class EventHolder internal constructor(private val notificationEventHolder: NotificationEventHolder, private val playerEventHolder: PlayerEventHolder) {
    val audioItemTransition
        get() = playerEventHolder.audioItemTransition

    val notificationStateChange
        get() = notificationEventHolder.notificationStateChange

    val onAudioFocusChanged
        get() = playerEventHolder.onAudioFocusChanged

    val onPlayerActionTriggeredExternally
        get() = playerEventHolder.onPlayerActionTriggeredExternally

    val playbackEnd
        get() = playerEventHolder.playbackEnd

    val playWhenReadyChange
        get() = playerEventHolder.playWhenReadyChange

    val stateChange
        get() = playerEventHolder.stateChange

    val playbackError
        get() = playerEventHolder.playbackError
}
