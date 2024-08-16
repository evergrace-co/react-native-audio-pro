import Foundation

class EventEmitter {

    public static var shared = EventEmitter()

    private var eventEmitter: ReactNativeAudioPro!

    func register(eventEmitter: ReactNativeAudioPro) {
        self.eventEmitter = eventEmitter
    }

    func emit(event: EventType, body: Any?) {
        self.eventEmitter.sendEvent(withName: event.rawValue, body: body)
    }
}
