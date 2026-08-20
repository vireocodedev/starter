import { VireoFormSectionItem } from "./VireoFormSectionItem";
import { vireoFormSectionItemClasses } from "./VireoFormSectionItem.classes";
import { VIREO_FORM_SECTION_ITEM_NAME } from "./VireoFormSectionItem.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe(VIREO_FORM_SECTION_ITEM_NAME, () => {
  it("renders its essential default output with only required props", () => {
    render(<VireoFormSectionItem>Section content</VireoFormSectionItem>);

    expect(screen.getByText("Section content")).toHaveClass(vireoFormSectionItemClasses.root);
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoFormSectionItem
        ref={forwardedRef}
        className="direct-class"
        style={{ paddingLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { paddingRight: 12 },
          },
        }}
      >
        Section content
      </VireoFormSectionItem>,
    );

    const root = screen.getByText("Section content");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFormSectionItemClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    render(
      <VireoFormSectionItem
        span="full"
        slots={{ root: "aside" }}
        slotProps={{ root: ownerState => ({ "aria-label": "Review guidance", "data-span": ownerState.span }) }}
      >
        Guidance
      </VireoFormSectionItem>,
    );

    const root = screen.getByRole("complementary", { name: "Review guidance" });
    expect(root).toHaveAttribute("data-span", "full");
    expect(root).toHaveClass(vireoFormSectionItemClasses.root);
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_SECTION_ITEM_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoFormSectionItem>Section content</VireoFormSectionItem>
      </ThemeProvider>,
    );

    expect(screen.getByText("Section content")).toHaveClass("theme-default-class");
    expect(screen.getByText("Section content")).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
