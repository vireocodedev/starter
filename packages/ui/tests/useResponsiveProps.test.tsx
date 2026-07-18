import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const deviceState = vi.hoisted(() => ({
  current: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  },
}));

vi.mock("@/hooks/useMediaQueryDevice", () => ({
  useMediaQueryDevice: () => deviceState.current,
}));

describe("useResponsiveProps", () => {
  beforeEach(() => {
    deviceState.current = {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  });

  it("returns the mobile configuration on a mobile viewport", () => {
    deviceState.current = {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    };

    const { result } = renderHook(() =>
      useResponsiveProps({
        mobile: { placement: "drawer", fullHeight: true },
        desktop: { placement: "dialog", fullHeight: false },
      }),
    );

    expect(result.current).toEqual({ placement: "drawer", fullHeight: true });
  });

  it("returns the desktop configuration for tablet and desktop viewports", () => {
    deviceState.current = {
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    };

    type ResponsiveConfig = {
      placement: "drawer" | "dialog";
      fullHeight: boolean;
    };

    const { result } = renderHook(() =>
      useResponsiveProps<ResponsiveConfig>({
        mobile: { placement: "drawer", fullHeight: true },
        desktop: { placement: "dialog", fullHeight: false },
      }),
    );

    expect(result.current).toEqual({ placement: "dialog", fullHeight: false });
  });
});
