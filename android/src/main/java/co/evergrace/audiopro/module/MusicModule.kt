package co.evergrace.audiopro.module

import android.content.*
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import co.evergrace.audiopro.models.Capability
import co.evergrace.audiopro.models.RepeatMode
import co.evergrace.audiopro.extensions.NumberExt.Companion.toMilliseconds
import co.evergrace.audiopro.model.State
import co.evergrace.audiopro.model.Track
import co.evergrace.audiopro.module.MusicEvents.Companion.EVENT_INTENT
import co.evergrace.audiopro.service.MusicService
import co.evergrace.audiopro.utils.AppForegroundTracker
import co.evergrace.audiopro.utils.RejectionException
import com.facebook.react.bridge.*
import com.google.android.exoplayer2.DefaultLoadControl.*
import com.google.android.exoplayer2.Player
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.*
import javax.annotation.Nonnull

class MusicModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    ServiceConnection {
    private var playerOptions: Bundle? = null
    private var isServiceBound = false
    private var playerSetUpPromise: Promise? = null
    private val scope = MainScope()
    private lateinit var musicService: MusicService
    private val context = reactContext

    @Nonnull
    override fun getName(): String {
        return "AudioProModule"
    }

    override fun initialize() {
        Timber.plant(Timber.DebugTree())
        AppForegroundTracker.start()
    }

    override fun onServiceConnected(name: ComponentName, service: IBinder) {
        scope.launch {
            // If a binder already exists, don't get a new one
            if (!::musicService.isInitialized) {
                val binder: MusicService.MusicBinder = service as MusicService.MusicBinder
                musicService = binder.service
                musicService.setupPlayer(playerOptions)
                playerSetUpPromise?.resolve(null)
            }

            isServiceBound = true
        }
    }

    /**
     * Called when a connection to the Service has been lost.
     */
    override fun onServiceDisconnected(name: ComponentName) {
        scope.launch {
            isServiceBound = false
        }
    }

    /**
     * Checks wither service is bound, or rejects. Returns whether promise was rejected.
     */
    private fun verifyServiceBoundOrReject(promise: Promise): Boolean {
        if (!isServiceBound) {
            promise.reject(
                "player_not_initialized",
                "The player is not initialized. Call setupPlayer first."
            )
            return true
        }

        return false
    }

    private fun bundleToTrack(bundle: Bundle): Track {
        return Track(context, bundle)
    }

    private fun rejectWithException(callback: Promise, exception: Exception) {
        when (exception) {
            is RejectionException -> {
                callback.reject(exception.code, exception)
            }
            else -> {
                callback.reject("runtime_exception", exception)
            }
        }
    }

    private fun readableArrayToTrackList(data: ReadableArray?): MutableList<Track> {
        val bundleList = Arguments.toList(data)
        if (bundleList !is ArrayList) {
            throw RejectionException("invalid_parameter", "Was not given an array of tracks")
        }
        return bundleList.map {
            if (it is Bundle) {
                bundleToTrack(it)
            } else {
                throw RejectionException(
                    "invalid_track_object",
                    "Track was not a dictionary type"
                )
            }
        }.toMutableList()
    }

    /* ****************************** API ****************************** */
    override fun getConstants(): Map<String, Any> {
        return HashMap<String, Any>().apply {
            // Capabilities
            this["CAPABILITY_PLAY"] = Capability.PLAY.ordinal
            this["CAPABILITY_PAUSE"] = Capability.PAUSE.ordinal
            this["CAPABILITY_STOP"] = Capability.STOP.ordinal
            this["CAPABILITY_SEEK_TO"] = Capability.SEEK_TO.ordinal
            this["CAPABILITY_SKIP"] = OnErrorAction.SKIP.ordinal
            this["CAPABILITY_SKIP_TO_NEXT"] = Capability.SKIP_TO_NEXT.ordinal
            this["CAPABILITY_SKIP_TO_PREVIOUS"] = Capability.SKIP_TO_PREVIOUS.ordinal
            this["CAPABILITY_JUMP_FORWARD"] = Capability.JUMP_FORWARD.ordinal
            this["CAPABILITY_JUMP_BACKWARD"] = Capability.JUMP_BACKWARD.ordinal

            // States
            this["STATE_NONE"] = State.None.state
            this["STATE_READY"] = State.Ready.state
            this["STATE_PLAYING"] = State.Playing.state
            this["STATE_PAUSED"] = State.Paused.state
            this["STATE_STOPPED"] = State.Stopped.state
            this["STATE_BUFFERING"] = State.Buffering.state
            this["STATE_LOADING"] = State.Loading.state

            // Repeat Modes
            this["REPEAT_OFF"] = Player.REPEAT_MODE_OFF
            this["REPEAT_TRACK"] = Player.REPEAT_MODE_ONE
        }
    }

