import React from "react";

export type SseEventHandler = (data: unknown) => Promise<void> | void;

function addSseEventListener(eventSource: EventSource, eventName: string, handler: SseEventHandler): void {
  eventSource.addEventListener(eventName, e => {
    const parsedData = JSON.parse(e.data);
    handler(parsedData);
  });
}

export type UseSseProps = {
  url: string;
  eventHandlers: Record<string, SseEventHandler>;
  withCredentials?: boolean;
  disabled?: boolean;
  onOpen?: () => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
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
}: UseSseProps) {
  // Ref to hold the EventSource instance across renders
  const eventSource = React.useRef<EventSource | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eventHandlersMemo = React.useMemo(() => eventHandlers, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onOpenMemo = React.useCallback(onOpen, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMessageMemo = React.useCallback(onMessage, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onErrorMemo = React.useCallback(onError, []);

  React.useEffect(() => {
    if (disabled) {
      // If disabled, close existing connection if any
      if (eventSource.current) {
        eventSource.current.close();
        eventSource.current = null;
      }
      return;
    }

    // Create an EventSource instance and store it in the ref
    eventSource.current = new EventSource(url, { withCredentials });

    // Attach event handlers from the record
    Object.entries(eventHandlersMemo).forEach(([eventName, handler]) => {
      addSseEventListener(eventSource.current!, eventName, handler);
    });

    // Attach main event handlers
    eventSource.current.onerror = onErrorMemo;
    eventSource.current.onopen = onOpenMemo;
    eventSource.current.onmessage = onMessageMemo;

    // Cleanup function to close EventSource when dependencies change or component unmounts
    return () => {
      if (eventSource.current) {
        eventSource.current.close();
        eventSource.current = null;
      }
    };
  }, [disabled, url, withCredentials, eventHandlersMemo, onOpenMemo, onMessageMemo, onErrorMemo]);

  const reconnect = React.useCallback(() => {
    if (eventSource.current) {
      eventSource.current.close();
    }
    eventSource.current = new EventSource(url, { withCredentials });

    // Reattach event handlers to the new EventSource instance
    Object.entries(eventHandlersMemo).forEach(([eventName, handler]) => {
      addSseEventListener(eventSource.current!, eventName, handler);
    });

    // Reattach main event handlers
    eventSource.current.onerror = onErrorMemo;
    eventSource.current.onopen = onOpenMemo;
    eventSource.current.onmessage = onMessageMemo;
  }, [url, withCredentials, eventHandlersMemo, onOpenMemo, onMessageMemo, onErrorMemo]);

  // Optionally return eventSourceRef if you want to expose the instance outside the hook
  return { eventSource, reconnect };
}
