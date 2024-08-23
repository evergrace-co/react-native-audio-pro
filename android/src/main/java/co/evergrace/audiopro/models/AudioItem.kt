package co.evergrace.audiopro.models

import android.graphics.Bitmap

interface AudioItem {
    var audioUrl: String
    val type: MediaType
    var artist: String?
    var title: String?
    var albumTitle: String?
    val artwork: String?
    val duration: Long?
    val options: AudioItemOptions?
}

data class AudioItemOptions(
    val headers: MutableMap<String, String>? = null,
    val resourceId: Int? = null
)

enum class MediaType(val value: String) {
    /**
     * The default media type. Should be used for streams over HTTP or files
     */
    DEFAULT("default"),
}

class AudioItemHolder(
    var audioItem: AudioItem
) {
    var artworkBitmap: Bitmap? = null
}
