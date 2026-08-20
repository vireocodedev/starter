import { DockedSidePanel, VireoDockedSidePanel } from "./VireoDockedSidePanel";
import { vireoDockedSidePanelClasses } from "./VireoDockedSidePanel.classes";
import { VIREO_DOCKED_SIDE_PANEL_NAME } from "./VireoDockedSidePanel.identity";
import * as dockedSidePanelStories from "./VireoDockedSidePanel.stories";
import { DOCKED_SIDE_PANEL_TRANSITION_EVENT } from "@/capabilities/overlays/constants/overlay.constants";
import { ThemeProvider, createTheme } from "@mui/material";
import { composeStories } from "@storybook/react";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const requiredProps = {
  open: true,
  width: 420,
  minWidth: 280,
  maxWidth: 620,
  children: <span>Panel content</span>,
} as const;
const { Default } = composeStories(dockedSidePanelStories);

function fireSurfaceTransitionEnd(element: Element, propertyName: string) {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  fireEvent(element, event);
}

describe(VIREO_DOCKED_SIDE_PANEL_NAME, () => {
  it("renders the reserved root and semantic panel surface with only required props", () => {
    render(<VireoDockedSidePanel {...requiredProps} />);

    const surface = screen.getByRole("complementary");
    expect(surface.tagName).toBe("ASIDE");
    expect(surface).toHaveClass(vireoDockedSidePanelClasses.surface);
    expect(surface).toHaveTextContent("Panel content");
    expect(surface.parentElement).toHaveClass(vireoDockedSidePanelClasses.root);
    expect(surface.parentElement).toHaveAttribute("aria-hidden", "false");
  });

  it("renders the resize handle before panel content", () => {
    render(<VireoDockedSidePanel {...requiredProps} resizeHandle={<span data-testid="resize-handle">Resize</span>} />);

    const surface = screen.getByRole("complementary");
    expect(surface.firstElementChild).toBe(screen.getByTestId("resize-handle"));
    expect(surface.lastElementChild).toHaveTextContent("Panel content");
  });

  it("keeps the panel mounted while leaving and calls onExited exactly once", () => {
    const onExited = vi.fn();
    const { rerender } = render(<VireoDockedSidePanel {...requiredProps} onExited={onExited} />);
    const surface = screen.getByRole("complementary");
    const root = surface.parentElement;

    rerender(<VireoDockedSidePanel {...requiredProps} open={false} onExited={onExited} />);

    expect(root).toHaveAttribute("aria-hidden", "false");
    fireSurfaceTransitionEnd(surface, "width");
    expect(onExited).not.toHaveBeenCalled();

    fireSurfaceTransitionEnd(surface, "opacity");
    fireSurfaceTransitionEnd(surface, "transform");

    expect(onExited).toHaveBeenCalledOnce();
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("composes the surface transition handler before internal behavior", () => {
    const onExited = vi.fn();
    const onTransitionEnd = vi.fn<React.TransitionEventHandler<HTMLElement>>(event => event.preventDefault());
    const { rerender } = render(
      <VireoDockedSidePanel {...requiredProps} onExited={onExited} slotProps={{ surface: { onTransitionEnd } }} />,
    );
    const surface = screen.getByRole("complementary");

    rerender(
      <VireoDockedSidePanel
        {...requiredProps}
        open={false}
        onExited={onExited}
        slotProps={{ surface: { onTransitionEnd } }}
      />,
    );
    fireSurfaceTransitionEnd(surface, "opacity");

    expect(onTransitionEnd).toHaveBeenCalledOnce();
    expect(onExited).not.toHaveBeenCalled();
  });

  it("forwards both root refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    render(
      <VireoDockedSidePanel
        {...requiredProps}
        ref={forwardedRef}
        className="direct-class"
        style={{ paddingLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { paddingRight: 12 },
          },
        }}
      />,
    );

    expect(forwardedRef.current).toBe(screen.getByRole("complementary").parentElement);
    expect(rootSlotRef.current).toBe(forwardedRef.current);
    expect(forwardedRef.current).toHaveClass(vireoDockedSidePanelClasses.root, "direct-class", "slot-class");
    expect(forwardedRef.current).toHaveAttribute("data-origin", "slot");
    expect(forwardedRef.current).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("preserves the deprecated adapter's root ref and surface sx contract", () => {
    const rootRef = vi.fn();
    render(
      <DockedSidePanel
        {...requiredProps}
        rootRef={rootRef}
        style={{ backgroundColor: "rgb(240, 240, 240)" }}
        sx={{ padding: 1.5 }}
      />,
    );

    const surface = screen.getByRole("complementary");
    expect(rootRef).toHaveBeenLastCalledWith(surface.parentElement);
    expect(surface.parentElement).toHaveStyle({ backgroundColor: "rgb(240, 240, 240)" });
    expect(surface).toHaveStyle({ padding: "12px" });
  });

  it("supports replacement slots and owner-state slot props", () => {
    render(
      <VireoDockedSidePanel
        {...requiredProps}
        isResizing
        slots={{ root: "section", surface: "article" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": "Reserved panel space",
            "data-resizing": String(ownerState.isResizing),
          }),
          surface: ownerState => ({
            "aria-label": `Invoice panel, ${ownerState.width}px wide`,
            "data-entered": String(ownerState.isPanelEntered),
          }),
        }}
      />,
    );

    const root = screen.getByRole("region", { name: "Reserved panel space" });
    const surface = screen.getByRole("article", { name: "Invoice panel, 420px wide" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-resizing", "true");
    expect(surface.tagName).toBe("ARTICLE");
    expect(surface).toHaveAttribute("data-entered", "true");
  });

  it("applies custom utility classes to their matching slots", () => {
    render(<VireoDockedSidePanel {...requiredProps} classes={{ root: "custom-root", surface: "custom-surface" }} />);

    const surface = screen.getByRole("complementary");
    expect(surface).toHaveClass("custom-surface");
    expect(surface.parentElement).toHaveClass("custom-root");
  });

  it("uses theme default props and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_DOCKED_SIDE_PANEL_NAME]: {
          defaultProps: { isResizing: true },
          styleOverrides: {
            root: { paddingLeft: 6 },
            surface: { borderLeftWidth: 5 },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoDockedSidePanel
          {...requiredProps}
          slotProps={{ root: ownerState => ({ "data-resizing": String(ownerState.isResizing) }) }}
        />
      </ThemeProvider>,
    );

    const surface = screen.getByRole("complementary");
    expect(surface.parentElement).toHaveAttribute("data-resizing", "true");
    expect(surface.parentElement).toHaveStyle({ paddingLeft: "6px" });
    expect(surface).toHaveStyle({ borderLeftWidth: "5px" });
  });

  it("emits coordinated transition state events while opening", () => {
    const listener = vi.fn();
    window.addEventListener(DOCKED_SIDE_PANEL_TRANSITION_EVENT, listener);
    const { rerender } = render(<VireoDockedSidePanel {...requiredProps} open={false} />);

    rerender(<VireoDockedSidePanel {...requiredProps} open />);
    fireSurfaceTransitionEnd(screen.getByRole("complementary"), "transform");

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls.map(([event]) => (event as CustomEvent<{ animating: boolean }>).detail)).toEqual([
      { animating: true },
      { animating: false },
    ]);
    window.removeEventListener(DOCKED_SIDE_PANEL_TRANSITION_EVENT, listener);
  });

  it("keeps the composed pointer-resize story functional", async () => {
    const { container } = render(<Default />);

    await Default.play?.({ canvasElement: container });

    expect(screen.getByText("420px wide")).toBeInTheDocument();
  });
});
