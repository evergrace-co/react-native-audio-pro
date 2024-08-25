import Foundation
import MediaPlayer

// Protocol defining the delegate methods for AVPlayerWrapper, which handles various playback events.
// Implementing these methods allows the delegate to respond to changes in playback state, errors,
// seek operations, and other significant events during the lifecycle of the player.
protocol AVPlayerWrapperDelegate: AnyObject {

    // Notifies the delegate when the playback state changes (e.g., playing, paused).
    func AVWrapper(didChangeState state: AVPlayerWrapperState)

    // Reports the elapsed playback time, allowing for UI updates like progress bars.
    func AVWrapper(secondsElapsed seconds: Double)

    // Informs the delegate of a playback error, enabling error handling or recovery.
    func AVWrapper(failedWithError error: Error?)

    // Indicates the result of a seek operation, useful for confirming successful seeks.
    func AVWrapper(seekTo seconds: Double, didFinish: Bool)

    // Updates the media duration, which might change dynamically during streaming.
    func AVWrapper(didUpdateDuration duration: Double)

    // Indicates whether the player is ready to play, often related to buffering status.
    func AVWrapper(didChangePlayWhenReady playWhenReady: Bool)

    // Triggered when the current media item has reached the end of playback.
    func AVWrapperItemDidPlayToEndTime()

    // Called when playback fails to reach the end, often due to a critical error.
    func AVWrapperItemFailedToPlayToEndTime()

    // Notifies the delegate when playback stalls, allowing for recovery or user feedback.
    func AVWrapperItemPlaybackStalled()

    // Informs the delegate that the AVPlayer instance was recreated, requiring reconfiguration if necessary.
    func AVWrapperDidRecreateAVPlayer()
}
