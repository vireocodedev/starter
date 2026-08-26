import { VireoApplicationNavigationItem } from "./VireoApplicationNavigationItem";
import { vireoApplicationNavigationItemClasses } from "./VireoApplicationNavigationItem.classes";
import { VIREO_APPLICATION_NAVIGATION_ITEM_NAME } from "./VireoApplicationNavigationItem.identity";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe(VIREO_APPLICATION_NAVIGATION_ITEM_NAME, () => {
  it("renders icon and full label in expanded mode", () => {
    render(<VireoApplicationNavigationItem icon={<span data-testid="icon">I</span>} label="Inventory" />);

    expect(screen.getByRole("button", { name: /Inventory/ })).toBeVisible();
    expect(screen.getByTestId("icon")).toBeVisible();
  });

  it("renders a short caption in compact mode", () => {
    render(
      <VireoApplicationNavigationItem
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
    render(<VireoApplicationNavigationItem icon={<span>I</span>} label="Inventory" mode="compact" />);

    fireEvent.mouseOver(screen.getByRole("button", { name: /Inventory/ }));

    const tooltip = await screen.findByRole("tooltip");
    await waitFor(() => expect(tooltip).toHaveAttribute("data-popper-placement", "right"));
  });

  it("forwards selection, disabled state, events, and refs", () => {
    const ref = React.createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const { rerender } = render(
      <VireoApplicationNavigationItem ref={ref} icon={<span>I</span>} label="Overview" selected onClick={onClick} />,
    );
    const button = screen.getByRole("button", { name: /Overview/ });

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBe(button);
    expect(button).toHaveClass(vireoApplicationNavigationItemClasses.root, "Mui-selected");
    expect(button).toHaveAttribute("aria-current", "page");

    rerender(<VireoApplicationNavigationItem icon={<span>I</span>} label="Overview" disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports owner-state slot props", () => {
    render(
      <VireoApplicationNavigationItem
        icon={<span>I</span>}
        label="Settings"
        mode="compact"
        slotProps={{ root: ownerState => ({ "data-mode": ownerState.mode }) }}
      />,
    );

    expect(screen.getByRole("button", { name: /Settings/ })).toHaveAttribute("data-mode", "compact");
  });
});
