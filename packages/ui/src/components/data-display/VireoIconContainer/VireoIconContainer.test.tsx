import { RgoIconContainer as CompatibilityRgoIconContainer } from "@/index";
import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoIconContainer } from "./VireoIconContainer";
import { vireoIconContainerClasses } from "./VireoIconContainer.classes";
import { VIREO_ICON_CONTAINER_NAME } from "./VireoIconContainer.identity";

describe(VIREO_ICON_CONTAINER_NAME, () => {
  it("keeps the deprecated package-root component alias compatible", () => {
    expect(CompatibilityRgoIconContainer).toBe(VireoIconContainer);
  });

  it("renders its essential default output with only required props", () => {
    const { container } = render(
      <svg>
        <VireoIconContainer viewBoxWidth={24} viewBoxHeight={24}>
          <path data-testid="geometry" />
        </VireoIconContainer>
      </svg>,
    );

    const root = container.querySelector("g");
    expect(root).toHaveAttribute("transform", "translate(0 0) scale(1)");
    expect(screen.getByTestId("geometry")).toBeInTheDocument();
  });

  it.each([
    { viewBoxWidth: 32, viewBoxHeight: 16, transform: "translate(0 6) scale(0.75)" },
    { viewBoxWidth: 16, viewBoxHeight: 32, transform: "translate(6 0) scale(0.75)" },
  ])(
    "preserves and centers the $viewBoxWidth by $viewBoxHeight source aspect ratio",
    ({ viewBoxWidth, viewBoxHeight, transform }) => {
      const { container } = render(
        <svg>
          <VireoIconContainer viewBoxWidth={viewBoxWidth} viewBoxHeight={viewBoxHeight}>
            <path />
          </VireoIconContainer>
        </svg>,
      );

      expect(container.querySelector("g")).toHaveAttribute("transform", transform);
    },
  );

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<SVGGElement>();
    const rootSlotRef = React.createRef<SVGGElement>();

    const { container } = render(
      <svg>
        <VireoIconContainer
          ref={forwardedRef}
          viewBoxWidth={24}
          viewBoxHeight={24}
          className="direct-class"
          style={{ opacity: 0.8 }}
          slotProps={{
            root: {
              ref: rootSlotRef,
              className: "slot-class",
              "data-origin": "slot",
              style: { color: "red" },
            },
          }}
        >
          <path />
        </VireoIconContainer>
      </svg>,
    );

    const root = container.querySelector("g");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).not.toBeNull();
    expect(root!).toHaveClass(vireoIconContainerClasses.root, "direct-class", "slot-class");
    expect(root!).toHaveAttribute("data-origin", "slot");
    expect(root!).toHaveStyle({ opacity: "0.8", color: "rgb(255, 0, 0)" });
  });

  it("provides normalized dimensions to root slot props", () => {
    const { container } = render(
      <svg>
        <VireoIconContainer
          viewBoxWidth={16}
          viewBoxHeight={12}
          slotProps={{
            root: ownerState => ({
              "aria-label": "Customized VireoIconContainer",
              "data-source": `${ownerState.viewBoxWidth}x${ownerState.viewBoxHeight}`,
            }),
          }}
        >
          <path />
        </VireoIconContainer>
      </svg>,
    );

    const root = container.querySelector("g");
    expect(root).toHaveAttribute("aria-label", "Customized VireoIconContainer");
    expect(root).toHaveAttribute("data-source", "16x12");
    expect(root).toHaveClass(vireoIconContainerClasses.root);
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_ICON_CONTAINER_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <svg>
          <VireoIconContainer viewBoxWidth={24} viewBoxHeight={24}>
            <path data-testid="themed-geometry" />
          </VireoIconContainer>
        </svg>
      </ThemeProvider>,
    );

    const root = screen.getByTestId("themed-geometry").parentElement;
    expect(root).toHaveClass("theme-default-class");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
