import { ThemeProvider, createTheme } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { describe, expect, it, vi } from "vitest";
import { VireoInitializationBoundary } from "./VireoInitializationBoundary";
import { vireoInitializationBoundaryClasses } from "./VireoInitializationBoundary.classes";
import { VIREO_INITIALIZATION_BOUNDARY_NAME } from "./VireoInitializationBoundary.identity";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe(VIREO_INITIALIZATION_BOUNDARY_NAME, () => {
  it("shows the fallback until initialization resolves", async () => {
    const initialization = deferred<void>();
    render(
      <VireoInitializationBoundary initialize={() => initialization.promise} fallback="Preparing workspace">
        Workspace ready
      </VireoInitializationBoundary>,
    );
    expect(screen.getByText("Preparing workspace")).toBeInTheDocument();
    expect(screen.queryByText("Workspace ready")).not.toBeInTheDocument();
    await act(async () => initialization.resolve());
    expect(screen.getByText("Workspace ready")).toBeInTheDocument();
  });

  it("aborts and cleans up an initialized lifecycle on unmount", async () => {
    const cleanup = vi.fn();
    let signal: AbortSignal | undefined;
    const view = render(
      <VireoInitializationBoundary
        initialize={context => {
          signal = context.signal;
          return cleanup;
        }}
      >
        Ready
      </VireoInitializationBoundary>,
    );
    await screen.findByText("Ready");
    view.unmount();
    expect(signal?.aborted).toBe(true);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("runs cleanup returned after unmount", async () => {
    const initialization = deferred<() => void>();
    const cleanup = vi.fn();
    const view = render(
      <VireoInitializationBoundary initialize={() => initialization.promise}>Ready</VireoInitializationBoundary>,
    );
    await act(async () => undefined);
    view.unmount();
    await act(async () => initialization.resolve(cleanup));
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("restarts when initialize changes and cleans up the previous lifecycle", async () => {
    const firstCleanup = vi.fn();
    const first = vi.fn(() => firstCleanup);
    const secondInitialization = deferred<void>();
    const second = vi.fn(() => secondInitialization.promise);
    const { rerender } = render(
      <VireoInitializationBoundary initialize={first} fallback="Pending">
        Ready
      </VireoInitializationBoundary>,
    );
    await screen.findByText("Ready");
    rerender(
      <VireoInitializationBoundary initialize={second} fallback="Pending">
        Ready again
      </VireoInitializationBoundary>,
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(firstCleanup).toHaveBeenCalledOnce();
    await act(async () => secondInitialization.resolve());
    expect(screen.getByText("Ready again")).toBeInTheDocument();
  });

  it("throws initialization failures into the nearest error boundary", async () => {
    const initialize = vi.fn(async () => {
      throw new Error("Configuration unavailable");
    });
    render(
      <ErrorBoundary fallbackRender={({ error }) => <span>{error.message}</span>}>
        <VireoInitializationBoundary initialize={initialize}>Ready</VireoInitializationBoundary>
      </ErrorBoundary>,
    );
    expect(await screen.findByText("Configuration unavailable")).toBeInTheDocument();
  });

  it("avoids duplicate initialization during the Strict Mode preflight", async () => {
    const initialize = vi.fn();
    render(
      <React.StrictMode>
        <VireoInitializationBoundary initialize={initialize}>Ready</VireoInitializationBoundary>
      </React.StrictMode>,
    );
    await screen.findByText("Ready");
    expect(initialize).toHaveBeenCalledOnce();
  });

  it("forwards refs, merges root customization, and exposes lifecycle state", async () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    render(
      <VireoInitializationBoundary
        initialize={() => undefined}
        ref={forwardedRef}
        className="direct-class"
        slotProps={{ root: { ref: rootSlotRef, className: "slot-class", "data-origin": "slot" } }}
      >
        Ready
      </VireoInitializationBoundary>,
    );
    const root = await screen.findByText("Ready");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(
      vireoInitializationBoundaryClasses.root,
      vireoInitializationBoundaryClasses.ready,
      "direct-class",
      "slot-class",
    );
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveAttribute("data-vireo-initialization-state", "ready");
  });

  it("supports replacement roots, owner-state slot props, and theme customization", async () => {
    const theme = createTheme({
      components: {
        [VIREO_INITIALIZATION_BOUNDARY_NAME]: {
          defaultProps: { className: "theme-default" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoInitializationBoundary
          initialize={() => undefined}
          slots={{ root: "section" }}
          slotProps={{ root: ownerState => ({ "aria-label": ownerState.status }) }}
        >
          Ready
        </VireoInitializationBoundary>
      </ThemeProvider>,
    );
    const root = await screen.findByRole("region", { name: "ready" });
    expect(root).toHaveClass("theme-default");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
