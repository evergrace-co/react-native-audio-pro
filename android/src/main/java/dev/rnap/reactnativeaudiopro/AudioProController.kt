package dev.rnap.reactnativeaudiopro

import android.content.ComponentName
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.net.toUri
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.session.MediaBrowser
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.guava.await

object AudioProController {
	private var reactContext: ReactApplicationContext? = null
	private lateinit var engineBrowserFuture: ListenableFuture<MediaBrowser>
	private var enginerBrowser: MediaBrowser? = null
	private var engineBrowserConnecting: Boolean = false
	private var engineProgressHandler: Handler? = null
	private var engineProgressRunnable: Runnable? = null
	private var enginePlayerListener: Player.Listener? = null
	private val engineBrowserConnectionListener =
		object : MediaBrowser.Listener {
			override fun onDisconnected(controller: MediaController) {
				log("MediaBrowser disconnected, clearing cached instance")
				handleBrowserDisconnected(controller)
			}
		}

	private var activeTrack: ReadableMap? = null
	private var activeVolume: Float = 1.0f
	private var activePlaybackSpeed: Float = 1.0f

	private var flowIsInErrorState: Boolean = false
	private var flowLastEmittedState: String = ""
	private var flowLastStateEmittedTimeMs: Long = 0L
	private var flowPendingSeekPosition: Long? = null

	private var settingDebug: Boolean = false
	private var settingDebugIncludesProgress: Boolean = false
	private var settingProgressIntervalMs: Long = 1000
	var settingAudioContentType: Int = C.AUDIO_CONTENT_TYPE_MUSIC
	var settingShowNextPrevControls: Boolean = true
	var settingShowSkipControls: Boolean = false
	var settingSkipIntervalMs: Long = 30000L

	var headersAudio: Map<String, String>? = null
	var headersArtwork: Map<String, String>? = null

	fun log(vararg args: Any?) {
		if (settingDebug) {
			if (!settingDebugIncludesProgress && args.isNotEmpty() && args[0] == AudioProModule.EVENT_TYPE_PROGRESS) {
				return
			}
			Log.d("[react-native-audio-pro]", args.joinToString(" "))
		}
	}

	fun setReactContext(context: ReactApplicationContext?) {
		reactContext = context
	}

	private fun ensureSession() {
		if (!engineBrowserConnecting && (!::engineBrowserFuture.isInitialized || !hasConnectedBrowser())) {
			CoroutineScope(Dispatchers.Main).launch {
				internalPrepareSession()
			}
		}
	}

	private fun hasConnectedBrowser(): Boolean {
		return enginerBrowser?.isConnected == true
	}

	private fun handleBrowserDisconnected(controller: MediaController) {
		runOnUiThread {
			// Only clear if we're dealing with the active controller reference
			if (enginerBrowser == controller) {
				detachPlayerListener()
				stopProgressTimer()
				if (::engineBrowserFuture.isInitialized) {
					MediaBrowser.releaseFuture(engineBrowserFuture)
				}
				enginerBrowser = null
				engineBrowserConnecting = false
			} else {
				log(
					"Ignoring disconnect from stale MediaBrowser instance. Active=$enginerBrowser, disconnected=$controller"
				)
			}
		}
	}

	private suspend fun internalPrepareSession() {
		if (engineBrowserConnecting) {
			return
		}
		engineBrowserConnecting = true
		try {
			if (::engineBrowserFuture.isInitialized) {
				MediaBrowser.releaseFuture(engineBrowserFuture)
			}
			if (enginerBrowser != null) {
				detachPlayerListener()
				enginerBrowser = null
			}
			if (hasConnectedBrowser()) {
				// Another concurrent initializer may have already connected.
				return
			}
			val context = reactContext ?: run {
				log("React context unavailable, skipping MediaBrowser initialization")
				return
			}
			log("Preparing MediaBrowser session")
			val token =
				SessionToken(
					context,
					ComponentName(context, AudioProPlaybackService::class.java)
				)
			engineBrowserFuture =
				MediaBrowser.Builder(context, token)
					.setListener(engineBrowserConnectionListener)
					.buildAsync()
			enginerBrowser = engineBrowserFuture.await()
			attachPlayerListener()
			log("MediaBrowser is ready")
		} finally {
			engineBrowserConnecting = false
		}
	}

