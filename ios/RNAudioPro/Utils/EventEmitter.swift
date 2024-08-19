import Foundation

class EventEmitter {

    public static var shared = EventEmitter()

    private var eventEmitter: RNAudioPro!

    func register(eventEmitter: RNAudioPro) {
        self.eventEmitter = eventEmitter
    }

    func emit(event: EventType, body: Any?) {
        self.eventEmitter.sendEvent(withName: event.rawValue, body: body)
    }
}
