package co.evergrace.audiopro.players.components

import co.evergrace.audiopro.models.AudioItemHolder
import com.google.android.exoplayer2.MediaItem

fun MediaItem.getAudioItemHolder(): AudioItemHolder {
    return localConfiguration!!.tag as AudioItemHolder
}
