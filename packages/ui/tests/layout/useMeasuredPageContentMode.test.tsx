import { resolveMeasuredPageContentMode, useMeasuredPageContentMode } from "@/layout/useMeasuredPageContentMode";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

function setWindowInnerWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
}

describe("resolveMeasuredPageContentMode", () => {
  it("lets the embedding shell force compact layout independently of measured width", () => {
    expect(resolveMeasuredPageContentMode(1440, true)).toBe("compact");
  });

  it("uses the starter page-content resolver when compact layout is not forced", () => {
    expect(resolveMeasuredPageContentMode(400, false)).toBe("compact");
    expect(resolveMeasuredPageContentMode(744, false)).toBe("regular");
    expect(resolveMeasuredPageContentMode(1160, false)).toBe("wide");
  });
});

describe("useMeasuredPageContentMode", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => setWindowInnerWidth(originalInnerWidth));

  it("subtracts caller-supplied reserved space from the viewport fallback", () => {
    setWindowInnerWidth(1024);

    const { result } = renderHook(() => useMeasuredPageContentMode({ reservedInlineSize: 280 }));

    expect(result.current.contentMode).toBe("regular");
  });
});