	// Data class to hold parsed play options
	private data class PlaybackOptions(
		val contentType: String,
		val enableDebug: Boolean,
		val includeProgressInDebug: Boolean,
		val speed: Float,
		val volume: Float,
		val autoPlay: Boolean,
		val startTimeMs: Long?,
		val progressIntervalMs: Long,
		val showNextPrevControls: Boolean,
		val showSkipControls: Boolean,
		val skipIntervalMs: Long,
	)

	// Extracts and applies play options from JS before playback
	// Enforces mutual exclusivity between next/prev and skip controls for session config.
	private fun extractPlaybackOptions(options: ReadableMap): PlaybackOptions {
		val contentType = if (options.hasKey("contentType")) {
			options.getString("contentType") ?: "MUSIC"
		} else "MUSIC"
		val enableDebug = options.hasKey("debug") && options.getBoolean("debug")
		val includeProgressInDebug =
			options.hasKey("debugIncludesProgress") && options.getBoolean("debugIncludesProgress")
		val speed = if (options.hasKey("playbackSpeed")) options.getDouble("playbackSpeed")
			.toFloat() else 1.0f
		val volume = if (options.hasKey("volume")) options.getDouble("volume").toFloat() else 1.0f
		val autoPlay = if (options.hasKey("autoPlay")) options.getBoolean("autoPlay") else true
		val startTimeMs =
			if (options.hasKey("startTimeMs")) options.getDouble("startTimeMs").toLong() else null
		val progressInterval =
			if (options.hasKey("progressIntervalMs")) options.getDouble("progressIntervalMs")
				.toLong() else 1000L
		val showControls =
			if (options.hasKey("showNextPrevControls")) options.getBoolean("showNextPrevControls") else true
		val showSkip =
			if (options.hasKey("showSkipControls")) options.getBoolean("showSkipControls") else true
		val skipIntervalMs =
			if (options.hasKey("skipIntervalMs")) options.getDouble("skipIntervalMs").toLong() else 30000L

		// Warn if showNextPrevControls is changed after session initialization
		if (::engineBrowserFuture.isInitialized && enginerBrowser != null && showControls != settingShowNextPrevControls) {
			Log.w(
				"[react-native-audio-pro]",
				"showNextPrevControls changed mid-session; call clear() before changing."
			)
		}
		// Warn if showSkipControls is changed after session initialization
		if (::engineBrowserFuture.isInitialized && enginerBrowser != null && showSkip != settingShowSkipControls) {
			Log.w(
				"[react-native-audio-pro]",
				"showSkipControls changed mid-session; call clear() before changing."
			)
		}

		// Enforce mutual exclusivity for session config: only one set of controls is enabled.
		var resolvedShowNextPrev = showControls
		var resolvedShowSkip = showSkip
		if (showControls && showSkip) {
			// If both are requested, prefer next/prev and log a warning.
			Log.w(
				"[react-native-audio-pro]",
				"Both showNextPrevControls and showSkipControls are true; only next/prev controls will be enabled for this session."
			)
			resolvedShowSkip = false
		}

		// Apply to controller state
		settingDebug = enableDebug
		settingDebugIncludesProgress = includeProgressInDebug
		settingAudioContentType = when (contentType) {
			"SPEECH" -> C.AUDIO_CONTENT_TYPE_SPEECH
			else -> C.AUDIO_CONTENT_TYPE_MUSIC
		}
		activePlaybackSpeed = speed
		activeVolume = volume
		settingProgressIntervalMs = progressInterval
		settingShowNextPrevControls = resolvedShowNextPrev
		settingShowSkipControls = resolvedShowSkip
		settingSkipIntervalMs = skipIntervalMs

		return PlaybackOptions(
			contentType,
			enableDebug,
			includeProgressInDebug,
			speed,
			volume,
			autoPlay,
			startTimeMs,
			progressInterval,
			resolvedShowNextPrev,
			resolvedShowSkip,
			skipIntervalMs,
		)
	}

