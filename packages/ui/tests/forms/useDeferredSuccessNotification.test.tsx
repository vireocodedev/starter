import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDeferredSuccessNotification } from "@/forms/useDeferredSuccessNotification";

describe("useDeferredSuccessNotification", () => {
  it("shows notifications immediately when deferral is disabled", () => {
    const showNotification = vi.fn();
    const { result } = renderHook(() => useDeferredSuccessNotification(false));

    act(() => result.current.scheduleSuccessNotification(showNotification));

    expect(showNotification).toHaveBeenCalledOnce();
  });

  it("holds the latest notification until it is explicitly shown", () => {
    const firstNotification = vi.fn();
    const latestNotification = vi.fn();
    const { result } = renderHook(() => useDeferredSuccessNotification(true));

    act(() => {
      result.current.scheduleSuccessNotification(firstNotification);
      result.current.scheduleSuccessNotification(latestNotification);
      result.current.showSuccessNotification();
      result.current.showSuccessNotification();
    });

    expect(firstNotification).not.toHaveBeenCalled();
    expect(latestNotification).toHaveBeenCalledOnce();
  });

  it("can discard a deferred notification after a failed workflow", () => {
    const showNotification = vi.fn();
    const { result } = renderHook(() => useDeferredSuccessNotification(true));

    act(() => {
      result.current.scheduleSuccessNotification(showNotification);
      result.current.clearSuccessNotification();
      result.current.showSuccessNotification();
    });

    expect(showNotification).not.toHaveBeenCalled();
  });
});
