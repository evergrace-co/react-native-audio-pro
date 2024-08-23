import Foundation

enum EventType: String, CaseIterable {
    case RemoteDuck = "remote-duck"
    case RemoteSeek = "remote-seek"
    case RemoteNext = "remote-next"
    case RemotePrevious = "remote-previous"
    case RemoteStop = "remote-stop"
    case RemotePause = "remote-pause"
    case RemotePlay = "remote-play"
    case RemoteJumpForward = "remote-jump-forward"
    case RemoteJumpBackward = "remote-jump-backward"
    case PlaybackError = "playback-error"
    case PlaybackQueueEnded = "playback-queue-ended"
    case PlaybackTrackChanged = "playback-track-changed"
    case PlaybackActiveTrackChanged = "playback-active-track-changed"
    case PlaybackState = "playback-state"
    case PlaybackProgressUpdated = "playback-progress-updated"
    case PlaybackPlayWhenReadyChanged = "playback-play-when-ready-changed"
    
    static func allRawValues() -> [String] {
        return allCases.map { $0.rawValue }
    }
}