    @ReactMethod
    fun setupPlayer(data: ReadableMap?, promise: Promise) {
        if (isServiceBound) {
            promise.reject(
                "player_already_initialized",
                "The player has already been initialized via setupPlayer."
            )
            return
        }

        // prevent crash Fatal Exception: android.app.RemoteServiceException$ForegroundServiceDidNotStartInTimeException
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && AppForegroundTracker.backgrounded) {
            promise.reject(
                "android_cannot_setup_player_in_background",
                "On Android the app must be in the foreground when setting up the player."
            )
            return
        }

        // Validate buffer keys.
        val bundledData = Arguments.toBundle(data)
        val minBuffer =
            bundledData?.getDouble(MusicService.MIN_BUFFER_KEY)?.toMilliseconds()?.toInt()
                ?: DEFAULT_MIN_BUFFER_MS
        val maxBuffer =
            bundledData?.getDouble(MusicService.MAX_BUFFER_KEY)?.toMilliseconds()?.toInt()
                ?: DEFAULT_MAX_BUFFER_MS
        val playBuffer =
            bundledData?.getDouble(MusicService.PLAY_BUFFER_KEY)?.toMilliseconds()?.toInt()
                ?: DEFAULT_BUFFER_FOR_PLAYBACK_MS
        val backBuffer =
            bundledData?.getDouble(MusicService.BACK_BUFFER_KEY)?.toMilliseconds()?.toInt()
                ?: DEFAULT_BACK_BUFFER_DURATION_MS

        if (playBuffer < 0) {
            promise.reject(
                "play_buffer_error",
                "The value for playBuffer should be greater than or equal to zero."
            )
            return
        }

        if (backBuffer < 0) {
            promise.reject(
                "back_buffer_error",
                "The value for backBuffer should be greater than or equal to zero."
            )
            return
        }

        if (minBuffer < playBuffer) {
            promise.reject(
                "min_buffer_error",
                "The value for minBuffer should be greater than or equal to playBuffer."
            )
            return
        }

        if (maxBuffer < minBuffer) {
            promise.reject(
                "min_buffer_error",
                "The value for maxBuffer should be greater than or equal to minBuffer."
            )
            return
        }

        playerSetUpPromise = promise
        playerOptions = bundledData


        LocalBroadcastManager.getInstance(context).registerReceiver(
            MusicEvents(context),
            IntentFilter(EVENT_INTENT)
        )

