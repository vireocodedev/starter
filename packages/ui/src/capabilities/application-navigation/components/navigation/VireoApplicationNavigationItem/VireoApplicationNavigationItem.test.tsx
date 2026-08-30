import { VireoApplicationNavigationItem } from "./VireoApplicationNavigationItem";
import { vireoApplicationNavigationItemClasses } from "./VireoApplicationNavigationItem.classes";
import { VIREO_APPLICATION_NAVIGATION_ITEM_NAME } from "./VireoApplicationNavigationItem.identity";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe(VIREO_APPLICATION_NAVIGATION_ITEM_NAME, () => {
  it("renders icon and full label in expanded mode", () => {
    render(
      <VireoApplicationNavigationItem href="/inventory" icon={<span data-testid="icon">I</span>} label="Inventory" />,
    );

    expect(screen.getByRole("link", { name: /Inventory/ })).toHaveAttribute("href", "/inventory");
    expect(screen.getByTestId("icon")).toBeVisible();
  });

  it("renders a short caption in compact mode", () => {
    render(
      <VireoApplicationNavigationItem
        href="/inventory"
        icon={<span>I</span>}
        label="Inventory management"
        compactLabel="Items"
        mode="compact"
      />,
    );

    expect(screen.getByText("Items")).toBeVisible();
    expect(screen.queryByText("Inventory management")).not.toBeInTheDocument();
  });

  it("places compact-mode tooltips to the right of the navigation item", async () => {
    render(<VireoApplicationNavigationItem href="/inventory" icon={<span>I</span>} label="Inventory" mode="compact" />);

    fireEvent.mouseOver(screen.getByRole("link", { name: /Inventory/ }));

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(tooltip).toHaveAttribute("data-popper-placement", "right"));
  });

  it("forwards selection, disabled state, events, and refs", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const { rerender } = render(
      <VireoApplicationNavigationItem
        ref={ref}
        href="/overview"
        icon={<span>I</span>}
        label="Overview"
        selected
        onClick={onClick}
      />,
    );
    const link = screen.getByRole("link", { name: /Overview/ });

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBe(link);
    expect(link).toHaveClass(vireoApplicationNavigationItemClasses.root, "Mui-selected");
    expect(link).toHaveAttribute("aria-current", "page");

    rerender(
      <VireoApplicationNavigationItem
        href="/overview"
        icon={<span>I</span>}
        label="Overview"
        disabled
        onClick={onClick}
      />,
    );
    const disabledLink = screen.getByText("Overview").closest("a");
    expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    expect(disabledLink).not.toHaveAttribute("aria-current");
    expect(disabledLink).toHaveAttribute("tabindex", "-1");
    fireEvent.click(disabledLink!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("composes root-slot and top-level click handlers", () => {
    const slotClick = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(
      <VireoApplicationNavigationItem
        href="/settings"
        icon={<span>I</span>}
        label="Settings"
        onClick={onClick}
        slotProps={{ root: { onClick: slotClick } }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /Settings/ }));

    expect(slotClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("allows the root-slot click handler to cancel the top-level handler", () => {
    const slotClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const onClick = vi.fn();
    render(
      <VireoApplicationNavigationItem
        href="/settings"
        icon={<span>I</span>}
        label="Settings"
        onClick={onClick}
        slotProps={{ root: { onClick: slotClick } }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /Settings/ }));

    expect(slotClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports owner-state slot props", () => {
    render(
      <VireoApplicationNavigationItem
        href="/settings"
        icon={<span>I</span>}
        label="Settings"
        mode="compact"
        slotProps={{ root: ownerState => ({ "data-mode": ownerState.mode }) }}
      />,
    );

    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute("data-mode", "compact");
  });
});
