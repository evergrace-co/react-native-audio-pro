import Foundation
import SwiftAudioPro

enum State: String {
    case none, ready, playing, paused, stopped, buffering, loading, error, ended

    static func fromPlayerState(state: AVPlayerWrapperState) -> State {
        switch state {
        case .paused: return .paused
        case .buffering: return .buffering
        case .idle: return .none
        case .loading: return .loading
        case .playing: return .playing
        case .ready: return .ready
        case .failed: return .error
        case .stopped: return .stopped
        case .ended: return .ended
        }
    }
}