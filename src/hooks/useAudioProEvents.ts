import { useEffect, useRef } from 'react';

import { addEventListener } from '../audioPro';
import { Event } from '../constants';
import type { EventPayloadByEventWithType } from '../interfaces';

/**
 * Attaches a handler to the given AudioPro events and performs cleanup on unmount
 * @param events - AudioPro events to subscribe to
 * @param handler - callback invoked when the event fires
 */
export const useAudioProEvents = <
  T extends Event[],
  H extends (data: EventPayloadByEventWithType[T[number]]) => void
>(
  events: T,
  handler: H
) => {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    if (__DEV__) {
      const allowedTypes = Object.values(Event);
      const invalidTypes = events.filter(
        (type) => !allowedTypes.includes(type)
      );
      if (invalidTypes.length) {
        console.warn(
          'One or more of the events provided to useAudioProEvents is ' +
            `not a valid AudioPro event: ${invalidTypes.join("', '")}. ` +
            'A list of available events can be found at ' +
            'https://rnap.dev/docs/api/events'
        );
      }
    }

    const subs = events.map((type) =>
      addEventListener(type, (payload) => {
        // @ts-expect-error - we know the type is correct
        savedHandler.current({ ...payload, type });
      })
    );

    return () => subs.forEach((sub) => sub.remove());
  }, events);
};
