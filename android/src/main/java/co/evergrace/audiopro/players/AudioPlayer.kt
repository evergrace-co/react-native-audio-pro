package co.evergrace.audiopro.players

import android.content.Context
import co.evergrace.audiopro.models.BufferConfig
import co.evergrace.audiopro.models.PlayerConfig

class AudioPlayer(
    context: Context,
    playerConfig: PlayerConfig = PlayerConfig(),
    bufferConfig: BufferConfig? = null
) : BaseAudioPlayer(context, playerConfig, bufferConfig)
