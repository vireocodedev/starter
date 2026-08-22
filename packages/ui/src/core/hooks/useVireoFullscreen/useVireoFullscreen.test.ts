import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVireoFullscreen } from "./useVireoFullscreen";

type FullscreenMock = {
  setFullscreenElement: (element: Element | null) => void;
  requestFullscreen: ReturnType<typeof vi.fn>;
  exitFullscreen: ReturnType<typeof vi.fn>;
  restore: () => void;
};

function installFullscreenMock(target: Element): FullscreenMock {
  const ownerDocument = target.ownerDocument;
  const originalFullscreenEnabled = Object.getOwnPropertyDescriptor(ownerDocument, "fullscreenEnabled");
  const originalFullscreenElement = Object.getOwnPropertyDescriptor(ownerDocument, "fullscreenElement");
  const originalExitFullscreen = Object.getOwnPropertyDescriptor(ownerDocument, "exitFullscreen");
  const originalRequestFullscreen = Object.getOwnPropertyDescriptor(target, "requestFullscreen");
  let fullscreenElement: Element | null = null;
  const setFullscreenElement = (element: Element | null) => {
    fullscreenElement = element;
    ownerDocument.dispatchEvent(new Event("fullscreenchange"));
  };
  const requestFullscreen = vi.fn(async () => setFullscreenElement(target));
  const exitFullscreen = vi.fn(async () => setFullscreenElement(null));

  Object.defineProperty(ownerDocument, "fullscreenEnabled", { configurable: true, value: true });
  Object.defineProperty(ownerDocument, "fullscreenElement", {
    configurable: true,
    get: () => fullscreenElement,
  });
  Object.defineProperty(ownerDocument, "exitFullscreen", { configurable: true, value: exitFullscreen });
  Object.defineProperty(target, "requestFullscreen", { configurable: true, value: requestFullscreen });

  return {
    setFullscreenElement,
    requestFullscreen,
    exitFullscreen,
    restore: () => {
      for (const [owner, key, descriptor] of [
        [ownerDocument, "fullscreenEnabled", originalFullscreenEnabled],
        [ownerDocument, "fullscreenElement", originalFullscreenElement],
        [ownerDocument, "exitFullscreen", originalExitFullscreen],
        [target, "requestFullscreen", originalRequestFullscreen],
      ] as const) {
        if (descriptor === undefined) delete (owner as unknown as Record<string, unknown>)[key];
        else Object.defineProperty(owner, key, descriptor);
      }
    },
  };
}

const restorers: Array<() => void> = [];

describe("useVireoFullscreen", () => {
  afterEach(() => {
    restorers
      .splice(0)
      .reverse()
      .forEach(restore => restore());
  });

  it("reports a missing target as unsupported and rejects commands clearly", async () => {
    const { result } = renderHook(() => useVireoFullscreen(null));

    expect(result.current.isSupported).toBe(false);
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.fullscreenElement).toBeNull();
    await expect(result.current.enterFullscreen()).rejects.toThrow("requires a target element");
  });

  it("enters fullscreen with options and reflects fullscreenchange events", async () => {
    const target = document.createElement("div");
    const fullscreen = installFullscreenMock(target);
    restorers.push(fullscreen.restore);
    const { result } = renderHook(() => useVireoFullscreen(target));
    const options: FullscreenOptions = { navigationUI: "hide" };

    await act(() => result.current.enterFullscreen(options));

    expect(fullscreen.requestFullscreen).toHaveBeenCalledWith(options);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isFullscreen).toBe(true);
    expect(result.current.fullscreenElement).toBe(target);
  });

  it("does not request fullscreen again when the target already owns it", async () => {
    const target = document.createElement("div");
    const fullscreen = installFullscreenMock(target);
    restorers.push(fullscreen.restore);
    fullscreen.setFullscreenElement(target);
    const { result } = renderHook(() => useVireoFullscreen(target));

    await act(() => result.current.enterFullscreen());

    expect(fullscreen.requestFullscreen).not.toHaveBeenCalled();
  });

  it("exits only when the target owns fullscreen", async () => {
    const target = document.createElement("div");
    const other = document.createElement("section");
    const fullscreen = installFullscreenMock(target);
    restorers.push(fullscreen.restore);
    const { result } = renderHook(() => useVireoFullscreen(target));

    act(() => fullscreen.setFullscreenElement(other));
    await act(() => result.current.exitFullscreen());
    expect(fullscreen.exitFullscreen).not.toHaveBeenCalled();
    expect(result.current.fullscreenElement).toBe(other);

    act(() => fullscreen.setFullscreenElement(target));
    await act(() => result.current.exitFullscreen());
    expect(fullscreen.exitFullscreen).toHaveBeenCalledOnce();
    expect(result.current.isFullscreen).toBe(false);
  });

  it("toggles the target and keeps command identities stable across target changes", async () => {
    const firstTarget = document.createElement("div");
    const secondTarget = document.createElement("section");
    const firstFullscreen = installFullscreenMock(firstTarget);
    const secondFullscreen = installFullscreenMock(secondTarget);
    restorers.push(firstFullscreen.restore, secondFullscreen.restore);
    const { result, rerender } = renderHook(({ target }) => useVireoFullscreen(target), {
      initialProps: { target: firstTarget as Element | null },
    });
    const commands = {
      enter: result.current.enterFullscreen,
      exit: result.current.exitFullscreen,
      toggle: result.current.toggleFullscreen,
    };

    rerender({ target: secondTarget });
    expect(result.current.enterFullscreen).toBe(commands.enter);
    expect(result.current.exitFullscreen).toBe(commands.exit);
    expect(result.current.toggleFullscreen).toBe(commands.toggle);

    await act(() => result.current.toggleFullscreen());
    expect(secondFullscreen.requestFullscreen).toHaveBeenCalledOnce();
    await act(() => result.current.toggleFullscreen());
    expect(secondFullscreen.exitFullscreen).toHaveBeenCalledOnce();
  });

  it("rejects unsupported targets and propagates native request errors", async () => {
    const unsupportedTarget = document.createElement("div");
    const unsupported = renderHook(() => useVireoFullscreen(unsupportedTarget));
    await expect(unsupported.result.current.enterFullscreen()).rejects.toThrow("Fullscreen API is not supported");
    unsupported.unmount();

    const target = document.createElement("div");
    const fullscreen = installFullscreenMock(target);
    restorers.push(fullscreen.restore);
    const failure = new DOMException("Permission denied", "NotAllowedError");
    fullscreen.requestFullscreen.mockRejectedValueOnce(failure);
    const { result } = renderHook(() => useVireoFullscreen(target));

    await expect(result.current.enterFullscreen()).rejects.toBe(failure);
  });
});
