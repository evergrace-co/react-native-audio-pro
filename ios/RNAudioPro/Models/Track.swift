import Foundation
import MediaPlayer
import AVFoundation

class Track: AudioItem, AssetOptionsProviding {
    
    let url: URL

    @objc var title: String
    @objc var artist: String?

    var duration: Double?
    var artworkURL: URL
    let headers: [String: Any]?

    var album: String?
    var artwork: MPMediaItemArtwork

    private var originalObject: [String: Any] = [:]

    init?(dictionary: [String: Any]) {
        // Safely unwrap and cast the value to URL
        if let urlString = dictionary["url"] as? String, let url = URL(string: urlString) {
            self.url = url
        } else {
            // Return nil if the URL is not valid
            return nil
        }

        // Safely cast headers to the expected type
        self.headers = dictionary["headers"] as? [String: Any]

        // Update metadata
        updateMetadata(dictionary: dictionary)
    }

    func toObject() -> [String: Any] {
        return originalObject
    }

    func updateMetadata(dictionary: [String: Any]) {
        self.title = (dictionary["title"] as? String) ?? self.title
        self.artist = (dictionary["artist"] as? String) ?? self.artist
        self.album = dictionary["album"] as? String
        self.duration = dictionary["duration"] as? Double
        
        // Extract the URL from the URL object, if it exists
        if let mediaURL = URL(object: dictionary["artwork"]) {
            self.artworkURL = mediaURL.value
        }

        self.originalObject = self.originalObject.merging(dictionary) { (_, new) in new }
    }

    func getSourceUrl() -> String {
        return url.absoluteString
    }

    func getArtist() -> String? {
        return artist
    }

    func getTitle() -> String {
        return title
    }

    func getAlbumTitle() -> String? {
        return album
    }

    func getArtwork(_ handler: @escaping (UIImage?) -> Void) {
        URLSession.shared.dataTask(with: artworkURL, completionHandler: { (data, _, error) in
            if let data = data, let artwork = UIImage(data: data), error == nil {
                handler(artwork)
            } else {
                handler(nil)
            }
        }).resume()
    }

    func getAssetOptions() -> [String: Any] {
        var options: [String: Any] = [:]
        if let headers = headers {
            options["AVURLAssetHTTPHeaderFieldsKey"] = headers
        }
        return options
    }

}
