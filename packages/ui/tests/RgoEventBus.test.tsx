import { RgoEventBus, rgoEventBus } from "@/events/RgoEventBus";
import { useRgoEventListener } from "@/events/useRgoEventListener";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Exercises the augmentation path a consumer app would use, and gives the
// tests below a real event vocabulary to work with.
declare module "@/events/RgoEventBus" {
  interface RgoEventRegistry {
    ping: void;
    moved: { x: number };
  }
}

describe("RgoEventBus", () => {
  afterEach(() => {
    rgoEventBus.clear();
    vi.restoreAllMocks();
  });

  it("delivers a payload to every listener", () => {
    const bus = new RgoEventBus();
    const first = vi.fn();
    const second = vi.fn();

    bus.on("moved", first);
    bus.on("moved", second);
    bus.emit("moved", { x: 1 });

    expect(first).toHaveBeenCalledWith({ x: 1 });
    expect(second).toHaveBeenCalledWith({ x: 1 });
  });

  it("supports events with no payload", () => {
    const bus = new RgoEventBus();
    const listener = vi.fn();

    bus.on("ping", listener);
    bus.emit("ping");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops delivering after the returned unsubscribe runs", () => {
    const bus = new RgoEventBus();
    const listener = vi.fn();

    const unsubscribe = bus.on("ping", listener);
    unsubscribe();
    unsubscribe();
    bus.emit("ping");

    expect(listener).not.toHaveBeenCalled();
    expect(bus.listenerCount("ping")).toBe(0);
  });

  it("registers the same listener only once", () => {
    const bus = new RgoEventBus();
    const listener = vi.fn();

    bus.on("ping", listener);
    bus.on("ping", listener);
    bus.emit("ping");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("delivers a once listener exactly one time", () => {
    const bus = new RgoEventBus();
    const listener = vi.fn();

    bus.once("moved", listener);
    bus.emit("moved", { x: 1 });
    bus.emit("moved", { x: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ x: 1 });
  });

  it("keeps delivering when one listener throws", () => {
    const bus = new RgoEventBus();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const survivor = vi.fn();

    bus.on("ping", () => {
      throw new Error("boom");
    });
    bus.on("ping", survivor);
    bus.emit("ping");

    expect(survivor).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("tolerates a listener unsubscribing during delivery", () => {
    const bus = new RgoEventBus();
    const second = vi.fn();

    const unsubscribeSecond = bus.on("ping", second);
    bus.on("ping", () => unsubscribeSecond());

    expect(() => bus.emit("ping")).not.toThrow();
  });

  it("clears one event or all of them", () => {
    const bus = new RgoEventBus();

    bus.on("ping", vi.fn());
    bus.on("moved", vi.fn());

    bus.clear("ping");
    expect(bus.listenerCount("ping")).toBe(0);
    expect(bus.listenerCount("moved")).toBe(1);

    bus.clear();
    expect(bus.listenerCount("moved")).toBe(0);
  });

  it("ignores an emit with no listeners", () => {
    expect(() => new RgoEventBus().emit("ping")).not.toThrow();
  });
});

describe("useRgoEventListener", () => {
  afterEach(() => rgoEventBus.clear());

  it("subscribes to the shared bus by default", () => {
    const listener = vi.fn();
    renderHook(() => useRgoEventListener("moved", listener));

    act(() => rgoEventBus.emit("moved", { x: 3 }));

    expect(listener).toHaveBeenCalledWith({ x: 3 });
  });

  it("calls the callback from the latest render without resubscribing", () => {
    const bus = new RgoEventBus();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ listener }: { listener: () => void }) => useRgoEventListener("ping", listener, { bus }),
      { initialProps: { listener: first } },
    );

    rerender({ listener: second });
    act(() => bus.emit("ping"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(bus.listenerCount("ping")).toBe(1);
  });

  it("unsubscribes on unmount", () => {
    const bus = new RgoEventBus();
    const { unmount } = renderHook(() => useRgoEventListener("ping", vi.fn(), { bus }));

    unmount();

    expect(bus.listenerCount("ping")).toBe(0);
  });

  it("does not subscribe while disabled", () => {
    const bus = new RgoEventBus();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useRgoEventListener("ping", vi.fn(), { bus, enabled }),
      { initialProps: { enabled: false } },
    );

    expect(bus.listenerCount("ping")).toBe(0);

    rerender({ enabled: true });
    expect(bus.listenerCount("ping")).toBe(1);
  });
});
