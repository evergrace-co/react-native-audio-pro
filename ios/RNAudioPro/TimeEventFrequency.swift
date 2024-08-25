import Foundation
import AVFoundation

/// An enumeration that represents the frequency of time-based events.
/// It is used to define how often certain actions should be triggered based on time intervals.
public enum TimeEventFrequency {

    /// Triggers an event every second.
    case everySecond

    /// Triggers an event at a custom time interval.
    /// - Parameter time: A custom time interval specified as `CMTime`.
    case custom(time: CMTime)

    /**
     Retrieves the corresponding `CMTime` value for the selected frequency.
     
     - Returns: A `CMTime` value that represents the time interval associated with the `TimeEventFrequency` case.
     */
    func getTime() -> CMTime {
        switch self {
        case .everySecond:
            // CMTime representing 1 second interval
            return CMTime(value: 1, timescale: 1)
        case .custom(let time):
            // Use the custom CMTime interval provided by the user
            return time
        }
    }
}
