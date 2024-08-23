package co.evergrace.audiopro.model

import android.content.Context
import android.net.Uri
import android.os.Bundle
import co.evergrace.audiopro.models.AudioItemOptions
import co.evergrace.audiopro.models.MediaType

class Track(context: Context, bundle: Bundle) : TrackMetadata() {
    var uri: Uri? = null
    var resourceId: Int?
    var type = MediaType.DEFAULT
    var contentType: String?
    var originalItem: Bundle?
    var headers: MutableMap<String, String>? = null
    val queueId: Long

    override fun setMetadata(context: Context, bundle: Bundle?) {
        super.setMetadata(context, bundle)
        if (originalItem != null && originalItem != bundle) originalItem!!.putAll(bundle)
    }

    fun toAudioItem(): TrackAudioItem {
        return TrackAudioItem(this, type, uri.toString(), artist, title, album, artwork.toString(), duration,
                AudioItemOptions(headers, resourceId))
    }

    init {
        resourceId = null
        uri = Uri.parse(bundle.getString("url"))
        contentType = bundle.getString("contentType")
        val httpHeaders = bundle.getBundle("headers")
        if (httpHeaders != null) {
            headers = HashMap()
            for (header in httpHeaders.keySet()) {
                headers!![header] = httpHeaders.getString(header)!!
            }
        }
        setMetadata(context, bundle)
        queueId = System.currentTimeMillis()
        originalItem = bundle
    }
}
