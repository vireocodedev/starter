import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoProviderComposer } from "./VireoProviderComposer";
import type { VireoProviderWrapper } from "./VireoProviderComposer.types";

const OrderContext = React.createContext<string[]>([]);

function namedProvider(name: string, call: (name: string) => void): VireoProviderWrapper {
  return children => {
    call(name);
    return (
      <OrderContext.Consumer>
        {order => <OrderContext.Provider value={[...order, name]}>{children}</OrderContext.Provider>}
      </OrderContext.Consumer>
    );
  };
}

describe("VireoProviderComposer", () => {
  it("orders wrappers from outermost to innermost", () => {
    const called = vi.fn<(name: string) => void>();
    function Consumer() {
      return <span>{React.useContext(OrderContext).join(" > ")}</span>;
    }
    render(
      <VireoProviderComposer providers={[namedProvider("theme", called), namedProvider("query", called)]}>
        <Consumer />
      </VireoProviderComposer>,
    );
    expect(screen.getByText("theme > query")).toBeInTheDocument();
    expect(called.mock.calls.map(([name]) => name)).toEqual(["query", "theme"]);
  });

  it("renders children unchanged when the provider list is empty", () => {
    render(<VireoProviderComposer providers={[]}>Application</VireoProviderComposer>);
    expect(screen.getByText("Application")).toBeInTheDocument();
  });

  it("recomposes when configured wrappers change", () => {
    const first: VireoProviderWrapper = children => <section data-provider="first">{children}</section>;
    const second: VireoProviderWrapper = children => <section data-provider="second">{children}</section>;
    const { rerender } = render(<VireoProviderComposer providers={[first]}>Application</VireoProviderComposer>);
    expect(screen.getByText("Application")).toHaveAttribute("data-provider", "first");
    rerender(<VireoProviderComposer providers={[second]}>Application</VireoProviderComposer>);
    expect(screen.getByText("Application")).toHaveAttribute("data-provider", "second");
  });
});
