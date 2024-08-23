import Foundation


public enum AudioPlayerError: Error {

    public enum PlaybackError: Error {
        case failedToLoadKeyValue
        case invalidSourceUrl(String)
        case notConnectedToInternet
        case playbackFailed
        case itemWasUnplayable
    }

    public enum QueueError: Error {
        case noCurrentItem
        case invalidIndex(index: Int, message: String)
        case empty
    }
}
