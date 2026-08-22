import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { VireoIconRegistryProvider } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import { useVireoMutation } from "./useVireoMutation";

vi.mock("sonner", () => ({ toast: { custom: vi.fn() } }));

function Wrapper({ children }: React.PropsWithChildren) {
  const [client] = React.useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useVireoMutation", () => {
  beforeEach(() => vi.mocked(toast.custom).mockClear());

  it("preserves TanStack success callbacks and presents a success notification", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () =>
        useVireoMutation({
          mutationFn: async (name: string) => ({ name }),
          successMessage: data => `Saved ${data.name}`,
          onSuccess,
        }),
      { wrapper: Wrapper },
    );

    act(() => result.current.mutate("Northstar"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalled();
    expect(toast.custom).toHaveBeenCalledOnce();

    const renderToast = vi.mocked(toast.custom).mock.calls[0]?.[0];
    render(<VireoIconRegistryProvider>{renderToast?.("toast-id") as React.ReactElement}</VireoIconRegistryProvider>);
    expect(screen.getByText("Saved Northstar")).toBeInTheDocument();
  });

  it("validates selected error details with Zod before exposing them", async () => {
    const error = Object.assign(new Error("Request failed"), {
      response: { data: { code: "DUPLICATE", field: "name" } },
    });
    const { result } = renderHook(
      () =>
        useVireoMutation({
          mutationFn: async () => Promise.reject(error),
          errorMessage: "Could not save",
          errorDetails: { schema: z.object({ code: z.string(), field: z.string() }) },
        }),
      { wrapper: Wrapper },
    );

    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    const renderToast = vi.mocked(toast.custom).mock.calls.at(-1)?.[0];
    render(<VireoIconRegistryProvider>{renderToast?.("toast-id") as React.ReactElement}</VireoIconRegistryProvider>);
    expect(screen.getByRole("button", { name: "Show error details" })).toBeInTheDocument();
  });

  it("does not expose malformed error details", async () => {
    const error = Object.assign(new Error("Request failed"), { response: { data: { unexpected: true } } });
    const { result } = renderHook(
      () =>
        useVireoMutation({
          mutationFn: async () => Promise.reject(error),
          errorMessage: "Could not save",
          errorDetails: { schema: z.object({ code: z.string() }) },
        }),
      { wrapper: Wrapper },
    );

    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    const renderToast = vi.mocked(toast.custom).mock.calls.at(-1)?.[0];
    render(<VireoIconRegistryProvider>{renderToast?.("toast-id") as React.ReactElement}</VireoIconRegistryProvider>);
    expect(screen.queryByRole("button", { name: "Show error details" })).not.toBeInTheDocument();
  });

  it("does not notify when a message is omitted", async () => {
    const { result } = renderHook(() => useVireoMutation({ mutationFn: async () => "done" }), {
      wrapper: Wrapper,
    });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.custom).not.toHaveBeenCalled();
  });
});
