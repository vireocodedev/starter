import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { vireoQueryBoundaryClasses } from "./VireoQueryBoundary.classes";
import { VIREO_QUERY_BOUNDARY_NAME } from "./VireoQueryBoundary.identity";
import { VireoQueryBoundary } from "./VireoQueryBoundary";

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

function renderWithClient(node: React.ReactNode, client = createClient()) {
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

function Pending(): never {
  throw new Promise(() => undefined);
}

function Failure({ error = new Error("Boom") }: { error?: Error }): never {
  throw error;
}

describe(VIREO_QUERY_BOUNDARY_NAME, () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => undefined));

  it("delays the accessible default loading fallback through one shared boundary", () => {
    vi.useFakeTimers();
    renderWithClient(
      <VireoQueryBoundary>
        <Pending />
      </VireoQueryBoundary>,
    );

    const root = document.querySelector(`.${vireoQueryBoundaryClasses.root}`);
    expect(root).toHaveClass(vireoQueryBoundaryClasses.root, vireoQueryBoundaryClasses.loading);
    expect(root).toHaveStyle({ minHeight: "160px" });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(root?.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders successful children directly without a permanent wrapper", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithClient(
      <VireoQueryBoundary ref={ref} data-testid="fallback-root">
        <span>Ready</span>
      </VireoQueryBoundary>,
    );

    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.queryByTestId("fallback-root")).not.toBeInTheDocument();
    expect(ref.current).toBeNull();
  });

  it("renders the default error surface without exposing raw error details", async () => {
    renderWithClient(
      <VireoQueryBoundary>
        <Failure error={new Error("Private server message")} />
      </VireoQueryBoundary>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Private server message")).not.toBeInTheDocument();
  });

  it("retries a failed suspense query and reports the explicit retry", async () => {
    let attempt = 0;
    const onRetry = vi.fn();
    function Query() {
      const { data } = useSuspenseQuery({
        queryKey: ["retry-test"],
        queryFn: async () => {
          attempt += 1;
          if (attempt === 1) throw new Error("First attempt failed");
          return "Recovered";
        },
      });
      return <span>{data}</span>;
    }
    renderWithClient(
      <VireoQueryBoundary onRetry={onRetry}>
        <Query />
      </VireoQueryBoundary>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Recovered")).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("resets a stale error when resetKeys change without reporting a user retry", async () => {
    const onRetry = vi.fn();
    const { rerender } = renderWithClient(
      <VireoQueryBoundary resetKeys={[0]} onRetry={onRetry}>
        <Failure />
      </VireoQueryBoundary>,
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={createClient()}>
        <VireoQueryBoundary resetKeys={[1]} onRetry={onRetry}>
          <span>New route</span>
        </VireoQueryBoundary>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("New route")).toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("supports fixed and predicate retry availability and fails closed when a predicate throws", async () => {
    const { rerender } = renderWithClient(
      <VireoQueryBoundary retryable={false}>
        <Failure />
      </VireoQueryBoundary>,
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={createClient()}>
        <VireoQueryBoundary retryable={() => false} resetKeys={[1]}>
          <Failure />
        </VireoQueryBoundary>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={createClient()}>
        <VireoQueryBoundary
          retryable={() => {
            throw new Error("predicate");
          }}
          resetKeys={[2]}
        >
          <Failure />
        </VireoQueryBoundary>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("reports caught errors with a component stack", async () => {
    const onError = vi.fn();
    renderWithClient(
      <VireoQueryBoundary onError={onError}>
        <Failure />
      </VireoQueryBoundary>,
    );
    await screen.findByRole("alert");
    expect(onError).toHaveBeenCalledWith(expect.any(Error), { componentStack: expect.any(String) });
  });

  it("supports complete custom loading and error fallbacks", async () => {
    const { rerender } = renderWithClient(
      <VireoQueryBoundary loadingFallback={<span>Custom wait</span>}>
        <Pending />
      </VireoQueryBoundary>,
    );
    expect(screen.getByText("Custom wait")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={createClient()}>
        <VireoQueryBoundary errorFallback={({ retryable }) => <span>Custom error {String(retryable)}</span>}>
          <Failure />
        </VireoQueryBoundary>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("Custom error true")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows safely selected error details in VireoJsonViewer and closes the dialog", async () => {
    renderWithClient(
      <VireoQueryBoundary selectErrorDetails={error => ({ message: (error as Error).message, code: "E_QUERY" })}>
        <Failure />
      </VireoQueryBoundary>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Show error details" }));
    expect(screen.getByRole("dialog", { name: "Error details" })).toBeInTheDocument();
    expect(screen.getByText(/E_QUERY/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy error details" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close error details" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("hides details when the selector returns no value or throws", async () => {
    const { rerender } = renderWithClient(
      <VireoQueryBoundary selectErrorDetails={() => null}>
        <Failure />
      </VireoQueryBoundary>,
    );
    await screen.findByRole("alert");
    expect(screen.queryByRole("button", { name: "Show error details" })).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={createClient()}>
        <VireoQueryBoundary
          selectErrorDetails={() => {
            throw new Error("selector");
          }}
          resetKeys={[1]}
        >
          <Failure />
        </VireoQueryBoundary>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("button", { name: "Show error details" })).not.toBeInTheDocument();
  });

  it("lets slot button handlers prevent internal actions", async () => {
    const onRetry = vi.fn();
    renderWithClient(
      <VireoQueryBoundary
        onRetry={onRetry}
        selectErrorDetails={() => ({ code: "E" })}
        slotProps={{
          retryButton: { onClick: event => event.preventDefault() },
          errorDetailsButton: { onClick: event => event.preventDefault() },
        }}
      >
        <Failure />
      </VireoQueryBoundary>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Show error details" }));
    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("composes fallback refs, slots, owner-state slot props, and classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithClient(
      <VireoQueryBoundary
        loadingRevealDelay={0}
        ref={ref}
        classes={{ root: "custom-root", loadingIndicator: "custom-spinner" }}
        slots={{ root: "section" }}
        slotProps={{ root: ownerState => ({ "data-status": ownerState.status }) }}
      >
        <Pending />
      </VireoQueryBoundary>,
    );
    const root = document.querySelector("section");
    if (!(root instanceof HTMLElement)) throw new Error("Missing query boundary fallback root");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveClass("custom-root", vireoQueryBoundaryClasses.root);
    expect(root).toHaveAttribute("data-status", "loading");
    expect(ref.current).toBe(root);
  });

  it("lets an announcing ancestor silence the default loading announcement", () => {
    renderWithClient(
      <VireoQueryBoundary announceLoading={false} loadingRevealDelay={0}>
        <Pending />
      </VireoQueryBoundary>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
  });

  it("supports MUI theme defaults, style overrides, and variants", () => {
    const theme = createTheme({
      components: {
        VireoQueryBoundary: {
          defaultProps: { loadingLabel: "Fetching records" },
          styleOverrides: { root: { border: "2px solid rgb(1, 2, 3)" } },
          variants: [{ props: () => true, style: { borderRadius: "11px" } }],
        },
      },
    });
    renderWithClient(
      <ThemeProvider theme={theme}>
        <VireoQueryBoundary>
          <Pending />
        </VireoQueryBoundary>
      </ThemeProvider>,
    );
    expect(document.querySelector(`.${vireoQueryBoundaryClasses.root}`)).toHaveStyle({
      border: "2px solid rgb(1, 2, 3)",
      borderRadius: "11px",
    });
  });
});
