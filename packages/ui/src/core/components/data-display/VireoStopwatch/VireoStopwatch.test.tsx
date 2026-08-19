import { ThemeProvider, createTheme } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VireoStopwatch } from "./VireoStopwatch";
import { vireoStopwatchClasses } from "./VireoStopwatch.classes";
import { VIREO_STOPWATCH_NAME } from "./VireoStopwatch.identity";

const NOW = new Date("2026-08-19T12:00:00.000Z");

describe(VIREO_STOPWATCH_NAME, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a live zero-duration timer with only optional defaults", () => {
    render(<VireoStopwatch />);

    const timer = screen.getByRole("timer", { name: "Elapsed time: 00:00" });
    expect(timer).toHaveTextContent("00:00");
    expect(timer.tagName).toBe("SPAN");
    expect(timer).toHaveAttribute("aria-atomic", "true");
  });

  it("advances a live stopwatch from its start date", () => {
    render(<VireoStopwatch startDate={NOW.getTime() - 125_000} />);

    expect(screen.getByRole("timer", { name: "Elapsed time: 02:05" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1_000));

    expect(screen.getByRole("timer", { name: "Elapsed time: 02:06" })).toBeInTheDocument();
  });

  it("keeps a stopped duration fixed and accepts Date timestamps", () => {
    const startDate = new Date("2026-01-01T00:00:00.000Z");
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1_000 + 2 * 60 * 1_000 + 3_000);
    render(<VireoStopwatch startDate={startDate} endDate={endDate} label="Processing time" />);

    expect(screen.getByRole("timer", { name: "Processing time: 02:02:03" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_000));

    expect(screen.getByRole("timer", { name: "Processing time: 02:02:03" })).toBeInTheDocument();
  });

  it("formats long durations with unambiguous calendar units", () => {
    const durationSeconds =
      365 * 24 * 60 * 60 + 2 * 30 * 24 * 60 * 60 + 7 * 24 * 60 * 60 + 3 * 24 * 60 * 60 + 4 * 60 * 60 + 5 * 60 + 6;
    render(<VireoStopwatch startDate={0} endDate={durationSeconds * 1_000} />);

    expect(screen.getByRole("timer", { name: "Elapsed time: 1y 2mo 1w 3d 04:05:06" })).toBeInTheDocument();
  });

  it("clamps future and invalid ranges to zero", () => {
    const { rerender } = render(<VireoStopwatch startDate={NOW.getTime() + 60_000} />);
    expect(screen.getByRole("timer", { name: "Elapsed time: 00:00" })).toBeInTheDocument();

    rerender(<VireoStopwatch startDate={Number.NaN} />);
    expect(screen.getByRole("timer", { name: "Elapsed time: 00:00" })).toBeInTheDocument();
  });

  it("forwards refs and composes classes and root slot props", () => {
    const forwardedRef = React.createRef<HTMLSpanElement>();
    const rootSlotRef = React.createRef<HTMLSpanElement>();
    render(
      <VireoStopwatch
        ref={forwardedRef}
        startDate={0}
        endDate={0}
        className="direct-class"
        classes={{ root: "classes-root" }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
          },
        }}
      />,
    );

    const timer = screen.getByRole("timer");
    expect(forwardedRef.current).toBe(timer);
    expect(rootSlotRef.current).toBe(timer);
    expect(timer).toHaveClass(vireoStopwatchClasses.root, "direct-class", "classes-root", "slot-class");
    expect(timer).toHaveAttribute("data-origin", "slot");
  });

  it("supports replacement roots and owner-state slot props without surrendering timer semantics", () => {
    render(
      <VireoStopwatch
        startDate={0}
        endDate={1_000}
        slots={{ root: "output" }}
        slotProps={{
          root: ownerState => ({
            "data-running": ownerState.running,
            "data-valid": ownerState.valid,
            role: "status",
          }),
        }}
      />,
    );

    const timer = screen.getByRole("timer", { name: "Elapsed time: 00:01" });
    expect(timer.tagName).toBe("OUTPUT");
    expect(timer).toHaveAttribute("data-running", "false");
    expect(timer).toHaveAttribute("data-valid", "true");
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_STOPWATCH_NAME]: {
          defaultProps: { label: "Uptime" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoStopwatch startDate={0} endDate={1_000} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("timer", { name: "Uptime: 00:01" })).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
