import { VireoResponsiveOverlayFrame } from "./VireoResponsiveOverlayFrame";
import { vireoResponsiveOverlayFrameClasses } from "./VireoResponsiveOverlayFrame.classes";
import { VIREO_RESPONSIVE_OVERLAY_FRAME_NAME } from "./VireoResponsiveOverlayFrame.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import type * as MuiMaterial from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  variant: "desktop" as "mobile" | "desktop",
  viewportWidth: 1440,
  drawerProps: undefined as Record<string, unknown> | undefined,
  dockedProps: undefined as Record<string, unknown> | undefined,
  resize: {
    isResizing: false,
    onResizeDoubleClick: vi.fn(),
    onResizeStart: vi.fn(),
    rootRef: vi.fn(),
    width: 500,
  },
}));

vi.mock("@/capabilities/overlays/hooks/useRafViewportWidth/useRafViewportWidth", () => ({
  useRafViewportWidth: () => testState.viewportWidth,
}));

vi.mock("@/capabilities/overlays/hooks/useSidePanelResize/useSidePanelResize", () => ({
  useSidePanelResize: () => testState.resize,
}));

vi.mock("@/capabilities/overlays/components/overlays/VireoBottomDrawer", () => ({
  VireoBottomDrawer: ({ children, height, maxHeight, onClose, onExited }: Record<string, unknown>) => (
    <section data-testid="mobile-drawer" data-height={height} data-max-height={maxHeight}>
      <button onClick={onClose as () => void}>Close mobile</button>
      <button onClick={onExited as () => void}>Exit mobile</button>
      {children as React.ReactNode}
    </section>
  ),
}));

vi.mock("@/capabilities/overlays/components/overlays/VireoDockedSidePanel", async () => {
  const ReactModule = await import("react");
  return {
    VireoDockedSidePanel: ReactModule.forwardRef<HTMLElement, Record<string, unknown>>(
      function MockDockedSidePanel(props, ref) {
        testState.dockedProps = props;
        return (
          <section ref={ref} data-testid="docked-side-panel">
            <button onClick={props.onExited as () => void}>Exit docked</button>
            {props.resizeHandle as React.ReactNode}
            {props.children as React.ReactNode}
          </section>
        );
      },
    ),
  };
});

vi.mock("@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle", () => ({
  VireoSidePanelResizeHandle: ({ enabled, onResizeDoubleClick, onResizeStart }: Record<string, unknown>) =>
    enabled ? (
      <button
        data-testid="resize-handle"
        onMouseDown={onResizeStart as React.MouseEventHandler<HTMLButtonElement>}
        onDoubleClick={onResizeDoubleClick as React.MouseEventHandler<HTMLButtonElement>}
      >
        Resize
      </button>
    ) : null,
}));

vi.mock("@mui/material", async importOriginal => {
  const actual = await importOriginal<typeof MuiMaterial>();
  return {
    ...actual,
    useMediaQuery: () => testState.variant === "mobile",
    Dialog: ({ children, maxWidth, onClose, slotProps, TransitionProps }: Record<string, unknown>) => (
      <section
        data-testid="desktop-dialog"
        data-max-width={maxWidth}
        data-custom-paper={String(slotProps !== undefined)}
      >
        <button onClick={onClose as () => void}>Close dialog</button>
        <button onClick={(TransitionProps as { onExited?: () => void } | undefined)?.onExited}>Exit dialog</button>
        {children as React.ReactNode}
      </section>
    ),
    Drawer: (props: Record<string, unknown>) => {
      testState.drawerProps = props;
      return (
        <section data-testid="desktop-drawer" data-anchor={props.anchor}>
          <button onClick={props.onClose as () => void}>Close drawer</button>
          <button
            onClick={(props.slotProps as { transition?: { onExited?: () => void } } | undefined)?.transition?.onExited}
          >
            Exit drawer
          </button>
          {props.children as React.ReactNode}
        </section>
      );
    },
  };
});

const requiredProps = {
  open: true,
  onClose: vi.fn(),
  children: <span>Overlay content</span>,
} as const;

