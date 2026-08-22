import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVireoOnlineStatus } from "./useVireoOnlineStatus";

const originalOnlineDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "onLine");

function setOnline(value: boolean) {
  Object.defineProperty(Navigator.prototype, "onLine", { configurable: true, get: () => value });
}

describe("useVireoOnlineStatus", () => {
  afterEach(() => {
    if (originalOnlineDescriptor) {
      Object.defineProperty(Navigator.prototype, "onLine", originalOnlineDescriptor);
    }
    vi.restoreAllMocks();
  });

  it("tracks browser online and offline events", () => {
    setOnline(true);
    const { result } = renderHook(() => useVireoOnlineStatus());
    expect(result.current).toBe(true);

    setOnline(false);
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);

    setOnline(true);
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current).toBe(true);
  });

  it("unsubscribes when its React owner unmounts", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useVireoOnlineStatus());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("offline", expect.any(Function));
  });
});
