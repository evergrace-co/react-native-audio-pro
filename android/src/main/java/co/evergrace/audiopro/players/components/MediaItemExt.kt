package co.evergrace.kotlinaudiopro.players.components

import co.evergrace.kotlinaudiopro.models.AudioItemHolder
import com.google.android.exoplayer2.MediaItem

fun MediaItem.getAudioItemHolder(): AudioItemHolder {
    return localConfiguration!!.tag as AudioItemHolder
}
