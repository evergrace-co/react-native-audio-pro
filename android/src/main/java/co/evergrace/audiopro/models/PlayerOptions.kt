package co.evergrace.kotlinaudiopro.models

interface PlayerOptions {
    var alwaysPauseOnInterruption: Boolean
}

internal data class DefaultPlayerOptions(
    override var alwaysPauseOnInterruption: Boolean = false,
) : PlayerOptions
