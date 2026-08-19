import { VireoIconRegistryProvider } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import { SvgIcon, type SvgIconProps, ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoIcon } from "./VireoIcon";
import { vireoIconClasses } from "./VireoIcon.classes";
import { VIREO_ICON_NAME } from "./VireoIcon.identity";

function renderIcon(icon: React.ReactElement) {
  return render(<VireoIconRegistryProvider>{icon}</VireoIconRegistryProvider>);
}

describe(VIREO_ICON_NAME, () => {
  it("renders registered icon geometry with its accessible title", () => {
    renderIcon(<VireoIcon icon="check-circle" titleAccess="Completed" />);

    expect(screen.getByRole("img", { name: "Completed" })).toHaveAttribute("stroke", "currentColor");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<SVGSVGElement>();
    const rootSlotRef = React.createRef<SVGSVGElement>();

    renderIcon(
      <VireoIcon
        ref={forwardedRef}
        icon="check-circle"
        titleAccess="Completed"
        className="direct-class"
        slotProps={{ root: { ref: rootSlotRef, className: "slot-class", "data-origin": "slot" } }}
      />,
    );

    const root = screen.getByRole("img", { name: "Completed" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoIconClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
  });

  it("supports a replacement icon slot and owner-state slot props", () => {
    const StarIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(function StarIcon(props, ref) {
      return (
        <SvgIcon {...props} ref={ref}>
          <path d="M12 2l3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8z" />
        </SvgIcon>
      );
    });

    renderIcon(
      <VireoIcon
        icon="check-circle"
        titleAccess="Favorite"
        slots={{ root: StarIcon }}
        slotProps={{ root: ownerState => ({ "data-icon-name": ownerState.icon }) }}
      />,
    );

    expect(screen.getByRole("img", { name: "Favorite" })).toHaveAttribute("data-icon-name", "check-circle");
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_ICON_NAME]: {
          defaultProps: { width: 32 },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoIconRegistryProvider>
          <VireoIcon icon="check-circle" titleAccess="Completed" />
        </VireoIconRegistryProvider>
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Completed" })).toHaveAttribute("width", "32");
    expect(screen.getByRole("img", { name: "Completed" })).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });

  it("reports a missing provider clearly", () => {
    expect(() => render(<VireoIcon icon="check-circle" />)).toThrow(
      "useVireoIcons must be used within VireoIconRegistryProvider",
    );
  });
});
