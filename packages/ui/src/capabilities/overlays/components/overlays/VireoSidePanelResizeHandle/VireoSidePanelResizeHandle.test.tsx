import { VireoSidePanelResizeHandle } from "./VireoSidePanelResizeHandle";
import { vireoSidePanelResizeHandleClasses } from "./VireoSidePanelResizeHandle.classes";
import { VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME } from "./VireoSidePanelResizeHandle.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

function getRequiredProps() {
  return { onResizeStart: vi.fn(), onResizeDoubleClick: vi.fn() };
}

describe(VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME, () => {
  it("renders its essential default output with only required props", () => {
    render(<VireoSidePanelResizeHandle {...getRequiredProps()} />);

    const handle = screen.getByRole("presentation");
    expect(handle.tagName).toBe("DIV");
    expect(handle).toHaveClass(vireoSidePanelResizeHandleClasses.root);
  });

  it("does not render when disabled", () => {
    render(<VireoSidePanelResizeHandle {...getRequiredProps()} enabled={false} />);

    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  it("starts and resets resizing unless a slot handler prevents the action", () => {
    const onResizeStart = vi.fn();
    const onResizeDoubleClick = vi.fn();
    const preventDefault = vi.fn<React.MouseEventHandler<HTMLDivElement>>(event => event.preventDefault());
    const { rerender } = render(
      <VireoSidePanelResizeHandle
        onResizeStart={onResizeStart}
        onResizeDoubleClick={onResizeDoubleClick}
        slotProps={{ root: { onMouseDown: preventDefault, onDoubleClick: preventDefault } }}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("presentation"));
    fireEvent.doubleClick(screen.getByRole("presentation"));
    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(onResizeDoubleClick).not.toHaveBeenCalled();

    rerender(<VireoSidePanelResizeHandle onResizeStart={onResizeStart} onResizeDoubleClick={onResizeDoubleClick} />);
    fireEvent.mouseDown(screen.getByRole("presentation"));
    fireEvent.doubleClick(screen.getByRole("presentation"));
    expect(onResizeStart).toHaveBeenCalledOnce();
    expect(onResizeDoubleClick).toHaveBeenCalledOnce();
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoSidePanelResizeHandle
        {...getRequiredProps()}
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

    const root = screen.getByRole("presentation");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoSidePanelResizeHandleClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    render(
      <VireoSidePanelResizeHandle
        {...getRequiredProps()}
        isResizing
        slots={{ root: "section" }}
        slotProps={{ root: ownerState => ({ "data-resizing": String(ownerState.isResizing) }) }}
      />,
    );

    const root = screen.getByRole("presentation");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-resizing", "true");
    expect(root).toHaveClass(vireoSidePanelResizeHandleClasses.root, vireoSidePanelResizeHandleClasses.resizing);
  });

  it("composes custom utility classes for its root and active state", () => {
    render(
      <VireoSidePanelResizeHandle
        {...getRequiredProps()}
        isResizing
        classes={{ root: "custom-root", resizing: "custom-resizing" }}
      />,
    );

    expect(screen.getByRole("presentation")).toHaveClass("custom-root", "custom-resizing");
  });

  it("uses theme default props and root and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: {
            root: { backgroundColor: "rgb(123, 45, 67)" },
            resizing: { width: 20 },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoSidePanelResizeHandle {...getRequiredProps()} isResizing />
      </ThemeProvider>,
    );

    expect(screen.getByRole("presentation")).toHaveClass("theme-default-class");
    expect(screen.getByRole("presentation")).toHaveStyle({
      backgroundColor: "rgb(123, 45, 67)",
      width: "20px",
    });
  });
});
