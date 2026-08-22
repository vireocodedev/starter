import { VireoBottomDrawer } from "./VireoBottomDrawer";
import { vireoBottomDrawerClasses } from "./VireoBottomDrawer.classes";
import { VIREO_BOTTOM_DRAWER_NAME } from "./VireoBottomDrawer.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import type * as MuiMaterial from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@mui/material", async importOriginal => {
  const actual = await importOriginal<typeof MuiMaterial>();
  const ReactModule = await import("react");
  return {
    ...actual,
    SwipeableDrawer: ReactModule.forwardRef<HTMLElement, Record<string, unknown>>(
      function MockSwipeableDrawer(props, ref) {
        return (
          <section
            ref={ref}
            role="dialog"
            className={props.className as string}
            data-testid="bottom-drawer"
            data-anchor={props.anchor}
            data-open={String(props.open)}
            data-hide-backdrop={String(props.hideBackdrop)}
          >
            <button onClick={props.onClose as React.MouseEventHandler<HTMLButtonElement>}>Close drawer</button>
            <button onClick={props.onOpen as React.MouseEventHandler<HTMLButtonElement>}>Open drawer</button>
            <button
              onClick={
                (props.slotProps as { transition?: { onExited?: () => void } } | undefined)?.transition?.onExited
              }
            >
              Exit drawer
            </button>
            {props.children as React.ReactNode}
          </section>
        );
      },
    ),
  };
});

const requiredProps = {
  open: true,
  onClose: vi.fn(),
  children: <span>Drawer content</span>,
} as const;

describe(VIREO_BOTTOM_DRAWER_NAME, () => {
  it("renders the bottom drawer and puller with only required props", () => {
    render(<VireoBottomDrawer {...requiredProps} />);

    const drawer = screen.getByRole("dialog");
    expect(drawer).toHaveAttribute("data-anchor", "bottom");
    expect(drawer).toHaveTextContent("Drawer content");
    expect(drawer.querySelector(`.${vireoBottomDrawerClasses.puller}`)).toHaveAttribute("aria-hidden", "true");
  });

  it("wires close, open, and exit lifecycle callbacks", () => {
    const onClose = vi.fn();
    const onOpen = vi.fn();
    const onExited = vi.fn();
    render(<VireoBottomDrawer {...requiredProps} onClose={onClose} onOpen={onOpen} onExited={onExited} />);

    fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));
    fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));
    fireEvent.click(screen.getByRole("button", { name: "Exit drawer" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it("lets a root slot handler prevent the component close callback", () => {
    const onClose = vi.fn();
    const slotOnClose = vi.fn<React.MouseEventHandler<HTMLElement>>(event => event.preventDefault());
    render(<VireoBottomDrawer {...requiredProps} onClose={onClose} slotProps={{ root: { onClose: slotOnClose } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));

    expect(slotOnClose).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards the root ref and composes classes and puller customization", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoBottomDrawer
        {...requiredProps}
        ref={ref}
        className="direct-root"
        classes={{ root: "custom-root", puller: "custom-puller" }}
        slotProps={{ puller: { "data-puller": "custom" } }}
      />,
    );

    expect(ref.current).toBe(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toHaveClass(vireoBottomDrawerClasses.root, "direct-root", "custom-root");
    expect(document.querySelector(`.${vireoBottomDrawerClasses.puller}`)).toHaveClass("custom-puller");
    expect(document.querySelector(`.${vireoBottomDrawerClasses.puller}`)).toHaveAttribute("data-puller", "custom");
  });

  it("uses theme defaults and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_BOTTOM_DRAWER_NAME]: {
          defaultProps: { useBackdrop: false },
          styleOverrides: { puller: { backgroundColor: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoBottomDrawer {...requiredProps} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-hide-backdrop", "true");
    expect(document.querySelector(`.${vireoBottomDrawerClasses.puller}`)).toHaveStyle({
      backgroundColor: "rgb(123, 45, 67)",
    });
  });

});
