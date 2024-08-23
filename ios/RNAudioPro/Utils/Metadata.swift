import Foundation
import MediaPlayer

struct Metadata {
    private static var currentImageTask: URLSessionDataTask?

    static func update(for player: AudioPlayer, with metadata: [String: Any]) {
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

        player.nowPlayingInfoController.set(keyValues: ret)

        if let artworkURL = MediaURL(object: metadata["artwork"]) {
            currentImageTask = URLSession.shared.dataTask(with: artworkURL.value, completionHandler: { [weak player] (data, _, error) in
                if let data = data, let image = UIImage(data: data), error == nil {
                    let artwork = MPMediaItemArtwork(boundsSize: image.size, requestHandler: { (size) -> UIImage in
                        return image
                    })
                    player?.nowPlayingInfoController.set(keyValue: MediaItemProperty.artwork(artwork))
                }
            })

            currentImageTask?.resume()
        } else {
            player.nowPlayingInfoController.set(keyValue: MediaItemProperty.artwork(nil))
        }
    }
}
