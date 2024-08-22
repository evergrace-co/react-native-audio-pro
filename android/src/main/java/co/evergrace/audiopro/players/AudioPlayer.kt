package co.evergrace.kotlinaudiopro.players

import android.content.Context
import co.evergrace.kotlinaudiopro.models.BufferConfig
import co.evergrace.kotlinaudiopro.models.CacheConfig
import co.evergrace.kotlinaudiopro.models.PlayerConfig

class AudioPlayer(context: Context, playerConfig: PlayerConfig = PlayerConfig(), bufferConfig: BufferConfig? = null, cacheConfig: CacheConfig? = null): BaseAudioPlayer(context, playerConfig, bufferConfig, cacheConfig)
