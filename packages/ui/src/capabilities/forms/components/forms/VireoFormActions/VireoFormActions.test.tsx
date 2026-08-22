import { VireoFormActions } from "./VireoFormActions";
import { vireoFormActionsClasses } from "./VireoFormActions.classes";
import { VIREO_FORM_ACTIONS_NAME } from "./VireoFormActions.identity";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe(VIREO_FORM_ACTIONS_NAME, () => {
  it("renders its essential default output with only required props", () => {
    render(
      <VireoFormActions>
        <Button>Reset</Button>
        <Button>Save</Button>
      </VireoFormActions>,
    );

    const reset = screen.getByRole("button", { name: "Reset" });
    const save = screen.getByRole("button", { name: "Save" });
    expect(reset.parentElement).toBe(save.parentElement);
    expect(reset.parentElement).toHaveClass(vireoFormActionsClasses.layout);
    expect(reset.parentElement?.parentElement).toHaveClass(vireoFormActionsClasses.root);
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoFormActions
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
        Actions
      </VireoFormActions>,
    );

    const root = screen.getByText("Actions").parentElement as HTMLElement;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFormActionsClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    render(
      <VireoFormActions
        slots={{ layout: "nav" }}
        slotProps={{ layout: () => ({ "aria-label": "Customer actions", "data-slot": "layout" }) }}
      >
        <Button>Save</Button>
      </VireoFormActions>,
    );

    const layout = screen.getByRole("navigation", { name: "Customer actions" });
    expect(layout).toHaveAttribute("data-slot", "layout");
    expect(layout).toHaveClass(vireoFormActionsClasses.layout);
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_ACTIONS_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { layout: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoFormActions>Actions</VireoFormActions>
      </ThemeProvider>,
    );

    const layout = screen.getByText("Actions");
    expect(layout.parentElement).toHaveClass("theme-default-class");
    expect(layout).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
