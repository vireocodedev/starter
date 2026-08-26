import { ThemeProvider, createTheme } from "@mui/material";
import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoSkeleton } from "./VireoSkeleton";
import { vireoSkeletonClasses } from "./VireoSkeleton.classes";
import { VIREO_SKELETON_NAME } from "./VireoSkeleton.identity";

describe(VIREO_SKELETON_NAME, () => {
  it("renders a silent text placeholder by default", () => {
    const { container } = render(<VireoSkeleton data-testid="skeleton" />);
    const root = container.firstElementChild;

    expect(root?.tagName).toBe("SPAN");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass(vireoSkeletonClasses.root, "MuiSkeleton-text");
    expect(root).not.toHaveClass("MuiSkeleton-pulse", "MuiSkeleton-wave");
  });

  it("preserves child geometry while keeping the leaf out of the accessibility tree", () => {
    const { container } = render(
      <VireoSkeleton>
        <span>Known title geometry</span>
      </VireoSkeleton>,
    );

    expect(container.firstElementChild).toHaveTextContent("Known title geometry");
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLSpanElement>();
    const rootSlotRef = React.createRef<HTMLSpanElement>();
    const { container } = render(
      <VireoSkeleton
        ref={forwardedRef}
        className="direct-class"
        style={{ marginLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { marginRight: 12 },
          },
        }}
      />,
    );

    const root = container.firstElementChild;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoSkeletonClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ marginLeft: "10px", marginRight: "12px" });
  });

  it("exposes normalized owner state to root slot props without allowing audible leaves", () => {
    const { container } = render(
      <VireoSkeleton
        variant="rounded"
        slots={{ root: "div" }}
        slotProps={{
          root: ownerState => ({
            "data-has-children": ownerState.hasChildren,
            "data-variant": ownerState.variant,
          }),
        }}
      >
        Geometry
      </VireoSkeleton>,
    );

    const root = container.firstElementChild;
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-has-children", "true");
    expect(root).toHaveAttribute("data-variant", "rounded");
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_SKELETON_NAME]: {
          defaultProps: { variant: "rounded", className: "theme-default-class" },
          styleOverrides: { root: { borderRadius: "11px" } },
        },
      },
    });
    const { container } = render(
      <ThemeProvider theme={theme}>
        <VireoSkeleton />
      </ThemeProvider>,
    );

    expect(container.firstElementChild).toHaveClass("theme-default-class", "MuiSkeleton-rounded");
    expect(container.firstElementChild).toHaveStyle({ borderRadius: "11px" });
  });
});
