import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useVireoMutation } from "./useVireoMutation";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function Wrapper({ children }: React.PropsWithChildren) {
  const [client] = React.useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useVireoMutation", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.success).mockClear();
  });

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
    expect(toast.success).toHaveBeenCalledWith("Saved Northstar");
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
    const action = vi.mocked(toast.error).mock.calls.at(-1)?.[1]?.action;
    render(action as React.ReactElement);
    expect(screen.getByRole("button", { name: "Show error details" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show error details" }));
    expect(screen.getByRole("dialog", { name: "Error details" })).toBeInTheDocument();
    expect(screen.getByText(/DUPLICATE/)).toBeInTheDocument();
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
    expect(toast.error).toHaveBeenCalledWith("Could not save", { action: undefined });
  });

  it("does not notify when a message is omitted", async () => {
    const { result } = renderHook(() => useVireoMutation({ mutationFn: async () => "done" }), {
      wrapper: Wrapper,
    });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
