import Foundation
import AVFoundation
import MediaPlayer
import React

@objc(RNAudioPro)
class RNAudioPro: RCTEventEmitter {

    private var player: AVPlayer?
    private let eventNames = EventNames.self

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return eventNames.allCases.map { $0.rawValue }
    }

    @objc func play(_ url: String, headers: [String: String] = [:], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let audioURL = URL(string: url) else {
            reject("Invalid URL", "The provided URL is invalid.", nil)
            return
        }

        let asset = AVURLAsset(url: audioURL, options: ["AVURLAssetHTTPHeaderFieldsKey": headers])
        let playerItem = AVPlayerItem(asset: asset)
        player = AVPlayer(playerItem: playerItem)
        player?.play()

        setupRemoteCommandCenter()
        setupNowPlayingInfo()

        resolve(nil)
    }

    // Implement pause, resume, stop, seekTo, seekBy with proper typings

    private func setupRemoteCommandCenter() {
        let commandCenter = MPRemoteCommandCenter.shared()

        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { [weak self] event in
            self?.player?.play()
            self?.sendEvent(withName: self?.eventNames.ON_PLAY.rawValue ?? "", body: nil)
            return .success
        }

        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { [weak self] event in
            self?.player?.pause()
            self?.sendEvent(withName: self?.eventNames.ON_PAUSE.rawValue ?? "", body: nil)
            return .success
        }

        // Add other command handlers as needed
    }

    private func setupNowPlayingInfo() {
        // Set up now playing info with title, artist, artwork
        var nowPlayingInfo = [String: Any]()
        nowPlayingInfo[MPMediaItemPropertyTitle] = "Track Title"
        nowPlayingInfo[MPMediaItemPropertyArtist] = "Artist Name"
        // Add artwork if available

        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }
}

enum EventNames: String, CaseIterable {
    case ON_PLAY = "onPlay"
    case ON_PAUSE = "onPause"
    case ON_SKIP_TO_NEXT = "onSkipToNext"
    case ON_SKIP_TO_PREVIOUS = "onSkipToPrevious"
    case ON_BUFFERING = "onBuffering"
    case ON_LOADING = "onLoading"
    case ON_ERROR = "onError"
    case ON_FINISHED = "onFinished"
    case ON_DURATION_RECEIVED = "onDurationReceived"
    case ON_SEEK = "onSeek"
}
