package co.evergrace.audiopro.utils

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.support.v4.media.RatingCompat
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper

object BundleUtils {
    fun getUri(context: Context, data: Bundle?, key: String?): Uri? {
        if (!data!!.containsKey(key)) return null
        val obj = data[key]
        if (obj is String) {
            // Remote or Local Uri
            if (obj.trim { it <= ' ' }.isEmpty()) throw RuntimeException("$key: The URL cannot be empty")
            return Uri.parse(obj as String?)
        } else if (obj is Bundle) {
            // require/import
            val uri = obj.getString("uri")
            val helper = ResourceDrawableIdHelper.getInstance()
            val id = helper.getResourceDrawableId(context, uri)
            return if (id > 0) {
                // In production, we can obtain the resource uri
                val res = context.resources
                Uri.Builder()
                    .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
                    .authority(res.getResourcePackageName(id))
                    .appendPath(res.getResourceTypeName(id))
                    .appendPath(res.getResourceEntryName(id))
                    .build()
            } else {
                // During development, the resources might come directly from the metro server
                Uri.parse(uri)
            }
        }
        return null
    }

    fun getRawResourceId(context: Context, data: Bundle, key: String?): Int {
        if (!data.containsKey(key)) return 0
        val obj = data[key] as? Bundle ?: return 0
        var name = obj.getString("uri")
        if (name == null || name.isEmpty()) return 0
        name = name.lowercase().replace("-", "_")
        return try {
            name.toInt()
        } catch (ex: NumberFormatException) {
            context.resources.getIdentifier(name, "raw", context.packageName)
        }
    }

    fun getIcon(context: Context, options: Bundle, propertyName: String, defaultIcon: Int): Int {
        if (!options.containsKey(propertyName)) return defaultIcon

        val bundle = options.getBundle(propertyName) ?: return defaultIcon

        val helper = ResourceDrawableIdHelper.getInstance()
        val icon = helper.getResourceDrawableId(context, bundle.getString("uri"))
        return if (icon == 0) defaultIcon else icon
    }

    fun getIconOrNull(context: Context, options: Bundle, propertyName: String): Int? {
        if (!options.containsKey(propertyName)) return null

        val bundle = options.getBundle(propertyName) ?: return null

        val helper = ResourceDrawableIdHelper.getInstance()
        val icon = helper.getResourceDrawableId(context, bundle.getString("uri"))
        return if (icon == 0) null else icon
    }

    fun getInt(data: Bundle?, key: String?, defaultValue: Int): Int {
        val value = data!![key]
        return if (value is Number) {
            value.toInt()
        } else defaultValue
    }

    fun getIntOrNull(data: Bundle?, key: String?): Int? {
        val value = data!![key]
        return if (value is Number) {
            value.toInt()
        } else null
    }

    fun getDoubleOrNull(data: Bundle?, key: String?): Double? {
        val value = data!![key]
        return if (value is Number) {
            value.toDouble()
        } else null
    }
}
