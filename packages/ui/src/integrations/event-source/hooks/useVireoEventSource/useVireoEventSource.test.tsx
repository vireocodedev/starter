import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  type VireoEventSourceListenerError,
  useVireoEventSource,
  type VireoEventSourceStatus,
} from "./useVireoEventSource";

class FakeEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
  static instances: FakeEventSource[] = [];

  readonly CONNECTING = FakeEventSource.CONNECTING;
  readonly OPEN = FakeEventSource.OPEN;
  readonly CLOSED = FakeEventSource.CLOSED;
  readonly url: string;
  readonly withCredentials: boolean;
  readyState = FakeEventSource.CONNECTING;
  closeCalls = 0;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  private readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  constructor(url: string | URL, init?: EventSourceInit) {
    this.url = url.toString();
    this.withCredentials = init?.withCredentials ?? false;
    FakeEventSource.instances.push(this);
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
    this.closeCalls += 1;
    this.readyState = FakeEventSource.CLOSED;
  }

  open() {
    this.readyState = FakeEventSource.OPEN;
    this.onopen?.(new Event("open"));
  }

  failPermanently() {
    this.readyState = FakeEventSource.CLOSED;
    this.onerror?.(new Event("error"));
  }

  interrupt() {
    this.readyState = FakeEventSource.CONNECTING;
    this.onerror?.(new Event("error"));
  }

  message(data: string) {
    this.onmessage?.(new MessageEvent<string>("message", { data }));
  }

  namedMessage(type: string, data: string) {
    this.dispatchEvent(new MessageEvent<string>(type, { data }));
  }

  listenerCount(type: string) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

const latestSource = () => FakeEventSource.instances.at(-1)!;

