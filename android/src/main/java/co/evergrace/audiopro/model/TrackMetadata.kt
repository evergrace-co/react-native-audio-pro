package co.evergrace.audiopro.model

import android.content.Context
import android.net.Uri
import android.os.Bundle
import co.evergrace.audiopro.extensions.NumberExt.Companion.toMilliseconds
import co.evergrace.audiopro.utils.BundleUtils

abstract class TrackMetadata {
    var artwork: Uri? = null
    var title: String? = null
    var artist: String? = null
    var album: String? = null
    var duration: Long? = null
    open fun setMetadata(context: Context, bundle: Bundle?) {
        artwork = BundleUtils.getUri(context, bundle, "artwork")
        title = bundle!!.getString("title")
        artist = bundle.getString("artist")
        album = bundle.getString("album")
        duration = if (bundle.containsKey("duration")) {
            bundle.getDouble("duration").toMilliseconds()
        } else {
            null
        }
    }
}
