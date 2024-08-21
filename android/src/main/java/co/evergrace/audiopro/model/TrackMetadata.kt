package co.evergrace.rnaudiopro.model

import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.support.v4.media.RatingCompat
import co.evergrace.rnaudiopro.extensions.NumberExt.Companion.toMilliseconds
import co.evergrace.rnaudiopro.utils.BundleUtils

abstract class TrackMetadata {
    var artwork: Uri? = null
    var title: String? = null
    var artist: String? = null
    var album: String? = null
    var date: String? = null
    var genre: String? = null
    var duration: Long? = null
    var rating: RatingCompat? = null
    open fun setMetadata(context: Context, bundle: Bundle?, ratingType: Int) {
        artwork = BundleUtils.getUri(context, bundle, "artwork")
        title = bundle!!.getString("title")
        artist = bundle.getString("artist")
        album = bundle.getString("album")
        date = bundle.getString("date")
        genre = bundle.getString("genre")

        duration = if (bundle.containsKey("duration")) {
            bundle.getDouble("duration").toMilliseconds()
        } else {
            null
        }

        rating = BundleUtils.getRating(bundle, "rating", ratingType)
    }
}
