import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { vireoFormErrorSummaryClasses } from "./VireoFormErrorSummary.classes";
import { VIREO_FORM_ERROR_SUMMARY_NAME } from "./VireoFormErrorSummary.identity";

function FormHarness() {
  const form = useVireoForm({ defaultValues: { name: "" }, onSubmit: () => undefined });
  return (
    <form.Form>
      <form.ErrorSummary scope="all" />
      <form.Field name="name" validators={{ onSubmit: z.string().min(1, "Enter a name.") }}>
        {field => <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />}
      </form.Field>
      <form.SubmitButton>Save</form.SubmitButton>
    </form.Form>
  );
}

function MultiHarness() {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "", email: "" },
    initialStepId: "contact",
    onSubmit: () => undefined,
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "contact", label: "Contact", fields: ["email"] },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep keepMounted>
        <form.ErrorSummary scope="all" />
        <form.Step id="profile">
          <form.Field name="name" validators={{ onSubmit: z.string().min(1, "Enter a name.") }}>
            {field => <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />}
          </form.Field>
        </form.Step>
        <form.Step id="contact">
          <form.Field name="email" validators={{ onSubmit: z.string().email("Enter an email.") }}>
            {field => <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />}
          </form.Field>
        </form.Step>
        <form.SubmitButton>Save</form.SubmitButton>
      </form.MultiStep>
    </form.Form>
  );
}

describe(VIREO_FORM_ERROR_SUMMARY_NAME, () => {
  it("stays absent until errors exist, then links to the invalid field", async () => {
    render(<FormHarness />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    const link = await screen.findByRole("button", { name: "Go to error: Enter a name." });
    expect(screen.getByRole("alert")).toHaveClass(vireoFormErrorSummaryClasses.root);
    fireEvent.click(link);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus());
  });

  it("groups mapped errors by step and navigates to an inactive step", async () => {
    render(<MultiHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    const profileError = await screen.findByRole("button", { name: "Go to error: Enter a name." });
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    fireEvent.click(profileError);
    await screen.findByRole("textbox", { name: "Name" });
  });

  it("supports root slot props and theme style overrides", async () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_ERROR_SUMMARY_NAME]: {
          defaultProps: { slotProps: { root: { "data-origin": "theme" } } },
          styleOverrides: { title: { fontStyle: "italic" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <FormHarness />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveAttribute("data-origin", "theme");
    expect(screen.getByRole("heading", { name: "1 error needs attention" })).toHaveStyle({ fontStyle: "italic" });
  });
});
