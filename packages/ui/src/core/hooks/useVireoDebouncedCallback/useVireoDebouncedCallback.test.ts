import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVireoDebouncedCallback } from "./useVireoDebouncedCallback";

describe("useVireoDebouncedCallback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once with the latest arguments after the delay", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useVireoDebouncedCallback(callback, { delayMs: 300 }));

    act(() => {
      result.current.run("first");
      vi.advanceTimersByTime(200);
      result.current.run("second");
      vi.advanceTimersByTime(299);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("second");
    expect(result.current.isPending()).toBe(false);
  });

  it("uses the latest callback without rescheduling pending work", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ callback }) => useVireoDebouncedCallback(callback, { delayMs: 100 }), {
      initialProps: { callback: first },
    });

    act(() => result.current.run("value"));
    rerender({ callback: second });
    act(() => vi.advanceTimersByTime(100));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("value");
  });

  it("cancels pending work", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useVireoDebouncedCallback(callback, { delayMs: 100 }));

    act(() => {
      result.current.run();
      result.current.cancel();
      vi.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isPending()).toBe(false);
  });

  it("flushes pending work and returns its result", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useVireoDebouncedCallback((value: number) => value * 2, { delayMs: 100 }));

    act(() => result.current.run(21));
    let flushed: number | undefined;
    act(() => {
      flushed = result.current.flush();
    });

    expect(flushed).toBe(42);
    expect(result.current.flush()).toBeUndefined();
    expect(result.current.isPending()).toBe(false);
  });

  it("cancels pending work when the delay changes or the owner unmounts", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ delayMs }) => useVireoDebouncedCallback(callback, { delayMs }),
      { initialProps: { delayMs: 100 } },
    );

    act(() => result.current.run());
    rerender({ delayMs: 200 });
    expect(result.current.isPending()).toBe(false);

    act(() => result.current.run());
    unmount();
    act(() => vi.runAllTimers());
    expect(callback).not.toHaveBeenCalled();
  });

  it("rejects invalid delays", () => {
    expect(() => renderHook(() => useVireoDebouncedCallback(() => undefined, { delayMs: -1 }))).toThrow(
      "delayMs must be a finite non-negative number",
    );
  });
});
