import { useNestedPageNavigation, type NestedPageTransitionAdapter } from "@/navigation/useNestedPageNavigation";
import { act, render, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

const stateKey = "nested-page";

type NavigationResult = ReturnType<typeof useNestedPageNavigation>;

function renderHarness({
  fallbackParentPath,
  initialEntry,
}: {
  fallbackParentPath?: string;
  initialEntry: { pathname: string; search?: string; hash?: string; state?: unknown };
}) {
  let current: NavigationResult | undefined;
  const startViewTransition = vi.fn<NestedPageTransitionAdapter>(async (navigation, direction) => {
    void direction;
    navigation();
  });

  function Harness() {
    current = useNestedPageNavigation({ fallbackParentPath, startViewTransition, stateKey });
    return null;
  }

  const router = createMemoryRouter([{ path: "*", element: <Harness /> }], { initialEntries: [initialEntry] });
  render(<RouterProvider router={router} />);

  return {
    get current() {
      if (!current) throw new Error("Navigation harness has not rendered.");
      return current;
    },
    router,
    startViewTransition,
  };
}

describe("useNestedPageNavigation", () => {
  it("records the full parent identity and restores its state on back navigation", async () => {
    const harness = renderHarness({
      initialEntry: { pathname: "/products", search: "?page=2", hash: "#rows", state: { filter: "open" } },
    });

    await act(() => harness.current.navigateForward("/products/7/edit", { state: { productId: 7 } }));

    expect(harness.startViewTransition).toHaveBeenLastCalledWith(expect.any(Function), "forward");
    expect(harness.router.state.location.pathname).toBe("/products/7/edit");
    expect(harness.router.state.location.state).toEqual({
      productId: 7,
      [stateKey]: {
        parentPath: "/products?page=2#rows",
        parentState: { filter: "open" },
      },
    });

    await waitFor(() => expect(harness.current.parentPath).toBe("/products?page=2#rows"));
    const runNavigation = vi.fn((navigation: () => void) => navigation());
    await act(() => harness.current.navigateBack({ runNavigation }));

    expect(runNavigation).toHaveBeenCalledOnce();
    expect(harness.startViewTransition).toHaveBeenLastCalledWith(expect.any(Function), "back");
    expect(harness.router.state.location).toMatchObject({
      pathname: "/products",
      search: "?page=2",
      hash: "#rows",
      state: { filter: "open" },
    });
  });

  it("uses the configured fallback for a directly loaded nested page", async () => {
    const harness = renderHarness({ fallbackParentPath: "/products", initialEntry: { pathname: "/products/7" } });

    expect(harness.current.parentPath).toBe("/products");
    await act(() => harness.current.navigateBack());

    expect(harness.router.state.location.pathname).toBe("/products");
    expect(harness.router.state.location.state).toBeNull();
  });

  it("does not start a transition when no parent is available", async () => {
    const harness = renderHarness({ initialEntry: { pathname: "/standalone" } });

    await act(() => harness.current.navigateBack());

    expect(harness.startViewTransition).not.toHaveBeenCalled();
    expect(harness.router.state.location.pathname).toBe("/standalone");
  });
});
