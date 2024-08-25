import Foundation
import MediaPlayer

public typealias AudioPlayerState = AVPlayerWrapperState

// Core class responsible for managing audio playback, interacting with AVPlayer,
// and handling metadata updates for Now Playing Info and remote commands.
public class AudioPlayer: AVPlayerWrapperDelegate {
    /// The wrapper around the underlying AVPlayer
    let wrapper: AVPlayerWrapperProtocol = AVPlayerWrapper()

    public let nowPlayingInfoController: NowPlayingInfoControllerProtocol
    public let remoteCommandController: RemoteCommandController
    public let event = EventHolder()

    private(set) var currentItem: AudioItem?

    /**
     Default remote commands to use for each playing item.
     Updating this will automatically apply the commands to the current item.
     */
    public var remoteCommands: [RemoteCommand] = [] {
        didSet {
            if let item = currentItem {
                self.enableRemoteCommands(forItem: item)
            }
        }
    }

    // MARK: - Getters from AVPlayerWrapper

    public var playbackError: AudioPlayerError.PlaybackError? {
        wrapper.playbackError
    }

    /**
     The elapsed playback time of the current item.
     */
    public var currentTime: Double {
        wrapper.currentTime
    }

    /**
     The duration of the current AudioItem.
     */
    public var duration: Double {
        wrapper.duration
    }

    /**
     The buffered position of the current AudioItem.
     */
    public var bufferedPosition: Double {
        wrapper.bufferedPosition
    }

    /**
     The current state of the underlying `AudioPlayer`.
     */
    public var playerState: AudioPlayerState {
        wrapper.state
    }

    // MARK: - Setters for AVPlayerWrapper

    /**
     Whether the player should start playing automatically when the item is ready.
     */
    public var playWhenReady: Bool {
        get { wrapper.playWhenReady }
        set {
            wrapper.playWhenReady = newValue
        }
    }

    /**
     The amount of seconds to be buffered by the player. Default value is 0 seconds, this means the AVPlayer will choose an appropriate level of buffering. Setting `bufferDuration` to larger than zero automatically disables `automaticallyWaitsToMinimizeStalling`. Setting it back to zero automatically enables `automaticallyWaitsToMinimizeStalling`.

     [Read more from Apple Documentation](https://developer.apple.com/documentation/avfoundation/avplayeritem/1643630-preferredforwardbufferduration)
     */
    public var bufferDuration: TimeInterval {
        get { wrapper.bufferDuration }
        set {
            wrapper.bufferDuration = newValue
            wrapper.automaticallyWaitsToMinimizeStalling = wrapper.bufferDuration == 0
        }
    }

    /**
     Controls whether the player automatically delays playback to minimize stalling.
     Adjusting this will also reset buffer duration if necessary.
     */
    public var automaticallyWaitsToMinimizeStalling: Bool {
        get { wrapper.automaticallyWaitsToMinimizeStalling }
        set {
            if newValue {
                wrapper.bufferDuration = 0
            }
            wrapper.automaticallyWaitsToMinimizeStalling = newValue
        }
    }

    /**
     Set this to decide how often the player should call the delegate with time progress events.
     */
    public var timeEventFrequency: TimeEventFrequency {
        get { wrapper.timeEventFrequency }
        set { wrapper.timeEventFrequency = newValue }
    }

    public var volume: Float {
        get { wrapper.volume }
        set { wrapper.volume = newValue }
    }

    public var isMuted: Bool {
        get { wrapper.isMuted }
        set { wrapper.isMuted = newValue }
    }

    public var rate: Float {
        get { wrapper.rate }
        set {
            wrapper.rate = newValue
            updateNowPlayingPlaybackValues()
        }
    }

    // MARK: - Init

    /**
     Initializes a new AudioPlayer with default Now Playing Info and Remote Command controllers.
     */
    public init(nowPlayingInfoController: NowPlayingInfoControllerProtocol = NowPlayingInfoController(),
                remoteCommandController: RemoteCommandController = RemoteCommandController()) {
        self.nowPlayingInfoController = nowPlayingInfoController
        self.remoteCommandController = remoteCommandController

        wrapper.delegate = self
        self.remoteCommandController.audioPlayer = self
    }

    // MARK: - Player Actions

    /**
     Load an AudioItem into the player.
     Automatically starts playback after loading.
     */
    public func load(item: AudioItem) {
        currentItem = item

        // Update Now Playing Info metadata
        loadNowPlayingMetaValues()
        enableRemoteCommands(forItem: item)

        // Always start playback immediately
        wrapper.load(
            from: item.getSourceUrl(),
            playWhenReady: true,
            initialTime: (item as? InitialTiming)?.getInitialTime(),
            options:(item as? AssetOptionsProviding)?.getAssetOptions()
        )
    }

    /**
     Toggle playback status.
     */
    public func togglePlaying() {
        wrapper.togglePlaying()
    }

