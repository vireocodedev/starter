import React from "react";

export type SseEventHandler = (data: unknown) => Promise<void> | void;

export type RgoSseStatus = "connecting" | "open" | "reconnecting" | "closed";

const DEFAULT_RECONNECT_BASE_DELAY_MS = 1_000;
const DEFAULT_RECONNECT_MAX_DELAY_MS = 30_000;

/**
 * Keeps a ref pointing at the value from the most recent render.
 *
 * Server-sent events always arrive asynchronously, never during render, so
 * committing the value in an effect is safe and keeps render pure.
 */
function useLatestRef<T>(value: T) {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref;
}

export type UseSseProps = {
  url: string;
  /**
   * Handlers keyed by event name.
   *
   * Handler implementations are read at dispatch time, so this object does not
   * need to be memoised and replacing it never tears down the connection. The
   * set of event *names* is read when the connection opens — adding a new key
   * later requires a `reconnect()`.
   */
  eventHandlers: Record<string, SseEventHandler>;
  withCredentials?: boolean;
  disabled?: boolean;
  onOpen?: () => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  /** Delay before the first reconnect attempt. Doubles on each attempt. */
  reconnectBaseDelayMs?: number;
  /** Upper bound for the backoff delay. */
  reconnectMaxDelayMs?: number;
  /** Give up after this many consecutive failed attempts. */
  maxRetries?: number;
  onReconnectAttempt?: (attempt: number, delayMs: number) => void;
  /** Called once `maxRetries` is exhausted. The stream stays closed until `reconnect()`. */
  onReconnectFailed?: () => void;
};

export function useRgoSseEmitter({
  url,
  eventHandlers,
  withCredentials = true,
  disabled = false,
  onOpen = () => {},
  onMessage = () => {},
  onError = error => {
    console.debug(error);
  },
  reconnectBaseDelayMs = DEFAULT_RECONNECT_BASE_DELAY_MS,
  reconnectMaxDelayMs = DEFAULT_RECONNECT_MAX_DELAY_MS,
  maxRetries = Number.POSITIVE_INFINITY,
  onReconnectAttempt = () => {},
  onReconnectFailed = () => {},
}: UseSseProps) {
  const eventSource = React.useRef<EventSource | null>(null);
  const reconnectTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = React.useRef(0);
  const [status, setStatus] = React.useState<RgoSseStatus>(disabled ? "closed" : "connecting");

  const eventHandlersRef = useLatestRef(eventHandlers);
  const onOpenRef = useLatestRef(onOpen);
  const onMessageRef = useLatestRef(onMessage);
  const onErrorRef = useLatestRef(onError);
  const onReconnectAttemptRef = useLatestRef(onReconnectAttempt);
  const onReconnectFailedRef = useLatestRef(onReconnectFailed);

  // Indirection so that `connect` and `scheduleReconnect` can call each other
  // without either depending on the other's identity.
  const connectRef = React.useRef<() => void>(() => {});

  const cancelScheduledReconnect = React.useCallback(() => {
    if (reconnectTimeout.current === null) return;
    clearTimeout(reconnectTimeout.current);
    reconnectTimeout.current = null;
  }, []);

  const closeEventSource = React.useCallback(() => {
    if (!eventSource.current) return;
    eventSource.current.close();
    eventSource.current = null;
  }, []);

  const scheduleReconnect = React.useCallback(() => {
    if (reconnectTimeout.current !== null) return;

    if (attempts.current >= maxRetries) {
      setStatus("closed");
      onReconnectFailedRef.current();
      return;
    }

    const attempt = attempts.current + 1;
    attempts.current = attempt;

    const delayMs = Math.min(reconnectBaseDelayMs * 2 ** (attempt - 1), reconnectMaxDelayMs);

    setStatus("reconnecting");
    onReconnectAttemptRef.current(attempt, delayMs);

    reconnectTimeout.current = setTimeout(() => {
      reconnectTimeout.current = null;
      connectRef.current();
    }, delayMs);
  }, [maxRetries, reconnectBaseDelayMs, reconnectMaxDelayMs, onReconnectAttemptRef, onReconnectFailedRef]);

  const connect = React.useCallback(() => {
    closeEventSource();

    const source = new EventSource(url, { withCredentials });
    eventSource.current = source;

    Object.keys(eventHandlersRef.current).forEach(eventName => {
      source.addEventListener(eventName, event => {
        const handler = eventHandlersRef.current[eventName];
        if (!handler) return;

        const messageEvent = event as MessageEvent;

        let parsedData: unknown;
        try {
          parsedData = JSON.parse(messageEvent.data);
        } catch {
          // A throw inside a listener is swallowed by the browser, so route
          // malformed payloads to onError rather than losing them silently.
          onErrorRef.current(messageEvent);
          return;
        }

        void handler(parsedData);
      });
    });

    source.onopen = () => {
      attempts.current = 0;
      setStatus("open");
      onOpenRef.current();
    };

    source.onmessage = event => onMessageRef.current(event);

    source.onerror = event => {
      onErrorRef.current(event);

      // EventSource retries by itself while the connection is merely dropped.
      // Once it reports CLOSED the browser has given up permanently, and only
      // an explicit new connection can recover.
      if (source.readyState !== EventSource.CLOSED) return;

      closeEventSource();
      scheduleReconnect();
    };
  }, [
    url,
    withCredentials,
    closeEventSource,
    scheduleReconnect,
    eventHandlersRef,
    onOpenRef,
    onMessageRef,
    onErrorRef,
  ]);

  React.useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  React.useEffect(() => {
    if (disabled) {
      cancelScheduledReconnect();
      closeEventSource();
      setStatus("closed");
      return;
    }

    attempts.current = 0;
    setStatus("connecting");
    connect();

    return () => {
      cancelScheduledReconnect();
      closeEventSource();
    };
  }, [disabled, connect, cancelScheduledReconnect, closeEventSource]);

  const reconnect = React.useCallback(() => {
    cancelScheduledReconnect();
    attempts.current = 0;
    setStatus("connecting");
    connect();
  }, [cancelScheduledReconnect, connect]);

  return { eventSource, reconnect, status };
}
