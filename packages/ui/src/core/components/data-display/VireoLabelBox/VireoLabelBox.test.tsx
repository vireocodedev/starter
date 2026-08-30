import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoLabelBox } from "./VireoLabelBox";
import { vireoLabelBoxClasses } from "./VireoLabelBox.classes";
import { VIREO_LABEL_BOX_NAME } from "./VireoLabelBox.identity";

describe(VIREO_LABEL_BOX_NAME, () => {
  it("renders its content with only required props", () => {
    render(
      <VireoLabelBox>
        <input aria-label="Account name" />
      </VireoLabelBox>,
    );

    expect(screen.getByRole("textbox", { name: "Account name" })).toBeInTheDocument();
  });

  it("renders optional label anatomy and a decorative required indicator", () => {
    render(
      <VireoLabelBox label="Account" helperText="Used on invoices" required>
        <input aria-label="Account" />
      </VireoLabelBox>,
    );

    expect(screen.getByText("Account", { selector: `.${vireoLabelBoxClasses.label}` })).toBeInTheDocument();
    expect(screen.getByText("Used on invoices")).toHaveClass(vireoLabelBoxClasses.helperText);
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("associates its visible label with render-prop control content", () => {
    render(<VireoLabelBox label="Account name">{({ controlProps }) => <input {...controlProps} />}</VireoLabelBox>);

    const control = screen.getByRole("textbox", { name: "Account name" });
    const label = screen.getByText("Account name");

    expect(label).toHaveAttribute("id", control.getAttribute("aria-labelledby"));
    expect(control).not.toHaveAttribute("aria-describedby");
    expect(control).not.toHaveAttribute("aria-required");
  });

  it("describes and marks its associated control from helper and required anatomy", () => {
    render(
      <VireoLabelBox label="Billing contact" helperText="Used on invoices" required>
        {({ controlProps }) => <input {...controlProps} />}
      </VireoLabelBox>,
    );

    const control = screen.getByRole("textbox", { name: "Billing contact" });
    const helperText = screen.getByText("Used on invoices");

    expect(control).toHaveAccessibleDescription("Used on invoices");
    expect(helperText).toHaveAttribute("id", control.getAttribute("aria-describedby"));
    expect(control).toHaveAttribute("aria-required", "true");
  });

  it("keeps consumer slot IDs as the source of associated control relationships", () => {
    render(
      <VireoLabelBox
        label="Project"
        helperText="Choose one project"
        slotProps={{ label: { id: "project-label" }, helperText: { id: "project-description" } }}
      >
        {({ controlProps }) => <select {...controlProps} />}
      </VireoLabelBox>,
    );

    const control = screen.getByRole("combobox", { name: "Project" });
    expect(control).toHaveAttribute("aria-labelledby", "project-label");
    expect(control).toHaveAttribute("aria-describedby", "project-description");
    expect(control).toHaveAccessibleDescription("Choose one project");
  });

  it("forwards refs and merges inherited and root slot customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoLabelBox
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
        Content
      </VireoLabelBox>,
    );

    const root = screen.getByText("Content").parentElement;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoLabelBoxClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports replacement slots and owner-state slot props", () => {
    render(
      <VireoLabelBox
        label="Priority"
        helperText="Optional"
        direction="row"
        slots={{ root: "section", label: "strong", helperText: "small", content: "main" }}
        slotProps={{
          root: { "aria-label": "Priority field" },
          label: ownerState => ({ "data-direction": ownerState.direction }),
        }}
      >
        Field content
      </VireoLabelBox>,
    );

    const root = screen.getByRole("region", { name: "Priority field" });
    expect(root).toHaveClass(vireoLabelBoxClasses.root);
    expect(screen.getByText("Priority").tagName).toBe("STRONG");
    expect(screen.getByText("Priority")).toHaveAttribute("data-direction", "row");
    expect(screen.getByText("Optional").tagName).toBe("SMALL");
    expect(screen.getByRole("main")).toHaveClass(vireoLabelBoxClasses.content);
  });

  it("uses theme default props and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_LABEL_BOX_NAME]: {
          defaultProps: { label: "Theme label" },
          styleOverrides: {
            root: { backgroundColor: "rgb(10, 20, 30)" },
            label: { color: "rgb(123, 45, 67)" },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoLabelBox>Content</VireoLabelBox>
      </ThemeProvider>,
    );

    expect(screen.getByText("Content").parentElement).toHaveStyle({
      backgroundColor: "rgb(10, 20, 30)",
    });
    expect(screen.getByText("Theme label")).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });

  it("derives label anatomy typography and spacing from the consumer theme", () => {
    const theme = createTheme({
      spacing: 10,
      typography: {
        subtitle2: { fontSize: "15px", fontWeight: 530, lineHeight: 1.7 },
        caption: { fontSize: "11px", fontWeight: 420, lineHeight: 1.5 },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoLabelBox label="Project" helperText="Optional">
          Content
        </VireoLabelBox>
      </ThemeProvider>,
    );

    const label = screen.getByText("Project");
    const root = label.closest(`.${vireoLabelBoxClasses.root}`);
    const header = label.closest(`.${vireoLabelBoxClasses.header}`);

    expect(root).toHaveStyle({ gap: "10px" });
    expect(header).toHaveStyle({ fontSize: "15px", fontWeight: "530", gap: "20px", lineHeight: "1.7" });
    expect(screen.getByText("Optional")).toHaveStyle({
      fontSize: "11px",
      fontWeight: "420",
      lineHeight: "1.5",
    });
  });
});
