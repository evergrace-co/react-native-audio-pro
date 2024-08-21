package co.evergrace.rnaudiopro.utils

import com.facebook.react.bridge.Promise

data class RejectionException(
    override val message: String,
    val code : String
) : Exception(message)
