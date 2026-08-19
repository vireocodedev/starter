import {
  PageOverlayControllerContext,
  type PageOverlayControllerValue,
  usePageOverlayController,
} from "./PageOverlayControllerContext";
import { renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const contextValue: PageOverlayControllerValue = {
  hostElement: null,
  setHostElement: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
  requestExclusive: vi.fn(),
};

afterEach(() => vi.restoreAllMocks());

describe("usePageOverlayController", () => {
  it("throws outside controller provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

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
