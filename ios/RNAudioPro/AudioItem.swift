import Foundation
import AVFoundation
import UIKit

public typealias AudioItemImage = UIImage

// Defines the required properties and methods for an audio item, which represents
// a track or media item that can be played. Since this module only supports remote URLs,
// the interface focuses on retrieving metadata and the source URL.
public protocol AudioItem {
    func getSourceUrl() -> String
    func getArtist() -> String?
    func getTitle() -> String
    func getAlbumTitle() -> String?
    func getArtwork(_ handler: @escaping (AudioItemImage) -> Void)
}

// Protocol for audio items that need to start playback from a specific time rather than the beginning.
// Useful for resuming playback or starting from a bookmarked position.
public protocol InitialTiming {
    func getInitialTime() -> TimeInterval
}

// Protocol for providing custom asset options when initializing an AVURLAsset.
// This allows fine-tuning of how the asset is prepared for playback, like caching policies or network access.
public protocol AssetOptionsProviding {
    func getAssetOptions() -> [String: Any]
}

// Default implementation of the AudioItem protocol, representing a typical media item with associated metadata.
// This class assumes all media is streamed from a remote URL, consistent with the module's focus.
public class DefaultAudioItem: AudioItem, Identifiable {

    public var audioUrl: String
    public var artist: String?
    public var title: String
    public var albumTitle: String?
    public var artwork: AudioItemImage

    // Initializes a new audio item with the provided metadata.
    // `audioUrl` is mandatory since streaming is the primary focus of this module.
    public init(audioUrl: String, artist: String? = nil, title: String, albumTitle: String? = nil, artwork: AudioItemImage) {
        self.audioUrl = audioUrl
        self.artist = artist
        self.title = title
        self.albumTitle = albumTitle
        self.artwork = artwork
    }

    public func getSourceUrl() -> String {
        audioUrl
    }

    public func getArtist() -> String? {
        artist
    }

    public func getTitle() -> String {
        title
    }

    public func getAlbumTitle() -> String? {
        albumTitle
    }

    // Retrieves the artwork associated with this audio item.
    // The artwork is provided asynchronously through a callback, making it easy to update UI elements without blocking the main thread.
    public func getArtwork(_ handler: @escaping (AudioItemImage) -> Void) {
        handler(artwork)
    }
}

// Subclass of DefaultAudioItem that includes the ability to start playback at a specific time.
// This is useful for implementing features like resuming playback from where the user left off.
public class DefaultAudioItemInitialTime: DefaultAudioItem, InitialTiming {

    public var initialTime: TimeInterval

    // Initializes an audio item with an initial playback time, allowing the player to start at a specified point.
    public override init(audioUrl: String, artist: String?, title: String, albumTitle: String?, artwork: AudioItemImage) {
        self.initialTime = 0.0
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, artwork: artwork)
    }

    public init(audioUrl: String, artist: String?, title: String, albumTitle: String?, artwork: AudioItemImage, initialTime: TimeInterval) {
        self.initialTime = initialTime
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, artwork: artwork)
    }

    public func getInitialTime() -> TimeInterval {
        initialTime
    }
}

// Subclass of DefaultAudioItem that supports custom asset options.
// This allows for more advanced configurations when initializing the media asset, such as specifying caching policies or custom headers.
public class DefaultAudioItemAssetOptionsProviding: DefaultAudioItem, AssetOptionsProviding {

    public var options: [String: Any]
    
    public override init(audioUrl: String, artist: String?, title: String, albumTitle: String?, artwork: AudioItemImage) {
        self.options = [:]
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, artwork: artwork)
    }

    public init(audioUrl: String, artist: String?, title: String, albumTitle: String?, artwork: AudioItemImage, options: [String: Any]) {
        self.options = options
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, artwork: artwork)
    }

    public func getAssetOptions() -> [String: Any] {
        options
    }
}
