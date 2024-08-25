import Foundation

// Singleton class responsible for emitting events to the JavaScript side of the React Native module
class EventEmitter {

    // Shared instance of EventEmitter, implementing the Singleton pattern to ensure
    // a single event emitter across the app
    public static var shared = EventEmitter()

    // Reference to the RNAudioPro event emitter, which will be used to send events to JavaScript
    private var eventEmitter: RNAudioPro!

    // Method to register the RNAudioPro event emitter, typically called during initialization
    // This allows the EventEmitter to hold a reference to the React Native module's event emitter
    func register(eventEmitter: RNAudioPro) {
        self.eventEmitter = eventEmitter
    }

    // Method to emit events to the JavaScript side with the given event type and optional body
    // The event type is converted to a string using its raw value, and the event is sent to React Native
    func emit(event: EventType, body: Any?) {
        self.eventEmitter.sendEvent(withName: event.rawValue, body: body)
    }
}
