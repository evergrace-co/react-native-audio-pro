package co.evergrace.audiopro.models

import android.app.PendingIntent

/**
 * Used to configure the player notification.
 * @param pendingIntent The [PendingIntent] that would be called when tapping on the notification itself.
 */
data class NotificationConfig(
    val pendingIntent: PendingIntent? = null
)