	/**
	 * Prepares the player for new playback without emitting state changes or destroying the media session
	 * - This function:
	 * - Pauses the player if it's playing
	 * - Stops the progress timer
	 * - Does not emit any state or clear currentTrack
	 * - Does not destroy the media session
	 */
	private fun prepareForNewPlayback() {
		log("Preparing for new playback")

		runOnUiThread {
			enginerBrowser?.pause()
		}

		stopProgressTimer()

		flowPendingSeekPosition = null
		flowIsInErrorState = false
		flowLastEmittedState = ""
	}

	suspend fun play(track: ReadableMap, options: ReadableMap) {
		val opts = extractPlaybackOptions(options)

		ensurePreparedForNewPlayback()
		activeTrack = track

                // If startTimeMs is provided, set a pending seek position
                if (opts.startTimeMs != null) {
                        flowPendingSeekPosition = opts.startTimeMs
                }

		log(
			"Configured with " +
				"contentType=${opts.contentType} " +
				"enableDebug=${opts.enableDebug} " +
				"includeProgressInDebug=${opts.includeProgressInDebug} " +
				"speed=${opts.speed} " +
				"volume=${opts.volume} " +
				"autoPlay=${opts.autoPlay} " +
				"startTimeMs=${opts.startTimeMs} " +
				"progressIntervalMs=${opts.progressIntervalMs} " +
				"showNextPrevControls=${opts.showNextPrevControls} " +
				"showSkipControls=${opts.showSkipControls} " +
				"skipIntervalMs=${opts.skipIntervalMs}"
		)

		val url = track.getString("url") ?: run {
			log("Missing track URL")
			return
		}

		val title = track.getString("title") ?: "Unknown Title"
		val artist = track.getString("artist") ?: "Unknown Artist"
		val album = track.getString("album") ?: "Unknown Album"
		val artwork = track.getString("artwork")?.toUri()

		val metadataBuilder = MediaMetadata.Builder()
			.setTitle(title)
			.setArtist(artist)
			.setAlbumTitle(album)

		if (artwork != null) {
			metadataBuilder.setArtworkUri(artwork)
		}

		// Process custom headers if provided
		headersAudio = null
		headersArtwork = null

		if (options.hasKey("headers")) {
			val headers = options.getMap("headers")
			if (headers != null) {
				headersAudio = extractHeaders(headers.getMap("audio"))
				headersArtwork = extractHeaders(headers.getMap("artwork"))
			}
		}

		// Parse the URL string into a Uri object to properly handle all URI schemes including file://
		val uri = url.toUri()
		log("Parsed URI: $uri, scheme: ${uri.scheme}")

		val mediaItem = MediaItem.Builder()
			.setUri(uri)
			.setMediaId("custom_track_1")
			.setMediaMetadata(metadataBuilder.build())
			.build()

		runOnUiThread {
			log("Play", title, url)
			emitState(AudioProModule.STATE_LOADING, 0L, 0L, "play()")

			enginerBrowser?.let {
				// Set the new media item and prepare the player
				it.setMediaItem(mediaItem)
				it.prepare()

				// Set playback speed regardless of autoPlay
				it.setPlaybackSpeed(opts.speed)
				// Set volume regardless of autoPlay
				it.setVolume(opts.volume)

				if (opts.autoPlay) {
					it.play()
				} else {
					emitState(AudioProModule.STATE_PAUSED, 0L, 0L, "play(autoPlay=false)")
				}
			} ?: Log.w("[react-native-audio-pro]", "MediaBrowser not ready")
		}
	}

