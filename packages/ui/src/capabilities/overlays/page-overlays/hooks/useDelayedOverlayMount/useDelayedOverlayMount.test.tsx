import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDelayedOverlayMount } from "./useDelayedOverlayMount";

describe("useDelayedOverlayMount", () => {
  it("opens synchronously and waits for the exit transition before unmounting", () => {
    const { result } = renderHook(() => useDelayedOverlayMount());

    expect(result.current.mounted).toBe(false);
    expect(result.current.render(() => "overlay")).toBeNull();

    act(() => result.current.openOverlay());

    expect(result.current.mounted).toBe(true);
    expect(result.current.open).toBe(true);
    expect(result.current.render(({ open }) => (open ? "open" : "closed"))).toBe("open");

    act(() => result.current.closeOverlay());

    expect(result.current.mounted).toBe(true);
    expect(result.current.open).toBe(false);
    expect(result.current.render(({ open }) => (open ? "open" : "closed"))).toBe("closed");

    act(() => result.current.onExited());

    expect(result.current.mounted).toBe(false);
  });
});
