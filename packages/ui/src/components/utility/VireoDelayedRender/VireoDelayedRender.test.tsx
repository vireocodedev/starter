import { DelayedRender as CompatibilityDelayedRender } from "@/index";
import { ThemeProvider, createTheme } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VireoDelayedRender } from "./VireoDelayedRender";
import { vireoDelayedRenderClasses } from "./VireoDelayedRender.classes";
import { VIREO_DELAYED_RENDER_NAME } from "./VireoDelayedRender.identity";

describe(VIREO_DELAYED_RENDER_NAME, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the deprecated package-root component alias compatible", () => {
    expect(CompatibilityDelayedRender).toBe(VireoDelayedRender);
  });

  it("mounts its children after the default 200ms delay", () => {
    vi.useFakeTimers();
    const { container } = render(
      <VireoDelayedRender>
        <span>Loaded content</span>
      </VireoDelayedRender>,
    );

    expect(container).toBeEmptyDOMElement();

    act(() => vi.advanceTimersByTime(199));
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    const content = screen.getByText("Loaded content");
    expect(content.parentElement).toHaveClass(vireoDelayedRenderClasses.root);
    expect(content.parentElement?.tagName).toBe("DIV");
  });

  it("restarts a pending countdown when the delay changes", () => {
    vi.useFakeTimers();
    const { rerender } = render(<VireoDelayedRender delay={100}>Deferred content</VireoDelayedRender>);

    act(() => vi.advanceTimersByTime(60));
    rerender(<VireoDelayedRender delay={120}>Deferred content</VireoDelayedRender>);

    act(() => vi.advanceTimersByTime(119));
    expect(screen.queryByText("Deferred content")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Deferred content")).toBeInTheDocument();
  });

  it("keeps mounted content visible when props change after the countdown", () => {
    vi.useFakeTimers();
    const { rerender } = render(<VireoDelayedRender delay={0}>Initial content</VireoDelayedRender>);

    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText("Initial content")).toBeInTheDocument();

    rerender(<VireoDelayedRender delay={500}>Updated content</VireoDelayedRender>);
    expect(screen.getByText("Updated content")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels a pending countdown when unmounted", () => {
    vi.useFakeTimers();
    const { unmount } = render(<VireoDelayedRender>Deferred content</VireoDelayedRender>);

    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("forwards refs and merges inherited and root-slot customization", () => {
    vi.useFakeTimers();
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoDelayedRender
        ref={forwardedRef}
        delay={0}
        className="direct-class"
        data-origin="direct"
        style={{ paddingLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { paddingRight: 12 },
          },
        }}
      >
        Customized content
      </VireoDelayedRender>,
    );
    act(() => vi.advanceTimersByTime(0));

    const root = screen.getByText("Customized content");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoDelayedRenderClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and normalized owner-state slot props", () => {
    vi.useFakeTimers();
    render(
      <VireoDelayedRender
        delay={25}
        slots={{ root: "section" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": "Delayed result",
            "data-delay": ownerState.delay,
          }),
        }}
      >
        Result
      </VireoDelayedRender>,
    );
    act(() => vi.advanceTimersByTime(25));

    const root = screen.getByRole("region", { name: "Delayed result" });
    expect(root).toHaveAttribute("data-delay", "25");
    expect(root).toHaveClass(vireoDelayedRenderClasses.root);
  });

  it("uses theme default props and root style overrides", () => {
    vi.useFakeTimers();
    const theme = createTheme({
      components: {
        [VIREO_DELAYED_RENDER_NAME]: {
          defaultProps: { delay: 50, className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)", display: "block" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoDelayedRender>Themed content</VireoDelayedRender>
      </ThemeProvider>,
    );

    act(() => vi.advanceTimersByTime(49));
    expect(screen.queryByText("Themed content")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("Themed content")).toHaveClass("theme-default-class");
    expect(screen.getByText("Themed content")).toHaveStyle({
      color: "rgb(123, 45, 67)",
      display: "block",
    });
  });
});
