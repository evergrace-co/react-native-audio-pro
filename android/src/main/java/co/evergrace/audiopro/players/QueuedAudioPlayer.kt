package co.evergrace.audiopro.players

import android.content.Context
import co.evergrace.audiopro.models.AudioItem
import co.evergrace.audiopro.models.BufferConfig
import co.evergrace.audiopro.models.DefaultQueuedPlayerOptions
import co.evergrace.audiopro.models.PlayerConfig
import co.evergrace.audiopro.players.components.getAudioItemHolder
import com.google.android.exoplayer2.C
import com.google.android.exoplayer2.source.MediaSource
import java.util.LinkedList

class QueuedAudioPlayer(
    context: Context,
    playerConfig: PlayerConfig = PlayerConfig(),
    bufferConfig: BufferConfig? = null,
) : BaseAudioPlayer(context, playerConfig, bufferConfig) {
    private val queue = LinkedList<MediaSource>()
    override val playerOptions = DefaultQueuedPlayerOptions(exoPlayer)

    val currentIndex
        get() = exoPlayer.currentMediaItemIndex

    override val currentItem: AudioItem?
        get() = queue.getOrNull(currentIndex)?.mediaItem?.getAudioItemHolder()?.audioItem

    val previousIndex: Int?
        get() {
            return if (exoPlayer.previousMediaItemIndex == C.INDEX_UNSET) null
            else exoPlayer.previousMediaItemIndex
        }

    val items: List<AudioItem>
        get() = queue.map { it.mediaItem.getAudioItemHolder().audioItem }

    val nextItem: AudioItem?
        get() = items.getOrNull(currentIndex + 1)

    override fun load(item: AudioItem, playWhenReady: Boolean) {
        load(item)
        exoPlayer.playWhenReady = playWhenReady
    }

    override fun load(item: AudioItem) {
        if (queue.isEmpty()) {
            add(item)
        } else {
            val mediaSource = getMediaSourceFromAudioItem(item)
            queue[currentIndex] = mediaSource
            exoPlayer.addMediaSource(currentIndex + 1, mediaSource)
            exoPlayer.removeMediaItem(currentIndex)
            exoPlayer.seekTo(currentIndex, C.TIME_UNSET);
            exoPlayer.prepare()
        }
    }

    fun add(item: AudioItem) {
        val mediaSource = getMediaSourceFromAudioItem(item)
        queue.add(mediaSource)
        exoPlayer.addMediaSource(mediaSource)
        exoPlayer.prepare()
    }

    override fun destroy() {
        queue.clear()
        super.destroy()
    }

    override fun clear() {
        queue.clear()
        super.clear()
    }
}
