"use client";

import React from "react";

export type VireoEventSourceStoryServerController = Readonly<{
  connectionCount: number;
  emitMessage: (data: string) => void;
  emitNamedMessage: (eventName: string, data: string) => void;
  interrupt: () => void;
  resume: () => void;
  terminate: () => void;
}>;

export type VireoEventSourceStoryServerProps = {
  children: (controller: VireoEventSourceStoryServerController) => React.ReactNode;
};

type StoryEventSourceInstance = {
  readonly CONNECTING: number;
  readonly OPEN: number;
  readonly CLOSED: number;
  readyState: number;
  close: () => void;
  open: () => void;
  interrupt: () => void;
  terminate: () => void;
  emitMessage: (data: string) => void;
  emitNamedMessage: (eventName: string, data: string) => void;
};

/**
 * Installs a deterministic in-memory EventSource while its executable
 * Storybook example is mounted. This is developer tooling, not production UI.
 */
export function VireoEventSourceStoryServer({ children }: VireoEventSourceStoryServerProps) {
  const [ready, setReady] = React.useState(false);
  const [connectionCount, setConnectionCount] = React.useState(0);
  const activeSourceRef = React.useRef<StoryEventSourceInstance | null>(null);

  React.useLayoutEffect(() => {
    const originalEventSource = globalThis.EventSource;
    const hadOriginalEventSource = "EventSource" in globalThis;

    class StoryEventSource {
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSED = 2;

      readonly CONNECTING = StoryEventSource.CONNECTING;
      readonly OPEN = StoryEventSource.OPEN;
      readonly CLOSED = StoryEventSource.CLOSED;
      readonly url: string;
      readonly withCredentials: boolean;
      readyState = StoryEventSource.CONNECTING;
      onopen: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onmessage: ((event: MessageEvent<string>) => void) | null = null;
      private readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

      constructor(url: string | URL, init?: EventSourceInit) {
        this.url = url.toString();
        this.withCredentials = init?.withCredentials ?? false;
        activeSourceRef.current = this;
        setConnectionCount(count => count + 1);
        queueMicrotask(() => this.open());
      }

      addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
        if (listener === null) return;
        const listeners = this.listeners.get(type) ?? new Set();
        listeners.add(listener);
        this.listeners.set(type, listeners);
      }

      removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
        if (listener === null) return;
        this.listeners.get(type)?.delete(listener);
      }

      dispatchEvent(event: Event) {
        for (const listener of this.listeners.get(event.type) ?? []) {
          if (typeof listener === "function") listener.call(this, event);
          else listener.handleEvent(event);
        }
        return !event.defaultPrevented;
      }

      close() {
        this.readyState = StoryEventSource.CLOSED;
      }

      open() {
        if (this.readyState !== StoryEventSource.CONNECTING || activeSourceRef.current !== this) return;
        this.readyState = StoryEventSource.OPEN;
        this.onopen?.(new Event("open"));
      }

      interrupt() {
        if (this.readyState !== StoryEventSource.OPEN || activeSourceRef.current !== this) return;
        this.readyState = StoryEventSource.CONNECTING;
        this.onerror?.(new Event("error"));
      }

      terminate() {
        if (this.readyState === StoryEventSource.CLOSED || activeSourceRef.current !== this) return;
        this.readyState = StoryEventSource.CLOSED;
        this.onerror?.(new Event("error"));
      }

      emitMessage(data: string) {
        if (this.readyState !== StoryEventSource.OPEN || activeSourceRef.current !== this) return;
        this.onmessage?.(new MessageEvent<string>("message", { data }));
      }

      emitNamedMessage(eventName: string, data: string) {
        if (this.readyState !== StoryEventSource.OPEN || activeSourceRef.current !== this) return;
        this.dispatchEvent(new MessageEvent<string>(eventName, { data }));
      }
    }

    globalThis.EventSource = StoryEventSource as unknown as typeof EventSource;
    setReady(true);

    return () => {
      activeSourceRef.current?.close();
      activeSourceRef.current = null;
      if (hadOriginalEventSource) globalThis.EventSource = originalEventSource;
      else Reflect.deleteProperty(globalThis, "EventSource");
    };
  }, []);

  const controller = React.useMemo<VireoEventSourceStoryServerController>(
    () => ({
      connectionCount,
      emitMessage: data => activeSourceRef.current?.emitMessage(data),
      emitNamedMessage: (eventName, data) => activeSourceRef.current?.emitNamedMessage(eventName, data),
      interrupt: () => activeSourceRef.current?.interrupt(),
      resume: () => activeSourceRef.current?.open(),
      terminate: () => activeSourceRef.current?.terminate(),
    }),
    [connectionCount],
  );

  return ready ? children(controller) : null;
}
