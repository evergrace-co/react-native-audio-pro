import Foundation

enum Capability: String {
    case play, pause, togglePlayPause, stop, jumpForward, jumpBackward, seek

    func mapToPlayerCommand(forwardJumpInterval: NSNumber?,
                            backwardJumpInterval: NSNumber?) -> RemoteCommand {
        switch self {
        case .stop:
            return .stop
        case .play:
            return .play
        case .pause:
            return .pause
        case .togglePlayPause:
            return .togglePlayPause
        case .seek:
            return .changePlaybackPosition
        case .jumpForward:
            return .skipForward(preferredIntervals: [(forwardJumpInterval ?? backwardJumpInterval) ?? 15])
        case .jumpBackward:
            return .skipBackward(preferredIntervals: [(backwardJumpInterval ?? forwardJumpInterval) ?? 15])
        }
    }
}
