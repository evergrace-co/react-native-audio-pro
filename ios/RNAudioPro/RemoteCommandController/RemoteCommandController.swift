import Foundation
import MediaPlayer

// Protocol to define a type that can provide an array of RemoteCommand objects.
public protocol RemoteCommandable {
    func getCommands() ->  [RemoteCommand]
}

public class RemoteCommandController {

    // MPRemoteCommandCenter is the central controller for handling remote commands like play, pause, etc.
    private let center: MPRemoteCommandCenter

    // Weak reference to the AudioPlayer instance to avoid retain cycles.
    weak var audioPlayer: AudioPlayer?

    // Dictionary to keep track of targets associated with each command.
    var commandTargetPointers: [String: Any] = [:]

    // List of currently enabled commands to manage their state.
    private var enabledCommands: [RemoteCommand] = []

    /**
     Initializes the RemoteCommandController with the provided MPRemoteCommandCenter.

     - parameter remoteCommandCenter: The MPRemoteCommandCenter used. Default is `MPRemoteCommandCenter.shared()`
     */
    public init(remoteCommandCenter: MPRemoteCommandCenter = MPRemoteCommandCenter.shared()) {
        center = remoteCommandCenter
    }

    // Enables a set of commands, disabling any previously enabled commands that are no longer needed.
    internal func enable(commands: [RemoteCommand]) {
        let commandsToDisable = enabledCommands.filter { command in
            !commands.contains(where: { $0.description == command.description })
        }

        enabledCommands = commands
        commands.forEach { self.enable(command: $0) }
        disable(commands: commandsToDisable)
    }

    // Disables a set of commands.
    internal func disable(commands: [RemoteCommand]) {
        commands.forEach { self.disable(command: $0) }
    }

    // Enables a specific command in the MPRemoteCommandCenter and sets up its handler.
    private func enableCommand<Command: RemoteCommandProtocol>(_ command: Command) {
        center[keyPath: command.commandKeyPath].isEnabled = true
        center[keyPath: command.commandKeyPath].removeTarget(commandTargetPointers[command.id])
        commandTargetPointers[command.id] = center[keyPath: command.commandKeyPath].addTarget(handler: self[keyPath: command.handlerKeyPath])
    }

    // Disables a specific command in the MPRemoteCommandCenter and removes its handler.
    private func disableCommand<Command: RemoteCommandProtocol>(_ command: Command) {
        center[keyPath: command.commandKeyPath].isEnabled = false
        center[keyPath: command.commandKeyPath].removeTarget(commandTargetPointers[command.id])
        commandTargetPointers.removeValue(forKey: command.id)
    }

    // Handles enabling different types of remote commands, mapping each to its corresponding enable function.
    private func enable(command: RemoteCommand) {
        switch command {
        case .play: self.enableCommand(PlayBackCommand.play)
        case .pause: self.enableCommand(PlayBackCommand.pause)
        case .stop: self.enableCommand(PlayBackCommand.stop)
        case .togglePlayPause: self.enableCommand(PlayBackCommand.togglePlayPause)
        case .next: self.enableCommand(PlayBackCommand.nextTrack)
        case .previous: self.enableCommand(PlayBackCommand.previousTrack)
        case .changePlaybackPosition: self.enableCommand(ChangePlaybackPositionCommand.changePlaybackPosition)
        case .skipForward(let preferredIntervals): self.enableCommand(SkipIntervalCommand.skipForward.set(preferredIntervals: preferredIntervals))
        case .skipBackward(let preferredIntervals): self.enableCommand(SkipIntervalCommand.skipBackward.set(preferredIntervals: preferredIntervals))
        }
    }

    // Handles disabling different types of remote commands, mapping each to its corresponding disable function.
    private func disable(command: RemoteCommand) {
        switch command {
        case .play: self.disableCommand(PlayBackCommand.play)
        case .pause: self.disableCommand(PlayBackCommand.pause)
        case .stop: self.disableCommand(PlayBackCommand.stop)
        case .togglePlayPause: self.disableCommand(PlayBackCommand.togglePlayPause)
        case .next: self.disableCommand(PlayBackCommand.nextTrack)
        case .previous: self.disableCommand(PlayBackCommand.previousTrack)
        case .changePlaybackPosition: self.disableCommand(ChangePlaybackPositionCommand.changePlaybackPosition)
        case .skipForward(_): self.disableCommand(SkipIntervalCommand.skipForward)
        case .skipBackward(_): self.disableCommand(SkipIntervalCommand.skipBackward)
        }
    }

    // MARK: - Handlers

    // Default handler implementations for each remote command. These are linked to their corresponding commands
    // when the command is enabled, providing the functionality for play, pause, skip, etc.

    private func handlePlayCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let audioPlayer = audioPlayer {
            audioPlayer.play()
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handlePauseCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let audioPlayer = audioPlayer {
            audioPlayer.pause()
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleStopCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let audioPlayer = audioPlayer {
            audioPlayer.stop()
            return .success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleTogglePlayPauseCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let audioPlayer = audioPlayer {
            audioPlayer.togglePlaying()
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleSkipForwardCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let command = event.command as? MPSkipIntervalCommand,
            let interval = command.preferredIntervals.first,
            let audioPlayer = audioPlayer {
            audioPlayer.seek(to: audioPlayer.currentTime + Double(truncating: interval))
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleSkipBackwardDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let command = event.command as? MPSkipIntervalCommand,
            let interval = command.preferredIntervals.first,
            let audioPlayer = audioPlayer {
            audioPlayer.seek(to: audioPlayer.currentTime - Double(truncating: interval))
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleChangePlaybackPositionCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let event = event as? MPChangePlaybackPositionCommandEvent,
            let audioPlayer = audioPlayer {
            audioPlayer.seek(to: event.positionTime)
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handleNextTrackCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let player = audioPlayer as? QueuedAudioPlayer {
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    private func handlePreviousTrackCommandDefault(event: MPRemoteCommandEvent) -> MPRemoteCommandHandlerStatus {
        if let player = audioPlayer as? QueuedAudioPlayer {
            return MPRemoteCommandHandlerStatus.success
        }
        return MPRemoteCommandHandlerStatus.commandFailed
    }

    // Converts specific errors related to the audio player's queue into appropriate remote command handler statuses.
    private func getRemoteCommandHandlerStatus(forError error: Error) -> MPRemoteCommandHandlerStatus {
        return error is AudioPlayerError.QueueError
            ? MPRemoteCommandHandlerStatus.noSuchContent
            : MPRemoteCommandHandlerStatus.commandFailed
    }

}
