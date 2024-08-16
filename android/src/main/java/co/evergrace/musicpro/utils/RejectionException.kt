package co.evergrace.musicpro.utils

import com.facebook.react.bridge.Promise

/**
 * @author Jonathan Puckey @puckey
 */
data class RejectionException(
    override val message: String,
    val code : String
) : Exception(message)
