import {
  PageOverlayControllerContext,
  type PageOverlayControllerValue,
  usePageOverlayController,
} from "@/overlay/PageOverlayControllerContext";
import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const contextValue: PageOverlayControllerValue = {
  hostElement: null,
  setHostElement: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
  requestExclusive: vi.fn(),
};

describe("usePageOverlayController", () => {
  it("throws outside controller provider", () => {
    expect(() => renderHook(() => usePageOverlayController())).toThrow(
      /must be used within PageOverlayControllerProvider/i,
    );
  });

  it("returns controller context inside provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PageOverlayControllerContext.Provider value={contextValue}>{children}</PageOverlayControllerContext.Provider>
    );

    const { result } = renderHook(() => usePageOverlayController(), { wrapper });
    expect(result.current).toBe(contextValue);
  });
});
