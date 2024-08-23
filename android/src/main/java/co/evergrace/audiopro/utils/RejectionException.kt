package co.evergrace.audiopro.utils

data class RejectionException(
    override val message: String,
    val code : String
) : Exception(message)
