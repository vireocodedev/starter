import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { vireoFormFreeSoloAutocompleteFieldClasses } from "./VireoFormFreeSoloAutocompleteField.classes";
import { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteField.identity";
import type { VireoFormFreeSoloAutocompleteFieldProps } from "./VireoFormFreeSoloAutocompleteField.types";

const options = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
];
type Option = (typeof options)[number];
function TestForm({
  initialValue = null,
  fieldProps = {},
  onSubmit = vi.fn(() => undefined),
}: {
  initialValue?: string | null;
  fieldProps?: Partial<VireoFormFreeSoloAutocompleteFieldProps<Option>>;
  onSubmit?: Mock<() => void>;
}) {
  const form = useVireoForm({ defaultValues: { tag: initialValue }, onSubmit });
  const shared = fieldProps as Record<string, unknown>;
  return (
    <form.Form>
      <form.Field name="tag">
        {field => (
          <field.FreeSoloAutocompleteField
            label="Tag"
            options={options}
            getOptionValue={option => option.value}
            getOptionLabel={option => option.label}
            {...shared}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.Form>
  );
}
describe(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME, () => {
  it("preserves MUI input and popup presentation", async () => {
    render(<TestForm />);
    await userEvent.click(screen.getByRole("combobox", { name: "Tag" }));
    expect(await screen.findByRole("listbox", { name: "Tag" })).toHaveClass(
      vireoFormFreeSoloAutocompleteFieldClasses.listbox,
    );
    expect(window.getComputedStyle(screen.getByRole("option", { name: "Alpha" })).display).toBe("flex");
  });
  it("selects a known option and submits its string value", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Tag" }));
    await userEvent.click(await screen.findByRole("option", { name: "Beta" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { tag: "beta" } })));
  });
  it("creates and normalizes a custom value with Enter", async () => {
    const onValueChange = vi.fn();
    render(<TestForm fieldProps={{ normalizeValue: value => value.trim().toLowerCase(), onValueChange }} />);
    const input = screen.getByRole("combobox", { name: "Tag" });
    await userEvent.type(input, "  Custom Tag  ");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("custom tag", { reason: "createOption", value: "custom tag" });
  });
  it("commits non-empty custom text on blur by default", () => {
    const onValueChange = vi.fn();
    render(<TestForm fieldProps={{ onValueChange }} />);
    const input = screen.getByRole("combobox", { name: "Tag" });
    fireEvent.change(input, { target: { value: "Custom" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith("Custom", { reason: "createOption", value: "Custom" });
  });
  it("exposes validation semantics after blur", async () => {
    function RequiredForm() {
      const form = useVireoForm({ defaultValues: { tag: null as string | null }, onSubmit: () => undefined });
      return (
        <form.Form>
          <form.Field name="tag" validators={{ onBlur: ({ value }) => (value ? undefined : "Enter a tag.") }}>
            {field => (
              <field.FreeSoloAutocompleteField
                label="Tag"
                options={[]}
                getOptionValue={(value: string) => value}
                getOptionLabel={value => value}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }
    render(<RequiredForm />);
    fireEvent.blur(screen.getByRole("combobox", { name: "Tag" }));
    expect(await screen.findByText("Enter a tag.")).toBeInTheDocument();
  });
  it("forwards slot refs, utility classes, and theme overrides", () => {
    const ref = React.createRef<HTMLDivElement>();
    const theme = createTheme({
      components: { [VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME]: { styleOverrides: { root: { paddingLeft: 11 } } } },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm fieldProps={{ slotProps: { root: { ref, "data-origin": "slot" } } }} />
      </ThemeProvider>,
    );
    expect(ref.current).toHaveClass(vireoFormFreeSoloAutocompleteFieldClasses.root);
    expect(ref.current).toHaveAttribute("data-origin", "slot");
    expect(ref.current).toHaveStyle({ paddingLeft: "11px" });
  });
});
