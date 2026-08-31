import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { vireoFormAutocompleteFieldClasses } from "./VireoFormAutocompleteField.classes";
import { VIREO_FORM_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormAutocompleteField.identity";
import type { VireoFormAutocompleteFieldProps } from "./VireoFormAutocompleteField.types";

const options = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "retired", label: "Retired" },
];
type Option = (typeof options)[number];
function TestForm({
  initialValue = null,
  fieldProps = {},
  onSubmit = vi.fn(() => undefined),
}: {
  initialValue?: string | null;
  fieldProps?: Partial<VireoFormAutocompleteFieldProps<Option, string>>;
  onSubmit?: Mock<() => void>;
}) {
  const form = useVireoForm({ defaultValues: { teamId: initialValue }, onSubmit });
  const sharedFieldProps = fieldProps as Record<string, unknown>;
  return (
    <form.Form data-testid="form">
      <form.Field name="teamId">
        {field => (
          <field.AutocompleteField
            label="Team"
            options={options}
            getOptionValue={option => option.id}
            getOptionLabel={option => option.label}
            {...sharedFieldProps}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.Form>
  );
}
async function choose(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Team" }));
  await user.click(await screen.findByRole("option", { name }));
}

describe(VIREO_FORM_AUTOCOMPLETE_FIELD_NAME, () => {
  it("names its loading progressbar by default and preserves a consumer label", () => {
    const { rerender } = render(<TestForm fieldProps={{ loading: true }} />);
    expect(screen.getByRole("progressbar", { name: "Loading options" })).toBeInTheDocument();

    rerender(
      <TestForm
        fieldProps={{ loading: true, slotProps: { loadingIndicator: { "aria-label": "Customer results loading" } } }}
      />,
    );
    expect(screen.getByRole("progressbar", { name: "Customer results loading" })).toBeInTheDocument();
  });

  it("preserves MUI input resets and listbox presentation", async () => {
    render(<TestForm />);
    const input = screen.getByRole("combobox", { name: "Team" });

    await userEvent.click(input);
    const listbox = await screen.findByRole("listbox", { name: "Team" });
    expect(listbox).toHaveClass(vireoFormAutocompleteFieldClasses.listbox);
    expect(window.getComputedStyle(screen.getByRole("option", { name: "Alpha" })).display).toBe("flex");
  });

  it("binds and submits a scalar option value", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm onSubmit={onSubmit} />);
    await choose("Beta");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { teamId: "beta" } })));
  });

  it("hydrates a selected option outside the current result list and prefers a fresh result", () => {
    const fallback = { id: "alpha", label: "Fallback Alpha" };
    const { rerender } = render(
      <TestForm initialValue="alpha" fieldProps={{ options: [options[1]], selectedOption: fallback }} />,
    );
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveValue("Fallback Alpha");
    rerender(<TestForm initialValue="alpha" fieldProps={{ options, selectedOption: fallback }} />);
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveValue("Alpha");
  });

  it("shows unresolved scalar values without adding them to the popup", async () => {
    render(
      <TestForm initialValue="missing" fieldProps={{ getUnresolvedValueLabel: value => `Archived (${value})` }} />,
    );
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveValue("Archived (missing)");
    await userEvent.click(screen.getByRole("button", { name: "Open options" }));
    expect(screen.queryByRole("option", { name: "Archived (missing)" })).not.toBeInTheDocument();
  });

  it("filters on the client and preserves server-provided results", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TestForm />);
    const input = screen.getByRole("combobox", { name: "Team" });
    await user.type(input, "bet");
    expect(await screen.findByRole("option", { name: "Beta" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Alpha" })).not.toBeInTheDocument();
    rerender(<TestForm fieldProps={{ filterMode: "server" }} />);
    await user.clear(screen.getByRole("combobox", { name: "Team" }));
    await user.type(screen.getByRole("combobox", { name: "Team" }), "nothing");
    expect(await screen.findByRole("option", { name: "Alpha" })).toBeInTheDocument();
  });

  it("honors disabled options, read-only state, and clear accessibility", async () => {
    const onValueChange = vi.fn();
    render(
      <TestForm
        initialValue="alpha"
        fieldProps={{ getOptionDisabled: option => option.id === "retired", clearLabel: "Clear team", onValueChange }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open options" }));
    expect(await screen.findByRole("option", { name: "Retired" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: "Close options" }));
    await userEvent.click(screen.getByLabelText("Clear team"));
    expect(onValueChange).toHaveBeenCalledWith(null, { reason: "clear", previousValue: "alpha" });
  });

  it("marks the field touched on blur and exposes validation semantics", async () => {
    function ValidationForm() {
      const form = useVireoForm({ defaultValues: { teamId: null as string | null }, onSubmit: () => undefined });
      return (
        <form.Form>
          <form.Field name="teamId" validators={{ onBlur: ({ value }) => (value ? undefined : "Choose a team.") }}>
            {field => (
              <field.AutocompleteField
                label="Team"
                options={options}
                getOptionValue={option => option.id}
                getOptionLabel={option => option.label}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }
    render(<ValidationForm />);
    fireEvent.focus(screen.getByRole("combobox", { name: "Team" }));
    fireEvent.blur(screen.getByRole("combobox", { name: "Team" }));
    expect(await screen.findByText("Choose a team.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards refs, classes, slot props, and theme overrides", () => {
    const ref = React.createRef<HTMLDivElement>();
    const theme = createTheme({
      components: { [VIREO_FORM_AUTOCOMPLETE_FIELD_NAME]: { styleOverrides: { root: { paddingLeft: 11 } } } },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm fieldProps={{ slotProps: { root: { ref, "data-origin": "slot" } } }} />
      </ThemeProvider>,
    );
    expect(ref.current).toHaveClass(vireoFormAutocompleteFieldClasses.root);
    expect(ref.current).toHaveAttribute("data-origin", "slot");
    expect(ref.current).toHaveStyle({ paddingLeft: "11px" });
  });

  it("ignores duplicate option values deterministically", async () => {
    const duplicate = [
      { id: "alpha", label: "First" },
      { id: "alpha", label: "Second" },
    ];
    render(<TestForm fieldProps={{ options: duplicate }} />);
    await userEvent.click(screen.getByRole("button", { name: "Open options" }));
    expect(await screen.findByRole("option", { name: "First" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Second" })).not.toBeInTheDocument();
  });
});
