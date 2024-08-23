import Foundation
import MediaPlayer

public protocol NowPlayingInfoCenter {

    var nowPlayingInfo: [String: Any]? { get set }

}

extension MPNowPlayingInfoCenter: NowPlayingInfoCenter {}
