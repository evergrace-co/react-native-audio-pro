package co.evergrace.rnaudiopro.model

import co.evergrace.audiopro.models.AudioItem
import co.evergrace.audiopro.models.AudioItemOptions
import co.evergrace.audiopro.models.MediaType

data class TrackAudioItem(
    val track: Track,
    override val type: MediaType,
    override var audioUrl: String,
    override var artist: String? = null,
    override var title: String? = null,
    override var albumTitle: String? = null,
    override val artwork: String? = null,
    override val duration: Long? = null,
    override val options: AudioItemOptions? = null
): AudioItem
