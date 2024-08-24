import Foundation
import MediaPlayer


public typealias RemoteCommandHandler = (MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus

public protocol RemoteCommandProtocol {
    associatedtype Command: MPRemoteCommand

    var id: String { get }
    var commandKeyPath: KeyPath<MPRemoteCommandCenter, Command> { get }
    var handlerKeyPath: KeyPath<RemoteCommandController, RemoteCommandHandler> { get }
}

public struct PlayBackCommand: RemoteCommandProtocol {

    public static let play = PlayBackCommand(id: "Play", commandKeyPath: \MPRemoteCommandCenter.playCommand, handlerKeyPath: \RemoteCommandController.handlePlayCommand)

    public static let pause = PlayBackCommand(id: "Pause", commandKeyPath: \MPRemoteCommandCenter.pauseCommand, handlerKeyPath: \RemoteCommandController.handlePauseCommand)

    public static let stop = PlayBackCommand(id: "Stop", commandKeyPath: \MPRemoteCommandCenter.stopCommand, handlerKeyPath: \RemoteCommandController.handleStopCommand)

    public static let togglePlayPause = PlayBackCommand(id: "TogglePlayPause", commandKeyPath: \MPRemoteCommandCenter.togglePlayPauseCommand, handlerKeyPath: \RemoteCommandController.handleTogglePlayPauseCommand)


    public typealias Command = MPRemoteCommand

    public let id: String

    public var commandKeyPath: KeyPath<MPRemoteCommandCenter, MPRemoteCommand>

    public var handlerKeyPath: KeyPath<RemoteCommandController, RemoteCommandHandler>

}

public struct ChangePlaybackPositionCommand: RemoteCommandProtocol {

    public static let changePlaybackPosition = ChangePlaybackPositionCommand(id: "ChangePlaybackPosition", commandKeyPath: \MPRemoteCommandCenter.changePlaybackPositionCommand, handlerKeyPath: \RemoteCommandController.handleChangePlaybackPositionCommand)

    public typealias Command = MPChangePlaybackPositionCommand

    public let id: String

    public var commandKeyPath: KeyPath<MPRemoteCommandCenter, MPChangePlaybackPositionCommand>

    public var handlerKeyPath: KeyPath<RemoteCommandController, RemoteCommandHandler>

}

public struct SkipIntervalCommand: RemoteCommandProtocol {

    public static let skipForward = SkipIntervalCommand(id: "SkipForward", commandKeyPath: \MPRemoteCommandCenter.skipForwardCommand, handlerKeyPath: \RemoteCommandController.handleSkipForwardCommand)

    public static let skipBackward = SkipIntervalCommand(id: "SkipBackward", commandKeyPath: \MPRemoteCommandCenter.skipBackwardCommand, handlerKeyPath: \RemoteCommandController.handleSkipBackwardCommand)

    public typealias Command = MPSkipIntervalCommand

    public let id: String

    public var commandKeyPath: KeyPath<MPRemoteCommandCenter, MPSkipIntervalCommand>

    public var handlerKeyPath: KeyPath<RemoteCommandController, RemoteCommandHandler>

    func set(preferredIntervals: [NSNumber]) -> SkipIntervalCommand {
        MPRemoteCommandCenter.shared()[keyPath: commandKeyPath].preferredIntervals = preferredIntervals
        return self
    }

}

public enum RemoteCommand: CustomStringConvertible {

    case play

    case pause

    case stop

    case togglePlayPause

    case changePlaybackPosition

    case skipForward(preferredIntervals: [NSNumber])

    case skipBackward(preferredIntervals: [NSNumber])

    public var description: String {
        switch self {
        case .play: return "play"
        case .pause: return "pause"
        case .stop: return "stop"
        case .togglePlayPause: return "togglePlayPause"
        case .changePlaybackPosition: return "changePlaybackPosition"
        case .skipForward(_): return "skipForward"
        case .skipBackward(_): return "skipBackward"
        }
    }

    /**
     All values in an array for convenience.
     Don't use for associated values.
     */
    static func all() -> [RemoteCommand] {
        return [
            .play,
            .pause,
            .stop,
            .togglePlayPause,
            .changePlaybackPosition,
            .skipForward(preferredIntervals: []),
            .skipBackward(preferredIntervals: [])
        ]
    }

}
