import { ResponsiveOverlayFrame } from "@/overlay/ResponsiveOverlayFrame";
import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const responsiveState = vi.hoisted(() => ({ variant: "desktop" as "mobile" | "desktop" }));

vi.mock("@/hooks/useResponsiveProps", () => ({
  useResponsiveProps: <M, D>(config: { mobile: M; desktop: D }) => config[responsiveState.variant],
}));

vi.mock("@/components/AppBottomDrawer", () => ({
  AppBottomDrawer: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="mobile-drawer">{children}</section>
  ),
}));

vi.mock("@/capabilities/overlays/public", () => ({
  DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH: 360,
  DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET: 48,
  SIDE_PANEL_WIDTH_CSS_VAR: "--responsive-overlay-side-panel-width",
  clampSidePanelWidth: (width: number, minWidth: number, maxWidth: number) =>
    Math.max(minWidth, Math.min(width, Math.max(minWidth, maxWidth))),
  getDefaultDesktopSidePanelWidth: () => 560,
  getNumericDesktopSidePanelWidth: (width: number | string) => (typeof width === "number" ? width : 560),
  resolveDockedSidePanelWidth: (width: number | string) => width,
  useRafViewportWidth: () => 1440,
  useSidePanelResize: () => ({
    isResizing: false,
    onResizeDoubleClick: vi.fn(),
    onResizeStart: vi.fn(),
    rootRef: { current: null },
    width: 560,
  }),
  VireoDockedSidePanel: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="docked-side-panel">{children}</section>
  ),
  VireoSidePanelResizeHandle: () => null,
}));

vi.mock("@mui/material", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <section data-testid="desktop-dialog">{children}</section>,
  Drawer: ({ children }: { children: React.ReactNode }) => <section data-testid="desktop-drawer">{children}</section>,
}));

describe("ResponsiveOverlayFrame", () => {
  beforeEach(() => {
    cleanup();
    responsiveState.variant = "desktop";
  });

  it("renders ordinary children inside the mobile drawer", () => {
    responsiveState.variant = "mobile";

    render(
      <ResponsiveOverlayFrame open onClose={vi.fn()}>
        <span>Overlay content</span>
      </ResponsiveOverlayFrame>,
    );

    expect(screen.getByTestId("mobile-drawer")).toHaveTextContent("Overlay content");
    expect(screen.queryByTestId("desktop-dialog")).not.toBeInTheDocument();
  });

  it("renders ordinary children inside the configured desktop surface", () => {
    render(
      <ResponsiveOverlayFrame open onClose={vi.fn()}>
        <span>Overlay content</span>
      </ResponsiveOverlayFrame>,
    );

    expect(screen.getByTestId("desktop-dialog")).toHaveTextContent("Overlay content");
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });
});
