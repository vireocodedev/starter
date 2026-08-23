import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { vireoFormFreeSoloAutocompleteMultipleFieldClasses } from "./VireoFormFreeSoloAutocompleteMultipleField.classes";
import { VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME } from "./VireoFormFreeSoloAutocompleteMultipleField.identity";
import type { VireoFormFreeSoloAutocompleteMultipleFieldProps } from "./VireoFormFreeSoloAutocompleteMultipleField.types";

const options = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
];
type Option = (typeof options)[number];
function TestForm({
  initialValue = [],
  fieldProps = {},
  onSubmit = vi.fn(() => undefined),
}: {
  initialValue?: string[];
  fieldProps?: Partial<VireoFormFreeSoloAutocompleteMultipleFieldProps<Option>>;
  onSubmit?: Mock<() => void>;
}) {
  const form = useVireoForm({ defaultValues: { tags: initialValue }, onSubmit });
  const shared = fieldProps as Record<string, unknown>;
  return (
    <form.Form>
      <form.Field name="tags">
        {field => (
          <field.FreeSoloAutocompleteMultipleField
            label="Tags"
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
describe(VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME, () => {
  it("stores ordered known and custom string values", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm initialValue={["alpha"]} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Tags" }));
    await userEvent.click(await screen.findByRole("option", { name: "Beta" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Tags" }), "custom");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { tags: ["alpha", "beta", "custom"] } })),
    );
  });
  it("normalizes and rejects duplicate custom values", async () => {
    const onValueChange = vi.fn();
    render(
      <TestForm
        initialValue={["alpha"]}
        fieldProps={{ normalizeValue: value => value.trim().toLowerCase(), onValueChange }}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Tags" });
    await userEvent.type(input, " ALPHA ");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ reason: "createOption" }),
    );
  });
  it("uses compact removable selections and enforces the maximum", async () => {
    render(
      <TestForm
        initialValue={["alpha", "beta", "gamma"]}
        fieldProps={{ maxDisplayedOptions: 2, maxSelectedOptions: 3 }}
      />,
    );
    expect(screen.getByRole("button", { name: "1 more selected options" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.queryByRole("button", { name: "Remove Alpha" })).not.toBeInTheDocument();
  });
  it("commits custom text on blur", () => {
    const onValueChange = vi.fn();
    render(<TestForm fieldProps={{ onValueChange }} />);
    const input = screen.getByRole("combobox", { name: "Tags" });
    fireEvent.change(input, { target: { value: "Custom" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(["Custom"], { reason: "createOption", value: "Custom" });
  });
  it("exposes validation semantics", async () => {
    function RequiredForm() {
      const form = useVireoForm({ defaultValues: { tags: [] as string[] }, onSubmit: () => undefined });
      return (
        <form.Form>
          <form.Field name="tags" validators={{ onBlur: ({ value }) => (value.length ? undefined : "Add a tag.") }}>
            {field => (
              <field.FreeSoloAutocompleteMultipleField
                label="Tags"
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
    fireEvent.blur(screen.getByRole("combobox", { name: "Tags" }));
    expect(await screen.findByText("Add a tag.")).toBeInTheDocument();
  });
  it("forwards slots, utility classes, and theme overrides", () => {
    const ref = React.createRef<HTMLDivElement>();
    const theme = createTheme({
      components: {
        [VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME]: { styleOverrides: { root: { paddingLeft: 9 } } },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm fieldProps={{ slotProps: { root: { ref, "data-origin": "slot" } } }} />
      </ThemeProvider>,
    );
    expect(ref.current).toHaveClass(vireoFormFreeSoloAutocompleteMultipleFieldClasses.root);
    expect(ref.current).toHaveAttribute("data-origin", "slot");
    expect(ref.current).toHaveStyle({ paddingLeft: "9px" });
  });
});