describe("useVireoEventSource", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("stays closed and performs no validation or construction while disabled", () => {
    const { result } = renderHook(() => useVireoEventSource({ url: " ", enabled: false }));

    expect(result.current.status).toBe("closed");
    expect(FakeEventSource.instances).toHaveLength(0);
    act(() => result.current.reconnect());
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("uses native credential defaults", () => {
    renderHook(() => useVireoEventSource({ url: "/events" }));

    expect(latestSource().url).toBe("/events");
    expect(latestSource().withCredentials).toBe(false);
  });

  it("accepts URL objects and explicit credentials", () => {
    renderHook(() => useVireoEventSource({ url: new URL("https://example.test/events"), withCredentials: true }));

    expect(latestSource().url).toBe("https://example.test/events");
    expect(latestSource().withCredentials).toBe(true);
  });

  it("replaces and closes the source when construction options change", () => {
    const view = renderHook(({ url, withCredentials }) => useVireoEventSource({ url, withCredentials }), {
      initialProps: { url: "/first", withCredentials: false },
    });
    const first = latestSource();

    view.rerender({ url: "/second", withCredentials: true });

    expect(first.closeCalls).toBe(1);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(latestSource().url).toBe("/second");
    expect(latestSource().withCredentials).toBe(true);
  });

  it("tracks native open, reconnecting, and closed states", () => {
    const onOpen = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useVireoEventSource({ url: "/events", onOpen, onError }));

    expect(result.current.status).toBe("connecting");
    act(() => latestSource().open());
    expect(result.current.status).toBe("open");
    expect(onOpen).toHaveBeenCalledOnce();

    act(() => latestSource().interrupt());
    expect(result.current.status).toBe("reconnecting");
    expect(onError).toHaveBeenCalledOnce();

    act(() => latestSource().failPermanently());
    expect(result.current.status).toBe("closed");
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it("does not schedule a Vireo retry timer", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    renderHook(() => useVireoEventSource({ url: "/events" }));

    act(() => latestSource().interrupt());

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("explicitly reconnects with a stable command", () => {
    const { result, rerender } = renderHook(() => useVireoEventSource({ url: "/events" }));
    const reconnect = result.current.reconnect;
    const first = latestSource();

    rerender();
    expect(result.current.reconnect).toBe(reconnect);

    act(() => reconnect());
    expect(first.closeCalls).toBe(1);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(result.current.status).toBe("connecting");
  });

  it("uses the latest lifecycle callbacks without reconnecting", () => {
    const firstOnOpen = vi.fn();
    const secondOnOpen = vi.fn();
    const view = renderHook(({ onOpen }) => useVireoEventSource({ url: "/events", onOpen }), {
      initialProps: { onOpen: firstOnOpen },
    });
    const source = latestSource();

    view.rerender({ onOpen: secondOnOpen });
    act(() => source.open());

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(firstOnOpen).not.toHaveBeenCalled();
    expect(secondOnOpen).toHaveBeenCalledOnce();
  });

  it("adds, updates, and removes named listeners without reconnecting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = renderHook(({ listeners }) => useVireoEventSource({ url: "/events", listeners }), {
      initialProps: { listeners: { update: first } as Record<string, (event: MessageEvent<string>) => void> },
    });
    const source = latestSource();

    expect(source.listenerCount("update")).toBe(1);
    act(() => source.namedMessage("update", "first"));
    expect(first).toHaveBeenCalledOnce();

    view.rerender({ listeners: { update: second, heartbeat: second } });
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(source.listenerCount("update")).toBe(1);
    expect(source.listenerCount("heartbeat")).toBe(1);
    act(() => source.namedMessage("update", "second"));
    expect(second).toHaveBeenCalledOnce();

    view.rerender({ listeners: { heartbeat: second } });
    expect(source.listenerCount("update")).toBe(0);
    act(() => source.namedMessage("update", "ignored"));
    expect(second).toHaveBeenCalledOnce();
  });

  it("dispatches unnamed messages through onMessage", () => {
    const onMessage = vi.fn();
    renderHook(() => useVireoEventSource({ url: "/events", onMessage }));

    act(() => latestSource().message("plain text"));

    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ data: "plain text" }));
  });

  it('rejects the reserved "message" named listener', () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      renderHook(() => useVireoEventSource({ url: "/events", listeners: { message: () => undefined } })),
    ).toThrow('reserves the "message" event name');
  });

  it("isolates synchronous named-listener failures", () => {
    const failure = new Error("invalid payload");
    const onListenerError = vi.fn();
    renderHook(() =>
      useVireoEventSource({
        url: "/events",
        listeners: {
          update: () => {
            throw failure;
          },
        },
        onListenerError,
      }),
    );

    act(() => latestSource().namedMessage("update", "invalid"));

    expect(onListenerError).toHaveBeenCalledWith({
      error: failure,
      eventName: "update",
      event: expect.objectContaining({ data: "invalid" }),
    });
  });

  it("isolates asynchronous default-listener failures", async () => {
    const failure = new Error("persistence failed");
    const onListenerError = vi.fn();
    renderHook(() =>
      useVireoEventSource({
        url: "/events",
        onMessage: async () => Promise.reject(failure),
        onListenerError,
      }),
    );

    act(() => latestSource().message("payload"));

    await waitFor(() =>
      expect(onListenerError).toHaveBeenCalledWith({
        error: failure,
        eventName: null,
        event: expect.objectContaining({ data: "payload" }),
      }),
    );
  });

  it("surfaces synchronous listener failures when no error callback is provided", () => {
    const failure = new Error("unhandled listener");
    renderHook(() =>
      useVireoEventSource({
        url: "/events",
        listeners: {
          update: () => {
            throw failure;
          },
        },
      }),
    );

    expect(() => latestSource().namedMessage("update", "payload")).toThrow(failure);
  });

  it("ignores stale source lifecycle events after replacement", () => {
    const onOpen = vi.fn();
    const view = renderHook(({ url }) => useVireoEventSource({ url, onOpen }), {
      initialProps: { url: "/first" },
    });
    const first = latestSource();
    const staleOnOpen = first.onopen!;

    view.rerender({ url: "/second" });
    act(() => staleOnOpen(new Event("open")));

    expect(onOpen).not.toHaveBeenCalled();
    expect(view.result.current.status).toBe("connecting");
  });

  it("closes the source on disable and unmount without transport errors", () => {
    const onError = vi.fn();
    const view = renderHook(({ enabled }) => useVireoEventSource({ url: "/events", enabled, onError }), {
      initialProps: { enabled: true },
    });
    const first = latestSource();

    view.rerender({ enabled: false });
    expect(first.closeCalls).toBe(1);
    expect(view.result.current.status).toBe("closed");
    expect(onError).not.toHaveBeenCalled();

    view.rerender({ enabled: true });
    const second = latestSource();
    view.unmount();
    expect(second.closeCalls).toBe(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("rejects blank enabled URLs", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useVireoEventSource({ url: "  " }))).toThrow("url must not be blank");
  });

  it("fails clearly when EventSource is unavailable", () => {
    vi.unstubAllGlobals();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => useVireoEventSource({ url: "/events" }))).toThrow(
      "requires a browser with native EventSource support",
    );
  });

  it("does not access EventSource while server rendering", () => {
    vi.unstubAllGlobals();

    function ServerExample() {
      const stream = useVireoEventSource({ url: "/events" });
      return <span>{stream.status}</span>;
    }

    expect(renderToString(<ServerExample />)).toBe("<span>connecting</span>");
  });

  it("cleans up the development Strict Mode setup cycle", () => {
    const view = renderHook(() => useVireoEventSource({ url: "/events" }), {
      wrapper: React.StrictMode,
    });

    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[0].closeCalls).toBe(1);
    view.unmount();
    expect(FakeEventSource.instances[1].closeCalls).toBe(1);
  });

  it("infers event-name unions in listener failures", () => {
    renderHook(() =>
      useVireoEventSource({
        url: "/events",
        enabled: false,
        listeners: { create: () => undefined, update: () => undefined },
        onListenerError: failure => {
          expectTypeOf(failure.eventName).toEqualTypeOf<"create" | "update" | null>();
        },
      }),
    );

    expectTypeOf<VireoEventSourceStatus>().toEqualTypeOf<"connecting" | "open" | "reconnecting" | "closed">();
    expectTypeOf<VireoEventSourceListenerError<"create">["eventName"]>().toEqualTypeOf<"create" | null>();
  });
});
