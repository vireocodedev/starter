import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoFormSection } from "./VireoFormSection";
import { vireoFormSectionClasses } from "./VireoFormSection.classes";
import { VIREO_FORM_SECTION_NAME } from "./VireoFormSection.identity";
describe(VIREO_FORM_SECTION_NAME, () => {
  it("associates labelled content and forwards its section ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <VireoFormSection ref={ref} label="Billing">
        <input aria-label="Tax ID" />
      </VireoFormSection>,
    );
    const group = screen.getByRole("group", { name: "Billing" });
    expect(ref.current?.tagName).toBe("SECTION");
    expect(group).toContainElement(screen.getByRole("textbox", { name: "Tax ID" }));
  });
  it("omits blank labels", () => {
    render(<VireoFormSection label="   ">Content</VireoFormSection>);
    expect(screen.queryByText(/^\s+$/)).not.toBeInTheDocument();
    expect(screen.getByRole("group")).not.toHaveAttribute("aria-labelledby");
  });
  it("supports theme slot overrides", () => {
    const theme = createTheme({
      components: { [VIREO_FORM_SECTION_NAME]: { styleOverrides: { content: { padding: "12px" } } } },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoFormSection>Content</VireoFormSection>
      </ThemeProvider>,
    );
    expect(screen.getByRole("group")).toHaveClass(vireoFormSectionClasses.content);
    expect(screen.getByRole("group")).toHaveStyle({ padding: "12px" });
  });
});