	fun pause() {
		log("pause() called")
		ensureSession()
		runOnUiThread {
			enginerBrowser?.pause()
			enginerBrowser?.let {
				val pos = it.currentPosition
				val dur = it.duration.takeIf { d -> d > 0 } ?: 0L
				emitState(AudioProModule.STATE_PAUSED, pos, dur, "pause()")
			}
		}
	}

	fun resume() {
		log("resume() called")
		ensureSession()
		runOnUiThread {
			enginerBrowser?.play()
			enginerBrowser?.let {
				val pos = it.currentPosition
				val dur = it.duration.takeIf { d -> d > 0 } ?: 0L
				emitState(AudioProModule.STATE_PLAYING, pos, dur, "resume()")
			}
		}
	}

	fun stop() {
		log("stop() called")
		// Reset error state when explicitly stopping
		flowIsInErrorState = false
		// Reset last emitted state when stopping playback
		flowLastEmittedState = ""
		ensureSession()
		runOnUiThread {
			// Do not detach player listener to ensure lock screen controls still work
			// and state changes are emitted when playback is resumed from lock screen

			enginerBrowser?.stop()
			enginerBrowser?.seekTo(0)
			enginerBrowser?.let {
				// Use position 0 for STOPPED state as per logic.md contract
				val dur = it.duration.takeIf { d -> d > 0 } ?: 0L
				// Do not set currentTrack = null as STOPPED state should preserve track metadata
				emitState(AudioProModule.STATE_STOPPED, 0L, dur, "stop()")
			}
		}
		stopProgressTimer()

		// Cancel any pending seek operations
		flowPendingSeekPosition = null

		// Do not call release() as stop() should not tear down the player
		// Only clear() and unrecoverable onError() should call release()

		// Do not destroy the playback service in stop() as it should maintain the media session
		// stop() is a non-destructive state that stops playback and seeks to 0,
		// but retains lock screen info, current track, and player state
	}

	/**
	 * Resets the player to IDLE state, fully tears down the player instance,
	 * and removes all media sessions.
	 */
	fun clear() {
		resetInternal(AudioProModule.STATE_IDLE)
	}

	/**
	 * Ensures the session is ready and prepares for new playback.
	 */
	private suspend fun ensurePreparedForNewPlayback() {
		if (!hasConnectedBrowser()) {
			internalPrepareSession()
		}
		prepareForNewPlayback()
	}

	/**
	 * Shared internal function that performs the teardown and emits the correct state.
	 * Used by both clear() and error transitions.
	 */
	private fun resetInternal(finalState: String) {
		log("Reset internal, final state: $finalState")

		// Reset error state
		flowIsInErrorState = finalState == AudioProModule.STATE_ERROR
		// Reset last emitted state
		flowLastEmittedState = ""

		// Clear pending seek state
		flowPendingSeekPosition = null

		// Stop playback and ensure player is fully released before destroying service
		runOnUiThread {
			try {
				// First stop playback
				enginerBrowser?.stop()
				// Then detach listener to prevent callbacks during teardown
				detachPlayerListener()
				// Ensure player is released
				enginerBrowser?.release()
				log("Player successfully stopped and released")
			} catch (e: Exception) {
				Log.e("[react-native-audio-pro]", "Error stopping player", e)
			}
		}

		// Clear track and stop timers
		activeTrack = null
		stopProgressTimer()

		// Reset playback settings
		activePlaybackSpeed = 1.0f
		activeVolume = 1.0f

		// Release resources
		release()

		// Add a small delay before destroying service to ensure player is fully released
		Handler(Looper.getMainLooper()).postDelayed({
			// Destroy the playback service to remove notification and tear down the media session
			destroyPlaybackService()
		}, 50)

		// Emit final state
		emitState(finalState, 0L, 0L, "resetInternal($finalState)")
	}

