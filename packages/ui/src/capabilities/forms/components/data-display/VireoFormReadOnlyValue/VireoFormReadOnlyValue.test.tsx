import { VireoFormReadOnlyValue } from "./VireoFormReadOnlyValue";
import { vireoFormReadOnlyValueClasses } from "./VireoFormReadOnlyValue.classes";
import { VIREO_FORM_READ_ONLY_VALUE_NAME } from "./VireoFormReadOnlyValue.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe(VIREO_FORM_READ_ONLY_VALUE_NAME, () => {
  it("renders its essential default output with only required props", () => {
    render(<VireoFormReadOnlyValue>Account owner</VireoFormReadOnlyValue>);

    expect(screen.getByText("Account owner").tagName).toBe("P");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoFormReadOnlyValue
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
        Account owner
      </VireoFormReadOnlyValue>,
    );

    const root = screen.getByText("Account owner").parentElement!;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFormReadOnlyValueClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    render(
      <VireoFormReadOnlyValue
        slots={{ root: "section" }}
        slotProps={{ root: () => ({ "aria-label": "Customized VireoFormReadOnlyValue", "data-slot": "root" }) }}
      />,
    );

    const root = screen.getByRole("region", { name: "Customized VireoFormReadOnlyValue" });
    expect(root).toHaveAttribute("data-slot", "root");
    expect(root).toHaveClass(vireoFormReadOnlyValueClasses.root);
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_READ_ONLY_VALUE_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoFormReadOnlyValue>Account owner</VireoFormReadOnlyValue>
      </ThemeProvider>,
    );

    const root = screen.getByText("Account owner").parentElement!;
    expect(root).toHaveClass("theme-default-class");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });

  it("renders a label and a distinguishable empty fallback", () => {
    render(<VireoFormReadOnlyValue empty label="Phone" emptyValue="No phone number" />);

    expect(screen.getByText("Phone")).toHaveClass(vireoFormReadOnlyValueClasses.label);
    expect(screen.getByText("No phone number")).toHaveClass(vireoFormReadOnlyValueClasses.value);
    expect(screen.getByText("No phone number").parentElement).toHaveClass(vireoFormReadOnlyValueClasses.empty);
  });
});
