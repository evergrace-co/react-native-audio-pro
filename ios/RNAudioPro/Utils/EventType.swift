import Foundation

// Enum representing various event types related to remote controls and playback states
enum EventType: String, CaseIterable {
    case RemoteDuck = "remote-duck"
    case RemoteSeek = "remote-seek"
    case RemoteNext = "remote-next"
    case RemotePrevious = "remote-previous"
    case RemoteStop = "remote-stop"
    case PlaybackTrackChanged = "playback-track-changed"
    case PlaybackActiveTrackChanged = "playback-active-track-changed"
    case PlaybackState = "playback-state"
    case PlaybackProgressUpdated = "playback-progress-updated"
    case PlaybackPlayWhenReadyChanged = "playback-play-when-ready-changed"
    
    // Static method to return all event types as raw string values
    static func allRawValues() -> [String] {
        return allCases.map { $0.rawValue }
    }
}
