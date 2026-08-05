import {
  rgoEventBus,
  type RgoEventBus,
  type RgoEventListener,
  type RgoEventName,
  type RgoEventPayload,
} from "@/events/RgoEventBus";
import React from "react";

/**
 * Subscribes to a bus event for the lifetime of the component.
 *
 * The listener is read at dispatch time, so an inline arrow function is fine
 * and does not need memoising — the subscription is never torn down just
 * because the callback identity changed.
 */
export function useRgoEventListener<TName extends RgoEventName>(
  name: TName,
  listener: RgoEventListener<TName>,
  { bus = rgoEventBus, enabled = true }: { bus?: RgoEventBus; enabled?: boolean } = {},
): void {
  const listenerRef = React.useRef(listener);

  React.useEffect(() => {
    listenerRef.current = listener;
  });

  React.useEffect(() => {
    if (!enabled) return;

    return bus.on(name, ((payload: RgoEventPayload<TName>) => {
      (listenerRef.current as (payload: RgoEventPayload<TName>) => void)(payload);
    }) as RgoEventListener<TName>);
  }, [bus, name, enabled]);
}
