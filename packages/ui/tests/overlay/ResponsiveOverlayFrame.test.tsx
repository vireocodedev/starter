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

vi.mock("@/overlay/useRafViewportWidth", () => ({
  useRafViewportWidth: () => 1440,
}));

vi.mock("@/overlay/useSidePanelResize", () => ({
  useSidePanelResize: () => ({
    isResizing: false,
    onResizeDoubleClick: vi.fn(),
    onResizeStart: vi.fn(),
    rootRef: { current: null },
    width: 560,
  }),
}));

vi.mock("@/overlay/DockedSidePanel", () => ({
  DockedSidePanel: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="docked-side-panel">{children}</section>
  ),
}));

vi.mock("@/overlay/SidePanelResizeHandle", () => ({
  SidePanelResizeHandle: () => null,
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
