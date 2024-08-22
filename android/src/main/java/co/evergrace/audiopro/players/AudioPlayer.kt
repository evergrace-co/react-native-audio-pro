package co.evergrace.audiopro.players

import android.content.Context
import co.evergrace.audiopro.models.BufferConfig
import co.evergrace.audiopro.models.CacheConfig
import co.evergrace.audiopro.models.PlayerConfig

class AudioPlayer(context: Context, playerConfig: PlayerConfig = PlayerConfig(), bufferConfig: BufferConfig? = null, cacheConfig: CacheConfig? = null): BaseAudioPlayer(context, playerConfig, bufferConfig, cacheConfig)
