"use client";

import React from "react";
import type {
  UseVireoEventSourceOptions,
  UseVireoEventSourceResult,
  VireoEventSourceListener,
  VireoEventSourceListenerError,
  VireoEventSourceStatus,
} from "./useVireoEventSource.types";

export type {
  UseVireoEventSourceOptions,
  UseVireoEventSourceResult,
  VireoEventSourceListener,
  VireoEventSourceListenerError,
  VireoEventSourceListeners,
  VireoEventSourceStatus,
} from "./useVireoEventSource.types";

type ConnectionConfiguration = Readonly<{
  enabled: boolean;
  url: string;
  withCredentials: boolean;
}>;

function useCommittedRef<T>(value: T) {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref;
}

function resolveUrl(url: string | URL, enabled: boolean) {
  const resolved = typeof url === "string" ? url : url.toString();
  if (enabled && resolved.trim().length === 0) {
    throw new TypeError("useVireoEventSource url must not be blank while the connection is enabled.");
  }
  return resolved;
}

function validateListenerNames(listeners: Readonly<Record<string, unknown>>) {
  if (Object.prototype.hasOwnProperty.call(listeners, "message")) {
    throw new TypeError('useVireoEventSource reserves the "message" event name for the onMessage callback.');
  }
}

function isPromiseLike(value: unknown): value is PromiseLike<void> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as PromiseLike<void>).then === "function"
  );
}

/**
 * Owns one native EventSource connection without imposing application event,
 * decoding, authentication, visibility, or connectivity policy.
 */
export function useVireoEventSource<TEventName extends string = string>({
  url,
  enabled = true,
  withCredentials = false,
  listeners = {},
  onOpen,
  onError,
  onMessage,
  onListenerError,
}: UseVireoEventSourceOptions<TEventName>): UseVireoEventSourceResult {
  validateListenerNames(listeners);

  const resolvedUrl = resolveUrl(url, enabled);
  const [status, setStatus] = React.useState<VireoEventSourceStatus>(enabled ? "connecting" : "closed");
  const sourceRef = React.useRef<EventSource | null>(null);
  const namedDispatchersRef = React.useRef(new Map<string, EventListener>());

  const listenersRef = useCommittedRef(listeners);
  const onOpenRef = useCommittedRef(onOpen);
  const onErrorRef = useCommittedRef(onError);
  const onMessageRef = useCommittedRef(onMessage);
  const onListenerErrorRef = useCommittedRef(onListenerError);
  const configurationRef = useCommittedRef<ConnectionConfiguration>({ enabled, url: resolvedUrl, withCredentials });

  const reportListenerError = React.useCallback(
    (failure: VireoEventSourceListenerError<TEventName>, asynchronous: boolean) => {
      const handler = onListenerErrorRef.current;
      if (handler !== undefined) {
        handler(failure);
        return;
      }

      if (asynchronous) {
        void Promise.reject(failure.error);
        return;
      }

      throw failure.error;
    },
    [onListenerErrorRef],
  );

  const invokeListener = React.useCallback(
    (listener: VireoEventSourceListener, event: MessageEvent<string>, eventName: TEventName | null) => {
      let result: Promise<void> | void;
      try {
        result = listener(event);
      } catch (error) {
        reportListenerError({ error, eventName, event }, false);
        return;
      }

      if (!isPromiseLike(result)) return;
      void Promise.resolve(result).catch(error => {
        reportListenerError({ error, eventName, event }, true);
      });
    },
    [reportListenerError],
  );

  const removeNamedDispatchers = React.useCallback((source: EventSource) => {
    for (const [eventName, dispatcher] of namedDispatchersRef.current) {
      source.removeEventListener(eventName, dispatcher);
    }
    namedDispatchersRef.current.clear();
  }, []);

  const closeCurrentSource = React.useCallback(() => {
    const source = sourceRef.current;
    if (source === null) return;

    sourceRef.current = null;
    removeNamedDispatchers(source);
    source.onopen = null;
    source.onerror = null;
    source.onmessage = null;
    source.close();
  }, [removeNamedDispatchers]);

  const synchronizeNamedDispatchers = React.useCallback(
    (source: EventSource) => {
      const currentNames = new Set(Object.keys(listenersRef.current));

      for (const [eventName, dispatcher] of namedDispatchersRef.current) {
        if (currentNames.has(eventName)) continue;
        source.removeEventListener(eventName, dispatcher);
        namedDispatchersRef.current.delete(eventName);
      }

      for (const eventName of currentNames) {
        if (namedDispatchersRef.current.has(eventName)) continue;

        const dispatcher: EventListener = event => {
          if (sourceRef.current !== source) return;
          const listener = listenersRef.current[eventName as TEventName];
          if (listener === undefined) return;
          invokeListener(listener, event as MessageEvent<string>, eventName as TEventName);
        };

        namedDispatchersRef.current.set(eventName, dispatcher);
        source.addEventListener(eventName, dispatcher);
      }
    },
    [invokeListener, listenersRef],
  );

  const createConnection = React.useCallback(
    (configuration: ConnectionConfiguration) => {
      closeCurrentSource();
      if (!configuration.enabled) return;
      if (typeof EventSource === "undefined") {
        throw new Error("useVireoEventSource requires a browser with native EventSource support.");
      }

      const source = new EventSource(configuration.url, { withCredentials: configuration.withCredentials });
      sourceRef.current = source;

      source.onopen = event => {
        if (sourceRef.current !== source) return;
        setStatus("open");
        onOpenRef.current?.(event);
      };

      source.onerror = event => {
        if (sourceRef.current !== source) return;
        if (source.readyState === source.CONNECTING) setStatus("reconnecting");
        else if (source.readyState === source.CLOSED) setStatus("closed");
        onErrorRef.current?.(event);
      };

      source.onmessage = event => {
        if (sourceRef.current !== source) return;
        const listener = onMessageRef.current;
        if (listener !== undefined) invokeListener(listener, event, null);
      };

      synchronizeNamedDispatchers(source);
    },
    [closeCurrentSource, invokeListener, onErrorRef, onMessageRef, onOpenRef, synchronizeNamedDispatchers],
  );

  React.useEffect(() => {
    const configuration = { enabled, url: resolvedUrl, withCredentials } satisfies ConnectionConfiguration;

    if (!enabled) {
      closeCurrentSource();
      setStatus("closed");
      return;
    }

    setStatus("connecting");
    createConnection(configuration);

    return closeCurrentSource;
  }, [closeCurrentSource, createConnection, enabled, resolvedUrl, withCredentials]);

  React.useEffect(() => {
    const source = sourceRef.current;
    if (source !== null) synchronizeNamedDispatchers(source);
  });

  const reconnect = React.useCallback(() => {
    const configuration = configurationRef.current;
    if (!configuration.enabled) return;

    setStatus("connecting");
    createConnection(configuration);
  }, [configurationRef, createConnection]);

  return { reconnect, status };
}
