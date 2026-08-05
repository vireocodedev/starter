import { useRgoSseEmitter, type SseEventHandler } from "@/hooks/useRgoSseEmitter/useRgoSseEmitter";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * jsdom ships no EventSource, so the tests drive a stub that records the
 * instances it creates and lets each test push events and failures by hand.
 */
class FakeEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  static instances: FakeEventSource[] = [];

  readyState = FakeEventSource.CONNECTING;
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private readonly listeners = new Map<string, ((event: Event) => void)[]>();

  constructor(
    readonly url: string,
    readonly init?: { withCredentials?: boolean },
  ) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(name: string, listener: (event: Event) => void) {
    const existing = this.listeners.get(name) ?? [];
    this.listeners.set(name, [...existing, listener]);
  }

  close() {
    this.closed = true;
    this.readyState = FakeEventSource.CLOSED;
  }

  open() {
    this.readyState = FakeEventSource.OPEN;
    this.onopen?.();
  }

  emit(name: string, data: string) {
    const event = new MessageEvent(name, { data });
    this.listeners.get(name)?.forEach(listener => listener(event));
  }

  fail({ permanent }: { permanent: boolean }) {
    this.readyState = permanent ? FakeEventSource.CLOSED : FakeEventSource.CONNECTING;
    this.onerror?.(new Event("error"));
  }
}

const latest = () => FakeEventSource.instances[FakeEventSource.instances.length - 1]!;

describe("useRgoSseEmitter", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    vi.useFakeTimers();
    // The hook's default onError logs; the tests assert on behaviour, not output.
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("dispatches to the handler from the latest render, not the one captured at mount", () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: SseEventHandler }) =>
        useRgoSseEmitter({ url: "/sse", eventHandlers: { update: handler } }),
      { initialProps: { handler: first as SseEventHandler } },
    );

    rerender({ handler: second as SseEventHandler });
    act(() => latest().emit("update", JSON.stringify({ id: 1 })));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ id: 1 });
  });

  it("keeps the same connection when the handler object identity changes", () => {
    const { rerender } = renderHook(
      ({ handler }: { handler: SseEventHandler }) =>
        useRgoSseEmitter({ url: "/sse", eventHandlers: { update: handler } }),
      { initialProps: { handler: vi.fn() as SseEventHandler } },
    );

    rerender({ handler: vi.fn() as SseEventHandler });

    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("routes malformed payloads to onError instead of throwing", () => {
    const handler = vi.fn();
    const onError = vi.fn();

    renderHook(() => useRgoSseEmitter({ url: "/sse", eventHandlers: { update: handler }, onError }));

    act(() => latest().emit("update", "definitely not json"));

    expect(handler).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("leaves a recoverable drop to the browser's own retry", () => {
    renderHook(() => useRgoSseEmitter({ url: "/sse", eventHandlers: {} }));

    act(() => latest().fail({ permanent: false }));
    act(() => vi.advanceTimersByTime(60_000));

    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("reconnects with exponential backoff once the browser gives up", () => {
    const { result } = renderHook(() =>
      useRgoSseEmitter({ url: "/sse", eventHandlers: {}, reconnectBaseDelayMs: 100 }),
    );

    act(() => latest().fail({ permanent: true }));
    expect(result.current.status).toBe("reconnecting");
    expect(FakeEventSource.instances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(100));
    expect(FakeEventSource.instances).toHaveLength(2);

    // Second failure waits twice as long.
    act(() => latest().fail({ permanent: true }));
    act(() => vi.advanceTimersByTime(100));
    expect(FakeEventSource.instances).toHaveLength(2);

    act(() => vi.advanceTimersByTime(100));
    expect(FakeEventSource.instances).toHaveLength(3);
  });

  it("caps the backoff delay", () => {
    renderHook(() =>
      useRgoSseEmitter({
        url: "/sse",
        eventHandlers: {},
        reconnectBaseDelayMs: 1_000,
        reconnectMaxDelayMs: 2_000,
      }),
    );

    for (let attempt = 0; attempt < 5; attempt++) {
      act(() => latest().fail({ permanent: true }));
      act(() => vi.advanceTimersByTime(2_000));
    }

    expect(FakeEventSource.instances).toHaveLength(6);
  });

  it("resets the backoff after a successful open", () => {
    const onReconnectAttempt = vi.fn();

    renderHook(() =>
      useRgoSseEmitter({ url: "/sse", eventHandlers: {}, reconnectBaseDelayMs: 100, onReconnectAttempt }),
    );

    act(() => latest().fail({ permanent: true }));
    act(() => vi.advanceTimersByTime(100));
    act(() => latest().open());
    act(() => latest().fail({ permanent: true }));

    expect(onReconnectAttempt).toHaveBeenNthCalledWith(1, 1, 100);
    expect(onReconnectAttempt).toHaveBeenNthCalledWith(2, 1, 100);
  });

  it("gives up after maxRetries and reports it", () => {
    const onReconnectFailed = vi.fn();

    const { result } = renderHook(() =>
      useRgoSseEmitter({
        url: "/sse",
        eventHandlers: {},
        reconnectBaseDelayMs: 100,
        maxRetries: 1,
        onReconnectFailed,
      }),
    );

    act(() => latest().fail({ permanent: true }));
    act(() => vi.advanceTimersByTime(100));
    act(() => latest().fail({ permanent: true }));
    act(() => vi.advanceTimersByTime(10_000));

    expect(onReconnectFailed).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("closed");
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it("recovers from an exhausted retry budget through the manual reconnect", () => {
    const { result } = renderHook(() =>
      useRgoSseEmitter({ url: "/sse", eventHandlers: {}, reconnectBaseDelayMs: 100, maxRetries: 0 }),
    );

    act(() => latest().fail({ permanent: true }));
    expect(result.current.status).toBe("closed");

    act(() => result.current.reconnect());

    expect(result.current.status).toBe("connecting");
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it("opens no connection while disabled and closes an existing one", () => {
    const { rerender } = renderHook(
      ({ disabled }: { disabled: boolean }) => useRgoSseEmitter({ url: "/sse", eventHandlers: {}, disabled }),
      { initialProps: { disabled: true } },
    );

    expect(FakeEventSource.instances).toHaveLength(0);

    rerender({ disabled: false });
    expect(FakeEventSource.instances).toHaveLength(1);

    rerender({ disabled: true });
    expect(latest().closed).toBe(true);
  });

  it("cancels a pending reconnect on unmount", () => {
    const { unmount } = renderHook(() =>
      useRgoSseEmitter({ url: "/sse", eventHandlers: {}, reconnectBaseDelayMs: 100 }),
    );

    act(() => latest().fail({ permanent: true }));
    unmount();
    act(() => vi.advanceTimersByTime(10_000));

    expect(FakeEventSource.instances).toHaveLength(1);
  });
});
