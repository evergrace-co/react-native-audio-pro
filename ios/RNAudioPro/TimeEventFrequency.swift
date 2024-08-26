import Foundation
import AVFoundation

public enum TimeEventFrequency {

    case everySecond
    case custom(time: CMTime)

    func getTime() -> CMTime {
        switch self {
        case .everySecond:
            return CMTime(value: 1, timescale: 1)
        case .custom(let time):
            return time
        }
    }
}