        Intent(context, MusicService::class.java).also { intent ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            context.bindService(intent, this, Context.BIND_AUTO_CREATE)
        }
    }

    @ReactMethod
    fun updateOptions(data: ReadableMap?, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        val options = Arguments.toBundle(data)

        options?.let {
            musicService.updateOptions(it)
        }

        callback.resolve(null)
    }

    @ReactMethod
    fun add(data: ReadableArray?, insertBeforeIndex: Int, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        try {
            val tracks = readableArrayToTrackList(data);
            if (insertBeforeIndex < -1 || insertBeforeIndex > musicService.tracks.size) {
                callback.reject("index_out_of_bounds", "The track index is out of bounds")
                return@launch
            }
            val index = if (insertBeforeIndex == -1) musicService.tracks.size else insertBeforeIndex
            musicService.add(
                tracks,
                index
            )
            callback.resolve(index)
        } catch (exception: Exception) {
            rejectWithException(callback, exception)
        }
    }

    @ReactMethod
    fun load(data: ReadableMap?, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        if (data == null) {
            callback.resolve(null)
            return@launch
        }
        val bundle = Arguments.toBundle(data);
        if (bundle is Bundle) {
            musicService.load(bundleToTrack(bundle))
            callback.resolve(null)
        } else {
            callback.reject("invalid_track_object", "Track was not a dictionary type")
        }
    }

    @ReactMethod
    fun move(fromIndex: Int, toIndex: Int, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        musicService.move(fromIndex, toIndex)
        callback.resolve(null)
    }

    @ReactMethod
    fun remove(data: ReadableArray?, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        val inputIndexes = Arguments.toList(data)
        if (inputIndexes != null) {
            val size = musicService.tracks.size
            val indexes: ArrayList<Int> = ArrayList();
            for (inputIndex in inputIndexes) {
                val index = if (inputIndex is Int) inputIndex else inputIndex.toString().toInt()
                if (index < 0 || index >= size) {
                    callback.reject(
                        "index_out_of_bounds",
                        "One or more indexes was out of bounds"
                    )
                    return@launch
                }
                indexes.add(index)
            }
            musicService.remove(indexes)
        }
        callback.resolve(null)
    }

    @ReactMethod
    fun reset(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.stop()
        delay(300) // Allow playback to stop
        musicService.clear()

        callback.resolve(null)
    }

    @ReactMethod
    fun play(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.play()
        callback.resolve(null)
    }

    @ReactMethod
    fun pause(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.pause()
        callback.resolve(null)
    }

    @ReactMethod
    fun stop(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.stop()
        callback.resolve(null)
    }

    @ReactMethod
    fun seekTo(seconds: Float, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.seekTo(seconds)
        callback.resolve(null)
    }

    @ReactMethod
    fun seekBy(offset: Float, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.seekBy(offset)
        callback.resolve(null)
    }

    @ReactMethod
    fun retry(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.retry()
        callback.resolve(null)
    }

    @ReactMethod
    fun setVolume(volume: Float, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.setVolume(volume)
        callback.resolve(null)
    }

    @ReactMethod
    fun getVolume(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getVolume())
    }

    @ReactMethod
    fun setRate(rate: Float, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.setRate(rate)
        callback.resolve(null)
    }

    @ReactMethod
    fun getRate(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getRate())
    }

    @ReactMethod
    fun setRepeatMode(mode: Int, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.setRepeatMode(RepeatMode.fromOrdinal(mode))
        callback.resolve(null)
    }

    @ReactMethod
    fun getRepeatMode(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getRepeatMode().ordinal)
    }

    @ReactMethod
    fun setPlayWhenReady(playWhenReady: Boolean, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        musicService.playWhenReady = playWhenReady
        callback.resolve(null)
    }

    @ReactMethod
    fun getTrack(index: Int, callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        if (index >= 0 && index < musicService.tracks.size) {
            callback.resolve(Arguments.fromBundle(musicService.tracks[index].originalItem))
        } else {
            callback.resolve(null)
        }
    }

    @ReactMethod
    fun getActiveTrack(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        callback.resolve(
            if (musicService.tracks.isEmpty()) null
            else Arguments.fromBundle(
                musicService.tracks[musicService.getCurrentTrackIndex()].originalItem
            )
        )
    }

    @ReactMethod
    fun getDuration(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getDurationInSeconds())
    }

    @ReactMethod
    fun getBufferedPosition(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getBufferedPositionInSeconds())
    }

    @ReactMethod
    fun getPosition(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch

        callback.resolve(musicService.getPositionInSeconds())
    }

    @ReactMethod
    fun getProgress(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        var bundle = Bundle()
        bundle.putDouble("duration", musicService.getDurationInSeconds());
        bundle.putDouble("position", musicService.getPositionInSeconds());
        bundle.putDouble("buffered", musicService.getBufferedPositionInSeconds());
        callback.resolve(Arguments.fromBundle(bundle))
    }

    @ReactMethod
    fun getPlaybackState(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        callback.resolve(Arguments.fromBundle(musicService.getPlayerStateBundle(musicService.state)))
    }
}
