import { useServiceWorkerUpdateChecks } from "@/index";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
const originalVisibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, "visibilityState");

function restoreProperty(target: object, property: string, descriptor: PropertyDescriptor | undefined) {
  if (descriptor) {
    Object.defineProperty(target, property, descriptor);
  } else {
    Reflect.deleteProperty(target, property);
  }
}

function UpdateCheckHarness({ intervalMs = 1_000, checkWhenVisible = true }) {
  useServiceWorkerUpdateChecks({ intervalMs, checkWhenVisible });
  return null;
}

afterEach(() => {
  restoreProperty(navigator, "serviceWorker", originalServiceWorkerDescriptor);
  restoreProperty(document, "visibilityState", originalVisibilityStateDescriptor);
  vi.useRealTimers();
});

describe("useServiceWorkerUpdateChecks", () => {
  it("checks on the configured interval and visibility, then cleans up", async () => {
    vi.useFakeTimers();
    const update = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { ready: Promise.resolve({ update }) },
    });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = render(<UpdateCheckHarness />);

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(update).toHaveBeenCalledTimes(2);
    unmount();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("can disable visibility checks and swallows transient failures", async () => {
    vi.useFakeTimers();
    const update = vi.fn().mockRejectedValue(new Error("temporary failure"));
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { ready: Promise.resolve({ update }) },
    });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    render(<UpdateCheckHarness checkWhenVisible={false} />);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(update).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(update).toHaveBeenCalledOnce();
  });

  it("does nothing when service workers are unavailable", () => {
    Reflect.deleteProperty(navigator, "serviceWorker");
    expect(() => render(<UpdateCheckHarness />)).not.toThrow();
  });
});
