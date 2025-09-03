package dev.rnap.reactnativeaudiopro

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.pm.PackageManager
import android.os.Build
import androidx.annotation.OptIn
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.os.bundleOf
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.datasource.DataSource
import androidx.media3.exoplayer.util.EventLogger
import androidx.media3.session.MediaConstants
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSession.ControllerInfo

open class AudioProPlaybackService : MediaLibraryService() {

	private lateinit var mediaLibrarySession: MediaLibrarySession

	companion object {
		private const val NOTIFICATION_ID = 789
		private const val CHANNEL_ID = "audio_pro_notification_channel_id"
	}

	/**
	 * Brings app to foreground when notification or session is tapped.
	 *
	 * This method is used by the notification and session to provide an intent that brings the app
	 * to the foreground. Typically, this intent will launch the main activity with appropriate flags
	 * to avoid creating multiple instances.
	 *
	 * If null is returned, [MediaSession.setSessionActivity] is not set by the service.
	 */
	fun getSessionActivityIntent(): PendingIntent? {
		val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
			action = android.content.Intent.ACTION_MAIN
			addCategory(android.content.Intent.CATEGORY_LAUNCHER)
			flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or
				android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
		}
		return launchIntent?.let {
			PendingIntent.getActivity(
				this,
				0,
				it,
				PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
			)
		}
	}

	/**
	 * Creates the library session callback to implement the domain logic. Can be overridden to return
	 * an alternative callback, for example a subclass of [AudioProMediaLibrarySessionCallback].
	 *
	 * This method is called when the session is built by the [AudioProPlaybackService].
	 */
	@OptIn(UnstableApi::class)
	protected open fun createLibrarySessionCallback(): MediaLibrarySession.Callback {
		return AudioProMediaLibrarySessionCallback()
	}

	@OptIn(UnstableApi::class) // MediaSessionService.setListener
	override fun onCreate() {
		super.onCreate()
		startForegroundService()
		initializeSessionAndPlayer()
		setListener(MediaSessionServiceListener())
	}

	override fun onGetSession(controllerInfo: ControllerInfo): MediaLibrarySession {
		return mediaLibrarySession
	}

	private fun startForegroundService() {
		val notificationManagerCompat = NotificationManagerCompat.from(this)
		ensureNotificationChannel(notificationManagerCompat)

		val builder = NotificationCompat.Builder(this, CHANNEL_ID)
			.setSmallIcon(android.R.drawable.ic_media_play)
			.setContentTitle("Audio")
			.setContentText("Playing...")
			.setPriority(NotificationCompat.PRIORITY_MAX)
			.setOngoing(true)
			.also { builder -> getSessionActivityIntent()?.let { builder.setContentIntent(it) } }

		startForeground(NOTIFICATION_ID, builder.build())
	}

	/**
	 * Called when the task is removed from the recent tasks list
	 * This happens when the user swipes away the app from the recent apps list
	 */
	override fun onTaskRemoved(rootIntent: android.content.Intent?) {
		android.util.Log.d("AudioProPlaybackService", "Task removed, stopping service")

		// Force stop playback and release resources
		try {
			if (::mediaLibrarySession.isInitialized) {
				// Stop playback
				mediaLibrarySession.player.stop()
				// Release player and session
				mediaLibrarySession.player.release()
				mediaLibrarySession.release()
			}
		} catch (e: Exception) {
			android.util.Log.e("AudioProPlaybackService", "Error stopping playback", e)
		}

		// Remove notification and stop service
		removeNotificationAndStopService()

		super.onTaskRemoved(rootIntent)
	}

	// MediaSession.setSessionActivity
	// MediaSessionService.clearListener
	@OptIn(UnstableApi::class)
	override fun onDestroy() {
		android.util.Log.d("AudioProPlaybackService", "Service being destroyed")

		// Make sure to release all resources
		try {
			if (::mediaLibrarySession.isInitialized) {
				// Stop playback first
				mediaLibrarySession.player.stop()
				// Release session and player
				mediaLibrarySession.release()
				mediaLibrarySession.player.release()
			}
			clearListener()
		} catch (e: Exception) {
			android.util.Log.e("AudioProPlaybackService", "Error during service destruction", e)
		}

		// Remove notification
		removeNotificationAndStopService()

		super.onDestroy()
	}

	/**
	 * Helper method to remove notification and stop the service
	 * Centralizes the notification removal and service stopping logic
	 */
	private fun removeNotificationAndStopService() {
		try {
			// Remove notification directly
			val notificationManager =
				getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
			notificationManager.cancel(NOTIFICATION_ID)

			// Stop foreground service - handle API level differences
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
				// For Android 12 (API 31) and above, use the new API
				stopForeground(STOP_FOREGROUND_REMOVE)
			} else {
				// For older Android versions, use the deprecated API
				@Suppress("DEPRECATION")
				stopForeground(true)
			}

			// Stop the service
			stopSelf()
		} catch (e: Exception) {
			android.util.Log.e("AudioProPlaybackService", "Error stopping service", e)
		}
	}

	@OptIn(UnstableApi::class)
	private fun initializeSessionAndPlayer() {
		// Create a composite data source factory that can handle both HTTP and file URIs
		val dataSourceFactory = object : DataSource.Factory {
			override fun createDataSource(): DataSource {
				// Create HTTP data source factory with custom headers if available
				val httpDataSourceFactory = DefaultHttpDataSource.Factory()

				// Apply custom headers if they exist
				AudioProController.headersAudio?.let { headers ->
					if (headers.isNotEmpty()) {
						httpDataSourceFactory.setDefaultRequestProperties(headers)
						android.util.Log.d(
							"AudioProPlaybackService",
							"Applied custom headers: $headers"
						)
					}
				}

				// Create a DefaultDataSource that will handle both HTTP and file URIs
				// It will delegate to FileDataSource for file:// URIs and to HttpDataSource for http(s):// URIs
				return DefaultDataSource.Factory(applicationContext, httpDataSourceFactory)
					.createDataSource()
			}
		}

		val mediaSourceFactory = DefaultMediaSourceFactory(dataSourceFactory)

		val player =
			ExoPlayer.Builder(this)
				.setMediaSourceFactory(mediaSourceFactory)
				.setAudioAttributes(
					AudioAttributes.Builder()
						.setUsage(C.USAGE_MEDIA)
						.setContentType(AudioProController.settingAudioContentType)
						.build(),
					/* handleAudioFocus = */ true
				)
				.build()
		player.setHandleAudioBecomingNoisy(true)
		player.repeatMode = Player.REPEAT_MODE_OFF
		player.addAnalyticsListener(EventLogger())

		mediaLibrarySession =
			MediaLibrarySession.Builder(this, player, createLibrarySessionCallback())
				.also { builder -> getSessionActivityIntent()?.let { builder.setSessionActivity(it) } }
				.build()
				.also { mediaLibrarySession ->
					// Reserve only one set of controls per session: next/prev or skip, not both.
					// If both are true, prefer next/prev and log a warning.
					val extras = mutableMapOf<String, Boolean>()
					val showNextPrev = AudioProController.settingShowNextPrevControls
					val showSkip = AudioProController.settingShowSkipControls
					if (showNextPrev && showSkip) {
						android.util.Log.w(
							"AudioProPlaybackService",
							"Both settingShowNextPrevControls and settingShowSkipControls are true; only next/prev controls will be enabled for this session."
						)
					}
					// Only one set of controls can be active at a time.
					if (showNextPrev) {
						// Reserve next/prev (seek) slots and advertise only next/prev commands.
						extras[MediaConstants.EXTRAS_KEY_SLOT_RESERVATION_SEEK_TO_PREV] = true
						extras[MediaConstants.EXTRAS_KEY_SLOT_RESERVATION_SEEK_TO_NEXT] = true
					} else if (showSkip) {
						// Reserve skip/seek slots and advertise only fast forward/back commands.
						extras[MediaConstants.EXTRAS_KEY_SLOT_RESERVATION_SEEK_TO_PREV] = true
						extras[MediaConstants.EXTRAS_KEY_SLOT_RESERVATION_SEEK_TO_NEXT] = true
					}
					// If neither, explicitly clear all session extras to remove notification control slots.
					// This ensures that when neither next/prev nor skip controls are enabled,
					// no control slots are reserved and only play/pause is advertised.
					if (extras.isNotEmpty()) {
						mediaLibrarySession.setSessionExtras(bundleOf(*extras.entries.map { it.key to it.value }
							.toTypedArray()))
					} else {
						// Explicitly clear extras.
						mediaLibrarySession.setSessionExtras(bundleOf())
					}
				}
	}

	@OptIn(UnstableApi::class) // MediaSessionService.Listener
	private inner class MediaSessionServiceListener : Listener {

		/**
		 * This method is only required to be implemented on Android 12 or above when an attempt is made
		 * by a media controller to resume playback when the {@link MediaSessionService} is in the
		 * background.
		 */
		@RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
		override fun onForegroundServiceStartNotAllowedException() {
			if (
				Build.VERSION.SDK_INT >= 33 &&
				checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) !=
				PackageManager.PERMISSION_GRANTED
			) {
				// Notification permission is required but not granted
				return
			}
                        val notificationManagerCompat =
                                NotificationManagerCompat.from(this@AudioProPlaybackService)
                        ensureNotificationChannel(notificationManagerCompat)
                        val builder =
                                NotificationCompat.Builder(this@AudioProPlaybackService, CHANNEL_ID)
                                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                                        .setAutoCancel(true)
                                        .also { builder ->
                                                getSessionActivityIntent()?.let {
                                                        builder.setContentIntent(it)
                                                }
                                        }
                        notificationManagerCompat.notify(NOTIFICATION_ID, builder.build())
                }
        }

	private fun ensureNotificationChannel(notificationManagerCompat: NotificationManagerCompat) {
		val channel =
			NotificationChannel(
				CHANNEL_ID,
				"audio_pro_notification_channel",
				NotificationManager.IMPORTANCE_DEFAULT,
			)
		notificationManagerCompat.createNotificationChannel(channel)
	}
}
