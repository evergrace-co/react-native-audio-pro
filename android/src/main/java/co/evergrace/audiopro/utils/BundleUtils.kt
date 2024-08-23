package co.evergrace.audiopro.utils

import android.content.Context
import android.os.Bundle
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper

object BundleUtils {
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
