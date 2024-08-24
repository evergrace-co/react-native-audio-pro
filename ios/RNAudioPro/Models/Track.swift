import Foundation
import MediaPlayer
import AVFoundation

class Track: AudioItem, AssetOptionsProviding {
    let url: MediaURL

    @objc var title: String?
    @objc var artist: String?

    var duration: Double?
    var artworkURL: MediaURL?
    let headers: [String: Any]?

    var album: String?
    var artwork: MPMediaItemArtwork?

    private var originalObject: [String: Any] = [:]

    init?(dictionary: [String: Any]) {
        guard let url = MediaURL(object: dictionary["url"]) else { return nil }
        self.url = url
        self.headers = dictionary["headers"] as? [String: Any]

        updateMetadata(dictionary: dictionary);
    }


    // MARK: - Public Interface

    func toObject() -> [String: Any] {
        return originalObject
    }

    func updateMetadata(dictionary: [String: Any]) {
        self.title = (dictionary["title"] as? String) ?? self.title
        self.artist = (dictionary["artist"] as? String) ?? self.artist
        self.album = dictionary["album"] as? String
        self.duration = dictionary["duration"] as? Double
        self.artworkURL = MediaURL(object: dictionary["artwork"])

        self.originalObject = self.originalObject.merging(dictionary) { (_, new) in new }
    }

    // MARK: - AudioItem Protocol

    func getSourceUrl() -> String {
        return url.value.absoluteString
    }

    func getArtist() -> String? {
        return artist
    }

    func getTitle() -> String? {
        return title
    }

    func getAlbumTitle() -> String? {
        return album
    }

    func getSourceType() -> SourceType {
        return .stream
    }

    func getArtwork(_ handler: @escaping (UIImage?) -> Void) {
        if let artworkURL = artworkURL?.value {
            URLSession.shared.dataTask(with: artworkURL, completionHandler: { (data, _, error) in
                if let data = data, let artwork = UIImage(data: data), error == nil {
                    handler(artwork)
                } else {
                    handler(nil)
                }
            }).resume()
        } else {
            handler(nil)
        }
    }

    // MARK: - Authorizing Protocol

    func getAssetOptions() -> [String: Any] {
        var options: [String: Any] = [:]
        if let headers = headers {
            options["AVURLAssetHTTPHeaderFieldsKey"] = headers
        }
        return options
    }

}