    /**
     Start playback.
     */
    public func play() {
        wrapper.play()
    }

    /**
     Pause playback.
     */
    public func pause() {
        wrapper.pause()
    }

    /**
     Stop playback and emit an event if the player was active.
     */
    public func stop() {
        let wasActive = wrapper.playbackActive
        wrapper.stop()
        if wasActive {
            event.playbackEnd.emit(data: .playerStopped)
        }
    }

    /**
     Reload the current item.
     */
    public func reload(startFromCurrentTime: Bool) {
        wrapper.reload(startFromCurrentTime: startFromCurrentTime)
    }

    /**
     Seek to a specific time in the item.
     */
    public func seek(to seconds: TimeInterval) {
        wrapper.seek(to: seconds)
    }

    /**
     Seek by a relative time offset in the item.
     */
    public func seek(by offset: TimeInterval) {
        wrapper.seek(by: offset)
    }

    // MARK: - Remote Command Center

    /**
     Enable the specified remote commands for the player.
     */
    func enableRemoteCommands(_ commands: [RemoteCommand]) {
        remoteCommandController.enable(commands: commands)
    }

    /**
     Enable remote commands based on the currently loaded item or use the default commands.
     */
    func enableRemoteCommands(forItem item: AudioItem) {
        if let item = item as? RemoteCommandable {
            self.enableRemoteCommands(item.getCommands())
        } else {
            self.enableRemoteCommands(remoteCommands)
        }
    }

    // MARK: - NowPlayingInfo

    /**
     Loads Now Playing Info metadata with the values found in the current `AudioItem`.
     This updates the information displayed in the Control Center and lock screen.
     */
    public func loadNowPlayingMetaValues() {
        guard let item = currentItem else { return }

        nowPlayingInfoController.set(keyValues: [
            MediaItemProperty.artist(item.getArtist()),
            MediaItemProperty.title(item.getTitle()),
            MediaItemProperty.albumTitle(item.getAlbumTitle()),
        ])
        loadArtwork(forItem: item)
    }

    /**
     Updates the playback-related values in Now Playing Info such as current time and playback rate.
     */
    func updateNowPlayingPlaybackValues() {
        nowPlayingInfoController.set(keyValues: [
            MediaItemProperty.duration(wrapper.duration),
            NowPlayingInfoProperty.playbackRate(Double(wrapper.rate)),
            NowPlayingInfoProperty.elapsedPlaybackTime(wrapper.currentTime)
        ])
    }

    /**
     Clears the player and Now Playing Info, stopping any ongoing playback.
     */
    public func clear() {
        let playbackWasActive = wrapper.playbackActive
        currentItem = nil
        wrapper.unload()
        nowPlayingInfoController.clear()
        if playbackWasActive {
            event.playbackEnd.emit(data: .cleared)
        }
    }

    // MARK: - Private

    private func setNowPlayingCurrentTime(seconds: Double) {
        nowPlayingInfoController.set(
            keyValue: NowPlayingInfoProperty.elapsedPlaybackTime(seconds)
        )
    }

    private func loadArtwork(forItem item: AudioItem) {
        item.getArtwork { (image) in
            if let image = image {
                let artwork = MPMediaItemArtwork(boundsSize: image.size, requestHandler: { _ in image })
                self.nowPlayingInfoController.set(keyValue: MediaItemProperty.artwork(artwork))
            } else {
                self.nowPlayingInfoController.set(keyValue: MediaItemProperty.artwork(nil))
            }
        }
    }

    // MARK: - AVPlayerWrapperDelegate

    func AVWrapper(didChangeState state: AVPlayerWrapperState) {
        switch state {
        case .ready, .loading, .playing, .paused:
            updateNowPlayingPlaybackValues()
        default: break
        }
        event.stateChange.emit(data: state)
    }

    func AVWrapper(secondsElapsed seconds: Double) {
        event.secondElapse.emit(data: seconds)
    }

    func AVWrapper(failedWithError error: Error?) {
        event.fail.emit(data: error)
        event.playbackEnd.emit(data: .failed)
    }

    func AVWrapper(seekTo seconds: Double, didFinish: Bool) {
        setNowPlayingCurrentTime(seconds: Double(seconds))
        event.seek.emit(data: (seconds, didFinish))
    }

    func AVWrapper(didUpdateDuration duration: Double) {
        event.updateDuration.emit(data: duration)
    }

    func AVWrapperItemDidPlayToEndTime() {
        event.playbackEnd.emit(data: .playedUntilEnd)
        wrapper.state = .ended
    }

    func AVWrapperItemFailedToPlayToEndTime() {
        AVWrapper(failedWithError: AudioPlayerError.PlaybackError.playbackFailed)
    }

    func AVWrapperItemPlaybackStalled() {
        // Implement if needed to handle playback stall scenarios.
    }

    func AVWrapperDidRecreateAVPlayer() {
        event.didRecreateAVPlayer.emit(data: ())
    }
}
