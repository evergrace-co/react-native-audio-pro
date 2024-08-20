import {Event} from './constants';
import type {EventPayloadByEvent, ServiceHandler} from './types';
import {AppRegistry, Platform} from 'react-native';
import {emitter} from './audio-pro';

/**
 * Register the playback service.
 */
export function registerPlaybackService(factory: () => ServiceHandler) {
	if (Platform.OS === 'android') {
		// Registers the headless task
		AppRegistry.registerHeadlessTask('AudioPro', factory);
	} else {
		// Initializes and runs the service in the next tick
		setImmediate(factory());
	}
}

/**
 * Add an event listener.
 */
export function addEventListener<T extends Event>(
	event: T,
	listener: EventPayloadByEvent[T] extends never
		? () => void
		: (event: EventPayloadByEvent[T]) => void,
) {
	return emitter.addListener(event, listener);
}
