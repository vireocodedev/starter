import { VIREO_LOADING_TOKENS } from "@/core/constants/loading.constants";
import { ThemeProvider, createTheme } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VireoLoadingRegion } from "./VireoLoadingRegion";
import { vireoLoadingRegionClasses } from "./VireoLoadingRegion.classes";
import { VIREO_LOADING_REGION_NAME } from "./VireoLoadingRegion.identity";

describe(VIREO_LOADING_REGION_NAME, () => {
  afterEach(() => vi.useRealTimers());

  it("renders idle content with stable non-busy semantics", () => {
    render(
      <VireoLoadingRegion loading={false} loadingLabel="Loading records">
        <span>Records ready</span>
      </VireoLoadingRegion>,
    );

    const root = screen.getByText("Records ready").parentElement;
    expect(root).toHaveAttribute("aria-busy", "false");
    expect(root).toHaveAttribute("data-loading-state", "idle");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("reveals visual loading state and one polite status after the shared delay", () => {
    vi.useFakeTimers();
    render(
      <VireoLoadingRegion loading loadingLabel="Loading records">
        {state => <span>{state.loadingVisible ? "Skeleton visible" : "Reserved geometry"}</span>}
      </VireoLoadingRegion>,
    );

    const root = screen.getByText("Reserved geometry").parentElement;
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("data-loading-state", "pending");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(VIREO_LOADING_TOKENS.revealDelay));

    expect(screen.getByText("Skeleton visible").parentElement).toHaveClass(
      vireoLoadingRegionClasses.loading,
      vireoLoadingRegionClasses.loadingVisible,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading records");
  });

  it("never announces an operation that finishes before the reveal delay", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <VireoLoadingRegion loading loadingLabel="Loading records">
        Content
      </VireoLoadingRegion>,
    );

    act(() => vi.advanceTimersByTime(VIREO_LOADING_TOKENS.revealDelay - 1));
    rerender(
      <VireoLoadingRegion loading={false} loadingLabel="Loading records">
        Content
      </VireoLoadingRegion>,
    );
    act(() => vi.runAllTimers());

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Content")).toHaveAttribute("data-loading-state", "idle");
  });

  it("supports silent nested visual regions", () => {
    render(
      <VireoLoadingRegion announce={false} loading loadingLabel="Loading nested panel" revealDelay={0}>
        Nested placeholder
      </VireoLoadingRegion>,
    );

    expect(screen.getByText("Nested placeholder")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("forwards refs and exposes normalized state to both slots", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const statusRef = React.createRef<HTMLSpanElement>();
    render(
      <VireoLoadingRegion
        ref={forwardedRef}
        loading
        loadingLabel="Loading records"
        revealDelay={-10}
        slots={{ root: "section" }}
        slotProps={{
          root: state => ({ "aria-label": "Records", "data-delay": state.revealDelay }),
          status: { ref: statusRef, "data-origin": "status-slot" },
        }}
      >
        Region content
      </VireoLoadingRegion>,
    );

    const root = screen.getByRole("region", { name: "Records" });
    expect(forwardedRef.current).toBe(root);
    expect(root).toHaveAttribute("data-delay", "0");
    expect(statusRef.current).toBe(screen.getByRole("status"));
    expect(statusRef.current).toHaveAttribute("data-origin", "status-slot");
  });

  it("uses theme default props and slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_LOADING_REGION_NAME]: {
          defaultProps: { announce: false, className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoLoadingRegion loading loadingLabel="Loading" revealDelay={0}>
          Themed content
        </VireoLoadingRegion>
      </ThemeProvider>,
    );

    expect(screen.getByText("Themed content")).toHaveClass("theme-default-class");
    expect(screen.getByText("Themed content")).toHaveStyle({ color: "rgb(123, 45, 67)" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
