import Foundation


public protocol NowPlayingInfoKeyValue {
    func getKey() -> String
    func getValue() -> Any?
}
