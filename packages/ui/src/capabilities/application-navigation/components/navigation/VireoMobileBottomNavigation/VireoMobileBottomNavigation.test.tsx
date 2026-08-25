import { HomeOutlined, Inventory2Outlined, SettingsOutlined } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoMobileBottomNavigation } from "./VireoMobileBottomNavigation";
import { vireoMobileBottomNavigationClasses } from "./VireoMobileBottomNavigation.classes";
import { VIREO_MOBILE_BOTTOM_NAVIGATION_NAME } from "./VireoMobileBottomNavigation.identity";

const items = [
  { value: "/", label: "Overview", icon: <HomeOutlined /> },
  { value: "/items", label: "Items", icon: <Inventory2Outlined /> },
  { value: "/settings", label: "Settings", icon: <SettingsOutlined />, disabled: true },
] as const;

describe(VIREO_MOBILE_BOTTOM_NAVIGATION_NAME, () => {
  it("renders labelled primary navigation and marks the selected destination", () => {
    render(<VireoMobileBottomNavigation items={items} value="/items" />);

    const root = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(root).toHaveClass(vireoMobileBottomNavigationClasses.root);
    expect(screen.getByRole("button", { name: "Items" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled();
  });

  it("reports opaque values without owning routing", () => {
    const onChange = vi.fn();
    render(<VireoMobileBottomNavigation items={items} value="/" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Items" }));

    expect(onChange).toHaveBeenCalledWith("/items", expect.anything());
  });

  it("renders no selected destination when the controlled value is unmatched", () => {
    render(<VireoMobileBottomNavigation items={items} value="/details/42" />);

    expect(screen.queryByRole("button", { current: "page" })).not.toBeInTheDocument();
  });

  it("allows the navigation slot to cancel the public change callback", () => {
    const onChange = vi.fn();
    render(
      <VireoMobileBottomNavigation
        items={items}
        value="/"
        onChange={onChange}
        slotProps={{ navigation: { onChange: event => event.preventDefault() } }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Items" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards the semantic root ref and composes slot classes", () => {
    const forwardedRef = React.createRef<HTMLElement>();
    const rootSlotRef = React.createRef<HTMLElement>();

    render(
      <VireoMobileBottomNavigation
        ref={forwardedRef}
        items={items}
        className="direct-class"
        classes={{ navigation: "navigation-class", action: "action-class" }}
        slotProps={{
          root: ownerState => ({
            ref: rootSlotRef,
            className: "slot-class",
            "data-item-count": ownerState.itemCount,
          }),
        }}
      />,
    );

    const root = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoMobileBottomNavigationClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-item-count", "3");
    expect(root.firstElementChild).toHaveClass(vireoMobileBottomNavigationClasses.navigation, "navigation-class");
    expect(screen.getByRole("button", { name: "Overview" })).toHaveClass(
      vireoMobileBottomNavigationClasses.action,
      "action-class",
    );
  });

  it("preserves navigation semantics with a replacement root and supports safe-area opt out", () => {
    render(
      <VireoMobileBottomNavigation
        items={items}
        safeAreaInset={false}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Quick destinations", "data-slot": "root" } }}
      />,
    );

    const root = screen.getByRole("navigation", { name: "Quick destinations" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-slot", "root");
    expect(root).toHaveStyle({ paddingBottom: "0px" });
  });

  it("uses theme default props and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_MOBILE_BOTTOM_NAVIGATION_NAME]: {
          defaultProps: { "aria-label": "Theme navigation" },
          styleOverrides: {
            navigation: { height: 72 },
            action: { color: "rgb(123, 45, 67)" },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoMobileBottomNavigation items={items} />
      </ThemeProvider>,
    );

    const root = screen.getByRole("navigation", { name: "Theme navigation" });
    expect(root.firstElementChild).toHaveStyle({ height: "72px" });
    expect(screen.getByRole("button", { name: "Overview" })).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
