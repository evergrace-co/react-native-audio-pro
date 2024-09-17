package dev.rnap.audiopro

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import androidx.media.session.MediaButtonReceiver
import androidx.core.app.NotificationCompat
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.MediaItem
import com.google.android.exoplayer2.Player

class AudioService : Service() {

    private lateinit var player: ExoPlayer
    private lateinit var wakeLock: PowerManager.WakeLock
    private val CHANNEL_ID = "AudioPro_Channel"

    override fun onCreate() {
        super.onCreate()
        initializePlayer()
        acquireWakeLock()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Handle intents for play/pause/stop actions
        MediaButtonReceiver.handleIntent(player, intent)
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        releasePlayer()
        releaseWakeLock()
        super.onDestroy()
    }

    private fun initializePlayer() {
        player = ExoPlayer.Builder(this).build()
        player.addListener(playerListener)
    }

    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(state: Int) {
            // Handle playback state changes
        }

        override fun onPlayerError(error: ExoPlaybackException) {
            // Handle player error
        }
    }

    private fun sendEvent(event: EventNames, params: WritableMap?) {
        // Use React Native's DeviceEventEmitter to send events
    }


    private fun releasePlayer() {
        player.release()
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "AudioPro::WakeLock"
        )
        wakeLock.acquire()
    }

    private fun releaseWakeLock() {
        if (wakeLock.isHeld) {
            wakeLock.release()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AudioPro Playback",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun startForegroundService() {
        val notification = buildNotification()
        startForeground(1, notification)
    }

    private fun buildNotification(): NotificationCompat.Builder {
        // Build notification with playback controls
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Track Title")
            .setContentText("Artist")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            // Add media style and actions
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        stopForeground(true)
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }
}
