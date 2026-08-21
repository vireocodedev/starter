import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { vireoFormAutocompleteMultipleFieldClasses } from "./VireoFormAutocompleteMultipleField.classes";
import { VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME } from "./VireoFormAutocompleteMultipleField.identity";
import type { VireoFormAutocompleteMultipleFieldProps } from "./VireoFormAutocompleteMultipleField.types";
const options = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "gamma", label: "Gamma" },
  { id: "retired", label: "Retired" },
];
type Option = (typeof options)[number];
function TestForm({
  initialValue = [],
  fieldProps = {},
  onSubmit = vi.fn(),
}: {
  initialValue?: string[];
  fieldProps?: Partial<VireoFormAutocompleteMultipleFieldProps<Option, string>>;
  onSubmit?: ReturnType<typeof vi.fn>;
}) {
  const form = useVireoForm({ defaultValues: { teams: initialValue }, onSubmit });
  const shared = fieldProps as Record<string, unknown>;
  return (
    <form.Form>
      <form.Field name="teams">
        {field => (
          <field.AutocompleteMultipleField
            label="Teams"
            options={options}
            getOptionValue={option => option.id}
            getOptionLabel={option => option.label}
            {...shared}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.Form>
  );
}
async function open() {
  await userEvent.click(screen.getByRole("button", { name: "Open options" }));
}
describe(VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, () => {
  it("stores ordered scalar arrays and submits them", async () => {
    const onSubmit = vi.fn();
    render(<TestForm initialValue={["alpha"]} onSubmit={onSubmit} />);
    await open();
    await userEvent.click(await screen.findByRole("option", { name: "Beta" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { teams: ["alpha", "beta"] } })),
    );
  });
  it("uses compact removable selections and a clickable overflow summary", async () => {
    render(<TestForm initialValue={["alpha", "beta", "gamma"]} />);
    expect(screen.getByText("+1")).toHaveAccessibleName("1 more selected options");
    await userEvent.click(screen.getByRole("button", { name: "1 more selected options" }));
    expect(await screen.findByRole("listbox", { name: "Teams" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close options" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.queryByRole("button", { name: "Remove Alpha" })).not.toBeInTheDocument();
  });
  it("hydrates fallbacks, preserves order, and labels unresolved values", () => {
    render(
      <TestForm
        initialValue={["missing", "alpha"]}
        fieldProps={{
          options: [options[1]],
          selectedOptions: [options[0]],
          getUnresolvedValueLabel: value => `Archived (${value})`,
        }}
      />,
    );
    expect(screen.getByText("Archived (missing)")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });
  it("enforces a maximum while keeping existing selections removable", async () => {
    render(<TestForm initialValue={["alpha", "beta"]} fieldProps={{ maxSelectedOptions: 2 }} />);
    await open();
    expect(await screen.findByRole("option", { name: "Gamma" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.queryByRole("button", { name: "Remove Alpha" })).not.toBeInTheDocument();
  });
  it("shows presentation-only option checkboxes and can hide them", async () => {
    const { rerender } = render(<TestForm />);
    await open();
    expect(document.querySelectorAll(".VireoFormAutocompleteMultipleField-optionCheckbox")).toHaveLength(
      options.length,
    );
    rerender(<TestForm fieldProps={{ hideOptionCheckbox: true }} />);
    expect(document.querySelectorAll(".VireoFormAutocompleteMultipleField-optionCheckbox")).toHaveLength(0);
  });
  it("does not remove the final value with Backspace unless opted in", async () => {
    const { rerender } = render(<TestForm initialValue={["alpha"]} />);
    const input = screen.getByRole("combobox", { name: "Teams" });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    rerender(<TestForm initialValue={["alpha"]} fieldProps={{ removeOnBackspace: true }} />);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Teams" }), { key: "Backspace" });
    await waitFor(() => expect(screen.queryByText("Alpha")).not.toBeInTheDocument());
  });
  it("exposes validation errors after the complete field interaction", async () => {
    function RequiredForm() {
      const form = useVireoForm({ defaultValues: { teams: [] as string[] }, onSubmit: () => undefined });
      return (
        <form.Form>
          <form.Field
            name="teams"
            validators={{ onBlur: ({ value }) => (value.length ? undefined : "Choose a team.") }}
          >
            {field => (
              <field.AutocompleteMultipleField
                label="Teams"
                options={options}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.label}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }
    render(<RequiredForm />);
    fireEvent.focus(screen.getByRole("combobox", { name: "Teams" }));
    fireEvent.blur(screen.getByRole("combobox", { name: "Teams" }));
    expect(await screen.findByText("Choose a team.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveAttribute("aria-invalid", "true");
  });
  it("forwards root slot refs, classes, and theme overrides", () => {
    const ref = React.createRef<HTMLDivElement>();
    const theme = createTheme({
      components: { [VIREO_FORM_AUTOCOMPLETE_MULTIPLE_FIELD_NAME]: { styleOverrides: { root: { paddingLeft: 9 } } } },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm fieldProps={{ slotProps: { root: { ref, "data-origin": "slot" } } }} />
      </ThemeProvider>,
    );
    expect(ref.current).toHaveClass(vireoFormAutocompleteMultipleFieldClasses.root);
    expect(ref.current).toHaveAttribute("data-origin", "slot");
    expect(ref.current).toHaveStyle({ paddingLeft: "9px" });
  });
});
