import Foundation
import MediaPlayer

// Struct to manage updating media metadata for the audio player, including Now Playing info
struct Metadata {
    // Holds the current image download task, allowing it to be canceled if needed
    private static var currentImageTask: URLSessionDataTask?

    // Updates the Now Playing information for the audio player based on the provided metadata
    static func update(for player: AudioPlayer, with metadata: [String: Any]) {
        // Cancel any ongoing image download task to prevent outdated artwork from being set
        currentImageTask?.cancel()
        var ret: [NowPlayingInfoKeyValue] = []

        if let title = metadata["title"] as? String {
            ret.append(MediaItemProperty.title(title))
        }

        if let artist = metadata["artist"] as? String {
            ret.append(MediaItemProperty.artist(artist))
        }

        if let album = metadata["album"] as? String {
            ret.append(MediaItemProperty.albumTitle(album))
        }

        if let duration = metadata["duration"] as? Double {
            ret.append(MediaItemProperty.duration(duration))
        }

        if let elapsedTime = metadata["elapsedTime"] as? Double {
            ret.append(NowPlayingInfoProperty.elapsedPlaybackTime(elapsedTime))
        }

        // Update the player's Now Playing info with the gathered metadata
        player.nowPlayingInfoController.set(keyValues: ret)

        // Artwork is mandatory, so always handle it
        let artworkURL = URL(object: metadata["artwork"])!
        
        // Begin downloading the artwork image from the URL
        currentImageTask = URLSession.shared.dataTask(with: artworkURL.value, completionHandler: { [weak player] (data, _, error) in
            // On successful download, set the artwork in the Now Playing info
            if let data = data, let image = UIImage(data: data), error == nil {
                let artwork = MPMediaItemArtwork(boundsSize: image.size, requestHandler: { (size) -> UIImage in
                    return image
                })
                // Update the player's Now Playing info with the new artwork
                player?.nowPlayingInfoController.set(keyValue: MediaItemProperty.artwork(artwork))
            }
        })

        // Start the image download task
        currentImageTask?.resume()
    }
}
