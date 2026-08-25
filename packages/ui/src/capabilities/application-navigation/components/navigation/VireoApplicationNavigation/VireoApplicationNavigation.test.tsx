import { VireoApplicationNavigationItem } from "@/capabilities/application-navigation/components/navigation/VireoApplicationNavigationItem";
import { VireoApplicationNavigation } from "./VireoApplicationNavigation";
import { vireoApplicationNavigationClasses } from "./VireoApplicationNavigation.classes";
import { VIREO_APPLICATION_NAVIGATION_NAME } from "./VireoApplicationNavigation.identity";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe(VIREO_APPLICATION_NAVIGATION_NAME, () => {
  it("renders expanded application navigation with its configured width", () => {
    const { container } = render(
      <VireoApplicationNavigation expandedWidth={312} resizable={false}>
        <VireoApplicationNavigationItem icon={<span>icon</span>} label="Overview" />
      </VireoApplicationNavigation>,
    );

    expect(screen.getByText("Overview")).toBeVisible();
    expect(container.firstElementChild).toHaveStyle({ width: "312px" });
  });

  it("caps temporary navigation at the viewport without stretching wider layouts", () => {
    render(
      <VireoApplicationNavigation variant="temporary" open expandedWidth={480} resizable={false}>
        Navigation
      </VireoApplicationNavigation>,
    );

    const content = screen.getByText("Navigation");
    const paper = content.parentElement;
    expect(paper).toHaveClass("MuiDrawer-paper");
    const paperRule = Array.from(document.styleSheets)
      .flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText))
      .find(
        rule =>
          rule.includes("VireoApplicationNavigation-surface .MuiDrawer-paper") && rule.includes("max-width: 100vw"),
      );
    expect(paperRule).toContain("width: 480px");
    expect(paperRule).toContain("max-width: 100vw");
  });

  it("provides compact mode to navigation items", () => {
    render(
      <VireoApplicationNavigation mode="compact" resizable={false}>
        <VireoApplicationNavigationItem icon={<span>icon</span>} label="Application settings" compactLabel="Settings" />
      </VireoApplicationNavigation>,
    );

    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.queryByText("Application settings")).not.toBeInTheDocument();
  });

  it("preserves the current compact mode when navigation is locked", () => {
    render(
      <VireoApplicationNavigation mode="compact" locked resizable={false}>
        {({ mode }) => <span>{mode}</span>}
      </VireoApplicationNavigation>,
    );

    expect(screen.getByText("compact")).toBeVisible();
  });

  it("prevents mode toggles and pointer resizing while navigation is locked", () => {
    const onModeChange = vi.fn();
    const onExpandedWidthChange = vi.fn();
    const { container } = render(
      <VireoApplicationNavigation
        expandedWidth={280}
        locked
        onModeChange={onModeChange}
        onExpandedWidthChange={onExpandedWidthChange}
      >
        {({ toggleMode }) => <button onClick={toggleMode}>Toggle</button>}
      </VireoApplicationNavigation>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    const handle = container.querySelector(`.${vireoApplicationNavigationClasses.resizeHandle}`);

    expect(handle).not.toBeInTheDocument();
    expect(onModeChange).not.toHaveBeenCalled();
    expect(onExpandedWidthChange).not.toHaveBeenCalled();
  });

  it("exposes an explicit mode toggle to render-function children", () => {
    const onModeChange = vi.fn();
    render(
      <VireoApplicationNavigation mode="expanded" onModeChange={onModeChange} resizable={false}>
        {({ toggleMode }) => <button onClick={toggleMode}>Toggle</button>}
      </VireoApplicationNavigation>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(onModeChange).toHaveBeenCalledWith("compact");
  });

  it("snaps inward resizing to compact mode", () => {
    const onModeChange = vi.fn();
    const { container } = render(
      <VireoApplicationNavigation expandedWidth={280} onModeChange={onModeChange}>
        Navigation
      </VireoApplicationNavigation>,
    );
    const handle = container.querySelector(`.${vireoApplicationNavigationClasses.resizeHandle}`);
    expect(handle).not.toBeNull();

    fireEvent.mouseDown(handle!, { clientX: 280 });
    fireEvent.mouseMove(window, { clientX: 219 });
    fireEvent.mouseUp(window);

    expect(onModeChange).toHaveBeenCalledWith("compact");
  });

  it("continuously resizes from the compact width after crossing the expansion threshold", () => {
    const onModeChange = vi.fn();
    const onExpandedWidthChange = vi.fn();
    const { container } = render(
      <VireoApplicationNavigation
        mode="compact"
        expandedWidth={320}
        onModeChange={onModeChange}
        onExpandedWidthChange={onExpandedWidthChange}
      >
        Navigation
      </VireoApplicationNavigation>,
    );
    const handle = container.querySelector(`.${vireoApplicationNavigationClasses.resizeHandle}`);

    fireEvent.mouseDown(handle!, { clientX: 80 });
    fireEvent.mouseMove(window, { clientX: 230 });
    expect(container.firstElementChild).toHaveStyle({ width: "230px" });

    fireEvent.mouseMove(window, { clientX: 260 });
    expect(container.firstElementChild).toHaveStyle({ width: "260px" });

    fireEvent.mouseUp(window);

    expect(onModeChange).toHaveBeenCalledWith("expanded");
    expect(onExpandedWidthChange).toHaveBeenCalledWith(260);
  });

  it("resets expanded width on resize-handle double click", () => {
    const onExpandedWidthChange = vi.fn();
    const { container } = render(
      <VireoApplicationNavigation expandedWidth={340} onExpandedWidthChange={onExpandedWidthChange}>
        Navigation
      </VireoApplicationNavigation>,
    );
    const handle = container.querySelector(`.${vireoApplicationNavigationClasses.resizeHandle}`);

    fireEvent.doubleClick(handle!);
    expect(onExpandedWidthChange).toHaveBeenCalledWith(264);
  });

  it("merges root slot props and forwards its ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoApplicationNavigation
        ref={ref}
        resizable={false}
        slots={{ root: "aside" }}
        slotProps={{ root: { "aria-label": "Primary navigation", "data-origin": "slot" } }}
      >
        Navigation
      </VireoApplicationNavigation>,
    );

    const root = screen.getByRole("complementary", { name: "Primary navigation" });
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveClass(vireoApplicationNavigationClasses.root);
  });
});
