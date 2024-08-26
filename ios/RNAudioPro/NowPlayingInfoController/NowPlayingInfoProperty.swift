import Foundation
import MediaPlayer


/**
 Enum representing MPNowPlayingInfoProperties.
 Docs for each property is taken from [Apple docs](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter/additional_metadata_properties).
 */
public enum NowPlayingInfoProperty: NowPlayingInfoKeyValue {

    /**
     The URL pointing to the now playing item's underlying asset.
     This constant is used by the system UI when video thumbnails or audio waveform visualizations are applicable.
     */
    case assetUrl(URL?)

    /**
     The default playback rate for the now playing item.
     Value is an NSNumber object configured as a double. Set this property if your app is playing a media item at a playback rate other than 1.0 as its default rate.
     */
    case defaultPlaybackRate(Double?)

    /**
     The elapsed time of the now playing item, in seconds.
     Value is an NSNumber object configured as a double. Elapsed time is automatically calculated, by the system, from the previously provided elapsed time and the playback rate. Do not update this property frequently—it is not necessary
     */
    case elapsedPlaybackTime(Double?)

    /**
     The current progress of the now playing item.
     Value is an NSNumber object configured as a float. A value of 0.0 indicates the item has not been watched while a value of 1.0 indicates the item has been fully watched. This is a high-level indicator. Use MPNowPlayingInfoPropertyElapsedPlaybackTime for fine-detailed information on how much of the item has been watched.
     */
    case playbackProgress(Float?)

    /**
     The total number of items in the app’s playback queue.
     Value is an NSNumber object configured as an NSUInteger.
     */
    case playbackQueueCount(UInt64?)

    /**
     The index of the now-playing item in the app’s playback queue.
     Value is an NSNumber object configured as an NSUInteger. The playback queue uses zero-based indexing. If you want the first item in the queue to be displayed as “item 1 of 10,” for example, set the item’s index to 0.
     */
    case playbackQueueIndex(UInt64?)

    /**
     The playback rate of the now-playing item, with a value of 1.0 indicating the normal playback rate.
     Value is an NSNumber object configured as a double. The default value is 1.0. A playback rate value of 2.0 means twice the normal playback rate; a piece of media played at this rate would take half as long to play to completion. A value of 0.5 means half the normal playback rate; a piece of media played at this rate would take twice as long to play to completion.
     */
    case playbackRate(Double?)

    /**
     The service provider associated with the now-playing item.
     Value is a unique NSString that identifies the service provider for the now-playing item. If the now-playing item belongs to a channel or subscription service, this key can be used to coordinate various types of now-playing content from the service provider.
     */
    case serviceIdentifier(String?)


    public func getKey() -> String {
        switch self {
            
        case .assetUrl(_):
            return MPNowPlayingInfoPropertyAssetURL

        case .defaultPlaybackRate(_):
            return MPNowPlayingInfoPropertyDefaultPlaybackRate

        case .elapsedPlaybackTime(_):
            return MPNowPlayingInfoPropertyElapsedPlaybackTime

        case .mediaType(_):
            return MPNowPlayingInfoPropertyMediaType

        case .playbackProgress(_):
            return MPNowPlayingInfoPropertyPlaybackProgress

        case .playbackQueueCount(_):
            return MPNowPlayingInfoPropertyPlaybackQueueCount

        case .playbackQueueIndex(_):
            return MPNowPlayingInfoPropertyPlaybackQueueIndex

        case .playbackRate(_):
            return MPNowPlayingInfoPropertyPlaybackRate

        case .serviceIdentifier(_):
            return MPNowPlayingInfoPropertyServiceIdentifier

        }
    }

    public func getValue() -> Any? {
        switch self {

        case .assetUrl(let url):
            return url

        case .defaultPlaybackRate(let rate):
            return rate != nil ? NSNumber(floatLiteral: rate!) : nil

        case .elapsedPlaybackTime(let time):
            return time != nil ? NSNumber(floatLiteral: time!) : nil

        case .mediaType(let type):
            return type != nil ? NSNumber(value: type!.rawValue) : nil

        case .playbackProgress(let progress):
            return progress != nil ? NSNumber(value: progress!) : nil

        case .playbackQueueCount(let count):
            return count != nil ? NSNumber(value: count!) : nil

        case .playbackQueueIndex(let index):
            return index != nil ? NSNumber(value: index!) : nil

        case .playbackRate(let rate):
            return rate != nil ? NSNumber(floatLiteral: rate!) : nil

        case .serviceIdentifier(let id):
            return id != nil ? NSString(string: id!) : nil

        }
    }

}