describe(VIREO_RESPONSIVE_OVERLAY_FRAME_NAME, () => {
  beforeEach(() => {
    cleanup();
    testState.variant = "desktop";
    testState.viewportWidth = 1440;
    testState.drawerProps = undefined;
    testState.dockedProps = undefined;
    testState.resize.isResizing = false;
    testState.resize.width = 500;
    testState.resize.onResizeDoubleClick.mockClear();
    testState.resize.onResizeStart.mockClear();
    testState.resize.rootRef.mockClear();
    vi.mocked(requiredProps.onClose).mockClear();
  });

  it("renders the default desktop dialog with only required props", () => {
    render(<VireoResponsiveOverlayFrame {...requiredProps} />);

    expect(screen.getByTestId("desktop-dialog")).toHaveTextContent("Overlay content");
    expect(screen.getByTestId("desktop-dialog")).toHaveAttribute("data-max-width", "lg");
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });

  it("selects the mobile bottom sheet and applies height precedence", () => {
    testState.variant = "mobile";
    const { rerender } = render(<VireoResponsiveOverlayFrame {...requiredProps} />);

    expect(screen.getByTestId("mobile-drawer")).toHaveAttribute("data-max-height", "92dvh");

    rerender(<VireoResponsiveOverlayFrame {...requiredProps} mobileHeight="70dvh" mobileMaxHeight="80dvh" />);
    expect(screen.getByTestId("mobile-drawer")).toHaveAttribute("data-height", "70dvh");
    expect(screen.getByTestId("mobile-drawer")).not.toHaveAttribute("data-max-height");
  });

  it("wires close and exit callbacks through the selected surface", () => {
    const onClose = vi.fn();
    const onExited = vi.fn();
    render(<VireoResponsiveOverlayFrame {...requiredProps} onClose={onClose} onExited={onExited} />);

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Exit dialog" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it("renders an overlay side panel with its paper customization", () => {
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        desktopSurface="overlaySidePanel"
        desktopSidePanelWidth={480}
        desktopSidePanelSx={{ borderLeftWidth: 4 }}
      />,
    );

    expect(screen.getByTestId("desktop-drawer")).toHaveAttribute("data-anchor", "right");
    const paper = (testState.drawerProps?.slotProps as { paper: { sx: unknown } }).paper;
    expect(paper.sx).toBeDefined();
    expect(screen.queryByTestId("resize-handle")).not.toBeInTheDocument();
  });

  it("renders a docked side panel when the workspace can retain its minimum width", () => {
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        desktopSurface="dockedSidePanel"
        desktopSidePanelWidth={420}
        desktopSidePanelMinContentWidth={640}
      />,
    );

    expect(screen.getByTestId("docked-side-panel")).toHaveTextContent("Overlay content");
    expect(testState.dockedProps).toMatchObject({ open: true, width: 420, minWidth: 360, maxWidth: 800 });
  });

  it("falls back from a docked panel to an overlay panel when space is insufficient", () => {
    testState.viewportWidth = 820;
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        desktopSurface="dockedSidePanel"
        desktopSidePanelMinContentWidth={600}
      />,
    );

    expect(screen.getByTestId("desktop-drawer")).toBeInTheDocument();
    expect(screen.queryByTestId("docked-side-panel")).not.toBeInTheDocument();
  });

  it("connects the resize hook to side-panel surfaces", () => {
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        allowSidePanelResize
        desktopSurface="dockedSidePanel"
        desktopSidePanelWidth={420}
        desktopSidePanelMinContentWidth={640}
      />,
    );

    fireEvent.mouseDown(screen.getByTestId("resize-handle"));
    fireEvent.doubleClick(screen.getByTestId("resize-handle"));

    expect(testState.resize.onResizeStart).toHaveBeenCalledOnce();
    expect(testState.resize.onResizeDoubleClick).toHaveBeenCalledOnce();
    expect(testState.dockedProps?.width).toBe("var(--responsive-overlay-side-panel-width)");
    expect(testState.dockedProps?.style).toMatchObject({ "--responsive-overlay-side-panel-width": "500px" });
  });

  it("forwards both root refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        ref={forwardedRef}
        data-testid="frame-root"
        className="direct-class"
        style={{ color: "rgb(1, 2, 3)" }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { fontWeight: 700 },
          },
        }}
      />,
    );

    const root = screen.getByTestId("frame-root");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoResponsiveOverlayFrameClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ color: "rgb(1, 2, 3)", fontWeight: "700" });
  });

  it("supports a replacement root and exposes normalized owner state", () => {
    render(
      <VireoResponsiveOverlayFrame
        {...requiredProps}
        desktopSurface="overlaySidePanel"
        allowSidePanelResize
        slots={{ root: "section" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": "Responsive overlay frame",
            "data-effective-surface": ownerState.effectiveDesktopSurface,
            "data-resizable": String(ownerState.sidePanelResizeEnabled),
          }),
        }}
      />,
    );

    const root = screen.getByRole("region", { name: "Responsive overlay frame" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-effective-surface", "overlaySidePanel");
    expect(root).toHaveAttribute("data-resizable", "true");
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_RESPONSIVE_OVERLAY_FRAME_NAME]: {
          defaultProps: { desktopSurface: "overlaySidePanel" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoResponsiveOverlayFrame {...requiredProps} data-testid="themed-root" />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("desktop-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("themed-root")).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
