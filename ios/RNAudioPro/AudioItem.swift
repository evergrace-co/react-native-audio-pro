import Foundation
import AVFoundation

#if os(iOS)
import UIKit
public typealias AudioItemImage = UIImage
#elseif os(macOS)
import AppKit
public typealias AudioItemImage = NSImage
#endif

public enum SourceType {
    case stream
    case file
}

public protocol AudioItem {
    func getSourceUrl() -> String
    func getArtist() -> String?
    func getTitle() -> String?
    func getAlbumTitle() -> String?
    func getSourceType() -> SourceType
    func getArtwork(_ handler: @escaping (AudioItemImage?) -> Void)
}

/// Make your `AudioItem`-subclass conform to this protocol to control enable the ability to start an item at a specific time of playback.
public protocol InitialTiming {
    func getInitialTime() -> TimeInterval
}

/// Make your `AudioItem`-subclass conform to this protocol to set initialization options for the asset. Available keys available at [Apple Developer Documentation](https://developer.apple.com/documentation/avfoundation/avurlasset/initialization_options).
public protocol AssetOptionsProviding {
    func getAssetOptions() -> [String: Any]
}

public class DefaultAudioItem: AudioItem, Identifiable {

    public var audioUrl: String

    public var artist: String?

    public var title: String?

    public var albumTitle: String?

    public var sourceType: SourceType

    public var artwork: AudioItemImage?

    public init(audioUrl: String, artist: String? = nil, title: String? = nil, albumTitle: String? = nil, sourceType: SourceType, artwork: AudioItemImage? = nil) {
        self.audioUrl = audioUrl
        self.artist = artist
        self.title = title
        self.albumTitle = albumTitle
        self.sourceType = sourceType
        self.artwork = artwork
    }

    public func getSourceUrl() -> String {
        audioUrl
    }

    public func getArtist() -> String? {
        artist
    }

    public func getTitle() -> String? {
        title
    }

    public func getAlbumTitle() -> String? {
        albumTitle
    }

    public func getSourceType() -> SourceType {
        sourceType
    }

    public func getArtwork(_ handler: @escaping (AudioItemImage?) -> Void) {
        handler(artwork)
    }

}

/// An AudioItem that also conforms to the `InitialTiming`-protocol
public class DefaultAudioItemInitialTime: DefaultAudioItem, InitialTiming {

    public var initialTime: TimeInterval

    public override init(audioUrl: String, artist: String?, title: String?, albumTitle: String?, sourceType: SourceType, artwork: AudioItemImage?) {
        initialTime = 0.0
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, sourceType: sourceType, artwork: artwork)
    }

    public init(audioUrl: String, artist: String?, title: String?, albumTitle: String?, sourceType: SourceType, artwork: AudioItemImage?, initialTime: TimeInterval) {
        self.initialTime = initialTime
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, sourceType: sourceType, artwork: artwork)
    }

    public func getInitialTime() -> TimeInterval {
        initialTime
    }
}

/// An AudioItem that also conforms to the `AssetOptionsProviding`-protocol
public class DefaultAudioItemAssetOptionsProviding: DefaultAudioItem, AssetOptionsProviding {

    public var options: [String: Any]

    public override init(audioUrl: String, artist: String?, title: String?, albumTitle: String?, sourceType: SourceType, artwork: AudioItemImage?) {
        options = [:]
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, sourceType: sourceType, artwork: artwork)
    }

    public init(audioUrl: String, artist: String?, title: String?, albumTitle: String?, sourceType: SourceType, artwork: AudioItemImage?, options: [String: Any]) {
        self.options = options
        super.init(audioUrl: audioUrl, artist: artist, title: title, albumTitle: albumTitle, sourceType: sourceType, artwork: artwork)
    }

    public func getAssetOptions() -> [String: Any] {
        options
    }
}