	fun release() {
		runOnUiThread {
			if (::engineBrowserFuture.isInitialized) {
				MediaBrowser.releaseFuture(engineBrowserFuture)
			}
			enginerBrowser = null
			engineBrowserConnecting = false
		}
	}

	/**
	 * Explicitly destroys the AudioProPlaybackService to remove notification and tear down the media session
	 * This is the central method for destroying the service and removing the notification
	 * It should only be called from clear() and unrecoverable error scenarios, not from stop()
	 */
	fun destroyPlaybackService() {
		log("Destroying AudioProPlaybackService")
		try {
			reactContext?.let { context ->
				// Try to cancel notification directly
				try {
					val notificationManager =
						context.getSystemService(android.content.Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
					notificationManager.cancel(789) // Using the same NOTIFICATION_ID as in AudioProPlaybackService
				} catch (e: Exception) {
					Log.e("[react-native-audio-pro]", "Error canceling notification", e)
				}

				// Stop the service
				val intent = android.content.Intent(context, AudioProPlaybackService::class.java)
				context.stopService(intent)
			}
		} catch (e: Exception) {
			Log.e("[react-native-audio-pro]", "Error stopping service", e)
		}
	}


	fun seekTo(position: Long) {
		ensureSession()
		runOnUiThread {
			val dur = enginerBrowser?.duration ?: 0L
			val validPosition = when {
				position < 0 -> 0L
				position > dur -> dur
				else -> position
			}

			// Set pending seek position
			flowPendingSeekPosition = validPosition

			// Stop progress timer during seek
			stopProgressTimer()

			log("Seeking to position: $validPosition")
			enginerBrowser?.seekTo(validPosition)

			// SEEK_COMPLETE will be emitted in onPositionDiscontinuity
		}
	}

	fun seekForward(amount: Long) {
		runOnUiThread {
			val current = enginerBrowser?.currentPosition ?: 0L
			val dur = enginerBrowser?.duration ?: 0L
			val newPos = (current + amount).coerceAtMost(dur)

			log("Seeking forward to position: $newPos")
			seekTo(newPos)
		}
	}

	fun seekBack(amount: Long) {
		runOnUiThread {
			val current = enginerBrowser?.currentPosition ?: 0L
			val newPos = (current - amount).coerceAtLeast(0L)

			log("Seeking back to position: $newPos")
			seekTo(newPos)
		}
	}

	fun detachPlayerListener() {
		log("Detaching player listener")
		enginePlayerListener?.let {
			enginerBrowser?.removeListener(it)
			enginePlayerListener = null
		}
	}

	fun attachPlayerListener() {
		detachPlayerListener()

		enginePlayerListener = object : Player.Listener {

			override fun onIsPlayingChanged(isPlaying: Boolean) {
				log("onIsPlayingChanged", "isPlaying=", isPlaying)
				log(
					"onIsPlayingChanged -> currentPosition=",
					enginerBrowser?.currentPosition,
					"duration=",
					enginerBrowser?.duration
				)
				val pos = enginerBrowser?.currentPosition ?: 0L
				val dur = enginerBrowser?.duration ?: 0L

				if (isPlaying) {
					emitState(AudioProModule.STATE_PLAYING, pos, dur, "onIsPlayingChanged(true)")
					startProgressTimer()
				} else {
					emitState(AudioProModule.STATE_PAUSED, pos, dur, "onIsPlayingChanged(false)")
					stopProgressTimer()
				}
			}

			override fun onPlaybackStateChanged(state: Int) {
				log(
					"onPlaybackStateChanged",
					"state=",
					state,
					"playWhenReady=",
					enginerBrowser?.playWhenReady,
					"isPlaying=",
					enginerBrowser?.isPlaying
				)
				val pos = enginerBrowser?.currentPosition ?: 0L
				val dur = enginerBrowser?.duration ?: 0L
				val isPlayIntended = enginerBrowser?.playWhenReady == true
				val isActuallyPlaying = enginerBrowser?.isPlaying == true

				when (state) {
					Player.STATE_BUFFERING -> {
						if (isPlayIntended) {
							emitState(
								AudioProModule.STATE_LOADING,
								pos,
								dur,
								"onPlaybackStateChanged(STATE_BUFFERING, playIntended=true)"
							)
						} else if (flowLastEmittedState == AudioProModule.STATE_PLAYING) {
							emitState(
								AudioProModule.STATE_PAUSED,
								pos,
								dur,
								"onPlaybackStateChanged(STATE_BUFFERING, playIntended=false, wasPlaying=true)"
							)
						} else {
							log("BUFFERING with playIntended=false, but not emitting PAUSED since last emitted state was not PLAYING")
						}
					}

					Player.STATE_READY -> {
						// If there's a pending seek position, perform the seek now that the player is ready
						flowPendingSeekPosition?.let { seekPos ->
							log("Performing pending seek to $seekPos in STATE_READY")
							enginerBrowser?.seekTo(seekPos)
							// pendingSeekPosition will be cleared in onPositionDiscontinuity
						}

						if (isActuallyPlaying) {
							emitState(
								AudioProModule.STATE_PLAYING,
								pos,
								dur,
								"onPlaybackStateChanged(STATE_READY, isPlaying=true)"
							)
							startProgressTimer()
						} else {
							emitState(
								AudioProModule.STATE_PAUSED,
								pos,
								dur,
								"onPlaybackStateChanged(STATE_READY, isPlaying=false)"
							)
							stopProgressTimer()
						}
					}

					/**
					 * Handles track completion according to the contract in logic.md:
					 * - Native is responsible for detecting the end of a track
					 * - Native must pause the player, seek to position 0, and emit both:
					 *   - STATE_CHANGED: STOPPED
					 *   - TRACK_ENDED
					 */
					Player.STATE_ENDED -> {
						stopProgressTimer()

						// Reset error state and last emitted state
						flowIsInErrorState = false
						flowLastEmittedState = ""

						// 1. Pause playback to ensure state is correct
						enginerBrowser?.pause()

						// 2. Seek to position 0
						enginerBrowser?.seekTo(0)

						// 3. Cancel any pending seek operations
						flowPendingSeekPosition = null

						// 4. Emit STOPPED (stopped = loaded but at 0, not playing)
						emitState(
							AudioProModule.STATE_STOPPED,
							0L,
							dur,
							"onPlaybackStateChanged(STATE_ENDED)"
						)

						// 5. Emit TRACK_ENDED for JS
						emitNotice(
							AudioProModule.EVENT_TYPE_TRACK_ENDED,
							dur,
							dur,
							"onPlaybackStateChanged(STATE_ENDED)"
						)
					}

					Player.STATE_IDLE -> {
						stopProgressTimer()
						emitState(
							AudioProModule.STATE_STOPPED,
							0L,
							0L,
							"onPlaybackStateChanged(STATE_IDLE)"
						)
					}
				}
			}

			override fun onPositionDiscontinuity(
				oldPosition: Player.PositionInfo,
				newPosition: Player.PositionInfo,
				reason: Int
			) {
				if (reason == Player.DISCONTINUITY_REASON_SEEK || reason == Player.DISCONTINUITY_REASON_SEEK_ADJUSTMENT) {
					log("Seek completed: position=${newPosition.positionMs}, reason=$reason")
					val dur = enginerBrowser?.duration ?: 0L

					val triggeredBy = if (flowPendingSeekPosition != null) {
						AudioProModule.TRIGGER_SOURCE_USER
					} else {
						AudioProModule.TRIGGER_SOURCE_SYSTEM
					}

					// Determine position for user-initiated seeks
					val pos = flowPendingSeekPosition ?: newPosition.positionMs
					flowPendingSeekPosition = null

					val payload = Arguments.createMap().apply {
						putDouble("position", pos.toDouble())
						putDouble("duration", dur.toDouble())
						putString("triggeredBy", triggeredBy)
					}

					emitEvent(
						AudioProModule.EVENT_TYPE_SEEK_COMPLETE,
						activeTrack,
						payload,
						"onPositionDiscontinuity(reason=$reason, triggeredBy=$triggeredBy)"
					)

					if (triggeredBy == AudioProModule.TRIGGER_SOURCE_USER) {
						startProgressTimer()
					}
				}
			}

			/**
			 * Handles critical errors according to the contract in logic.md:
			 * - onError() should transition to ERROR state
			 * - onError() should emit STATE_CHANGED: ERROR and PLAYBACK_ERROR
			 * - onError() should clear the player state just like clear()
			 *
			 * This method is for unrecoverable player failures that require player teardown.
			 * For non-critical errors that don't require state transition, use emitError() directly.
			 */
			override fun onPlayerError(error: PlaybackException) {
				// If we're already in an error state, just log and return
				if (flowIsInErrorState) {
					log("Already in error state, ignoring additional error: ${error.message}")
					return
				}

				val message = error.message ?: "Unknown error"
				// First, emit PLAYBACK_ERROR event with error details
				emitError(message, 500, "onPlayerError(${error.errorCode})")

				// Then use the shared resetInternal function to:
				// 1. Clear the player state (like clear())
				// 2. Emit STATE_CHANGED: ERROR
				resetInternal(AudioProModule.STATE_ERROR)
			}
		}

		enginerBrowser?.addListener(enginePlayerListener!!)
	}

	private fun startProgressTimer() {
		stopProgressTimer()
		engineProgressHandler = Handler(Looper.getMainLooper())
		engineProgressRunnable = object : Runnable {
			override fun run() {
				val pos = enginerBrowser?.currentPosition ?: 0L
				val dur = enginerBrowser?.duration ?: 0L
				emitNotice(AudioProModule.EVENT_TYPE_PROGRESS, pos, dur, "progressTimer")
				engineProgressHandler?.postDelayed(this, settingProgressIntervalMs)
			}
		}
		engineProgressRunnable?.let {
			engineProgressHandler?.postDelayed(
				it,
				settingProgressIntervalMs
			)
		}
	}

	private fun stopProgressTimer() {
		engineProgressRunnable?.let { engineProgressHandler?.removeCallbacks(it) }
		engineProgressHandler = null
		engineProgressRunnable = null
	}

	private fun runOnUiThread(block: () -> Unit) {
		Handler(Looper.getMainLooper()).post(block)
	}

	private fun emitEvent(
		type: String,
		track: ReadableMap?,
		payload: WritableMap?,
		reason: String = ""
	) {
		log("emitEvent", type, "reason=", reason)
		val context = reactContext
		if (context is ReactApplicationContext) {
			val body = Arguments.createMap().apply {
				putString("type", type)

				if (track != null) {
					putMap("track", track.toHashMap().let { Arguments.makeNativeMap(it) })
				} else {
					putNull("track")
				}

				if (payload != null) {
					putMap("payload", payload)
				}
			}

			context
				.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
				.emit(AudioProModule.EVENT_NAME, body)
		} else {
			Log.w(
				"[react-native-audio-pro]",
				"Context is not an instance of ReactApplicationContext"
			)
		}
	}

	private fun emitState(state: String, position: Long, duration: Long, reason: String = "") {
		val sanitizedPosition = if (position < 0) 0L else position
		val sanitizedDuration = if (duration < 0) 0L else duration
		log(
			"emitState",
			state,
			"position=",
			sanitizedPosition,
			"duration=",
			sanitizedDuration,
			"reason=",
			reason
		)
		// Don't emit PAUSED if we've already emitted STOPPED (catch slow listener emit)
		if (state == AudioProModule.STATE_PAUSED && flowLastEmittedState == AudioProModule.STATE_STOPPED) {
			log("Ignoring PAUSED state after STOPPED")
			return
		}

		// Don't emit STOPPED if we're in an error state
		if (state == AudioProModule.STATE_STOPPED && flowIsInErrorState) {
			log("Ignoring STOPPED state after ERROR")
			return
		}

		// Filter out duplicate state emissions
		// This prevents rapid-fire transitions of the same state being emitted repeatedly
		if (state == flowLastEmittedState) {
			log("Ignoring duplicate $state state emission")
			return
		}

		val payload = Arguments.createMap().apply {
			putString("state", state)
			putDouble("position", sanitizedPosition.toDouble())
			putDouble("duration", sanitizedDuration.toDouble())
		}
		emitEvent(AudioProModule.EVENT_TYPE_STATE_CHANGED, activeTrack, payload, reason)

		// Track the last emitted state
		flowLastEmittedState = state
		// Record time of this state emission
		flowLastStateEmittedTimeMs = System.currentTimeMillis()
	}

	private fun emitNotice(eventType: String, position: Long, duration: Long, reason: String = "") {
		// Sanitize negative values
		val sanitizedPosition = if (position < 0) 0L else position
		val sanitizedDuration = if (duration < 0) 0L else duration

		val payload = Arguments.createMap().apply {
			putDouble("position", sanitizedPosition.toDouble())
			putDouble("duration", sanitizedDuration.toDouble())
		}
		emitEvent(eventType, activeTrack, payload, reason)
	}

	/**
	 * Emits a PLAYBACK_ERROR event without transitioning to the ERROR state.
	 * Use this for non-critical errors that don't require player teardown.
	 *
	 * According to the contract in logic.md:
	 * - PLAYBACK_ERROR and ERROR state are separate and must not be conflated
	 * - PLAYBACK_ERROR can be emitted with or without a corresponding state change
	 * - Useful for soft errors (e.g., image fetch failed, headers issue, non-fatal network retry)
	 */
	private fun emitError(message: String, code: Int, reason: String = "") {
		val payload = Arguments.createMap().apply {
			putString("error", message)
			putInt("errorCode", code)
		}
		emitEvent(AudioProModule.EVENT_TYPE_PLAYBACK_ERROR, activeTrack, payload, reason)
	}

	fun emitNext(reason: String = "") {
		val payload = Arguments.createMap().apply {
			putString("state", flowLastEmittedState)
		}
		emitEvent(AudioProModule.EVENT_TYPE_REMOTE_NEXT, activeTrack, payload, reason)
	}

	fun emitPrev(reason: String = "") {
		val payload = Arguments.createMap().apply {
			putString("state", flowLastEmittedState)
		}
		emitEvent(AudioProModule.EVENT_TYPE_REMOTE_PREV, activeTrack, payload, reason)
	}

	fun setPlaybackSpeed(speed: Float) {
		ensureSession()
		activePlaybackSpeed = speed
		runOnUiThread {
			log("Setting playback speed to", speed)
			enginerBrowser?.setPlaybackSpeed(speed)

			val payload = Arguments.createMap().apply {
				putDouble("speed", speed.toDouble())
			}
			emitEvent(
				AudioProModule.EVENT_TYPE_PLAYBACK_SPEED_CHANGED,
				activeTrack,
				payload,
				"setPlaybackSpeed($speed)"
			)
		}
	}

	fun setVolume(volume: Float) {
		ensureSession()
		activeVolume = volume
		runOnUiThread {
			log("Setting volume to", volume)
			enginerBrowser?.setVolume(volume)
		}
	}

	/**
	 * Helper to extract header maps from a ReadableMap.
	 */
	private fun extractHeaders(headersMap: ReadableMap?): Map<String, String>? {
		if (headersMap == null) return null

		val headerMap = mutableMapOf<String, String>()
		val iterator = headersMap.keySetIterator()
		while (iterator.hasNextKey()) {
			val key = iterator.nextKey()
			val value = headersMap.getString(key)
			if (value != null) {
				headerMap[key] = value
			}
		}
		return if (headerMap.isNotEmpty()) headerMap else null
	}
}
