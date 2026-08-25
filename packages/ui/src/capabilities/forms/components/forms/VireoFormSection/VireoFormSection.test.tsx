import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoFormSection } from "./VireoFormSection";
import { vireoFormSectionClasses } from "./VireoFormSection.classes";
import { VIREO_FORM_SECTION_NAME } from "./VireoFormSection.identity";
describe(VIREO_FORM_SECTION_NAME, () => {
  it("renders a named section with its default heading and forwards its root ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <VireoFormSection ref={ref} label="Billing">
        <input aria-label="Tax ID" />
      </VireoFormSection>,
    );
    const section = screen.getByRole("region", { name: "Billing" });
    expect(ref.current?.tagName).toBe("SECTION");
    expect(screen.getByRole("heading", { level: 2, name: "Billing" })).toBeInTheDocument();
    expect(section).toContainElement(screen.getByRole("textbox", { name: "Tax ID" }));
    expect(section).toHaveAttribute("data-variant", "divided");
  });

  it("associates a description and honors the selected heading level", () => {
    render(
      <VireoFormSection label="Security" description="Recovery settings" headingLevel={3}>
        Content
      </VireoFormSection>,
    );
    const section = screen.getByRole("region", { name: "Security" });
    const description = screen.getByText("Recovery settings");
    expect(screen.getByRole("heading", { level: 3, name: "Security" })).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-describedby", description.id);
  });

  it("exposes normalized layout state to every slot", () => {
    render(
      <VireoFormSection
        label="Contract"
        layout="stack"
        maxColumns={3}
        variant="plain"
        slotProps={{
          layout: ownerState => ({ "data-layout": ownerState.layout, "data-columns": ownerState.maxColumns }),
        }}
      >
        Content
      </VireoFormSection>,
    );
    const layout = screen.getByText("Content");
    expect(layout).toHaveAttribute("data-layout", "stack");
    expect(layout).toHaveAttribute("data-columns", "3");
    expect(layout).toHaveClass(vireoFormSectionClasses.layout);
  });
  it("supports theme slot overrides", () => {
    const theme = createTheme({
      components: { [VIREO_FORM_SECTION_NAME]: { styleOverrides: { content: { padding: "12px" } } } },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoFormSection label="Billing">Content</VireoFormSection>
      </ThemeProvider>,
    );
    const section = screen.getByRole("region", { name: "Billing" });
    const content = section.querySelector(`.${vireoFormSectionClasses.content}`);
    expect(content).toHaveClass(vireoFormSectionClasses.content);
    expect(content).toHaveStyle({ padding: "12px" });
  });

  it("uses the Vireo base surface token for outlined sections", () => {
    render(
      <VireoFormSection label="Billing" variant="outlined">
        Content
      </VireoFormSection>,
    );

    const content = screen
      .getByRole("region", { name: "Billing" })
      .querySelector(`.${vireoFormSectionClasses.content}`);
    expect(content).toHaveStyle({ backgroundColor: "var(--mui-palette-surface-base, #fff)" });
  });

  it("marks adjacent default sections for divided presentation", () => {
    render(
      <>
        <VireoFormSection label="Customer">Customer content</VireoFormSection>
        <VireoFormSection label="Delivery">Delivery content</VireoFormSection>
      </>,
    );

    const customer = screen.getByRole("region", { name: "Customer" });
    const delivery = screen.getByRole("region", { name: "Delivery" });
    expect(customer).toHaveAttribute("data-variant", "divided");
    expect(delivery).toHaveAttribute("data-variant", "divided");
    expect(delivery).toHaveStyle({ borderTopWidth: "1px", paddingTop: "24px" });
  });
});
