import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoStatusDot } from "./VireoStatusDot";
import { vireoStatusDotClasses } from "./VireoStatusDot.classes";
import { VIREO_STATUS_DOT_NAME } from "./VireoStatusDot.identity";

describe(VIREO_STATUS_DOT_NAME, () => {
  it("renders the minimal decorative status marker", () => {
    const { container } = render(<VireoStatusDot color="success" />);

    const root = container.firstElementChild;
    expect(root).toHaveClass(vireoStatusDotClasses.root);
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).not.toHaveAttribute("role");
    expect(root?.tagName).toBe("SPAN");
  });

  it("exposes a labelled standalone marker to assistive technology", () => {
    render(<VireoStatusDot color="warning" label="Needs review" />);

    expect(screen.getByRole("img", { name: "Needs review" })).toBeInTheDocument();
  });

  it("publishes selected owner state to classes and slot props", () => {
    render(
      <VireoStatusDot
        color="info"
        selected
        label="Selected status"
        slotProps={{ root: ({ selected }) => ({ "data-selected": selected }) }}
      />,
    );

    const root = screen.getByRole("img", { name: "Selected status" });
    expect(root).toHaveClass(vireoStatusDotClasses.selected);
    expect(root).toHaveAttribute("data-selected", "true");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLSpanElement>();
    const rootSlotRef = React.createRef<HTMLSpanElement>();
    const { container } = render(
      <VireoStatusDot
        color="error"
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
    expect(root).toHaveClass(vireoStatusDotClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ marginLeft: "10px", marginRight: "12px" });
  });

  it("supports a replacement root", () => {
    render(
      <VireoStatusDot
        color="standard"
        label="Customized status"
        slots={{ root: "i" }}
        slotProps={{ root: { "data-slot": "root" } }}
      />,
    );

    const root = screen.getByRole("img", { name: "Customized status" });
    expect(root.tagName).toBe("I");
    expect(root).toHaveAttribute("data-slot", "root");
  });

  it("uses theme defaults and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_STATUS_DOT_NAME]: {
          defaultProps: { color: "success", size: 14 },
          styleOverrides: {
            root: { outline: "1px solid rgb(123, 45, 67)" },
            selected: { outlineWidth: 3 },
          },
        },
      },
    });

    const { container } = render(
      <ThemeProvider theme={theme}>
        <VireoStatusDot color="success" selected />
      </ThemeProvider>,
    );

    expect(container.firstElementChild).toHaveClass(vireoStatusDotClasses.selected);
    expect(container.firstElementChild).toHaveStyle({ height: "14px", outlineWidth: "3px", width: "14px" });
  });
});
