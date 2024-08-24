import Foundation
import MediaPlayer
import AVFoundation

func configureAudioSession() {
    let session = AVAudioSession.sharedInstance()
    do {
        // Set the audio session category, mode, and policy
        try session.setCategory(.playback, mode: .spokenAudio, policy: .longFormAudio, options: [.defaultToSpeaker])
        
        // Activate the audio session
        try session.setActive(true)
    } catch {
        print("Failed to set audio session category: \(error)")
    }
}
