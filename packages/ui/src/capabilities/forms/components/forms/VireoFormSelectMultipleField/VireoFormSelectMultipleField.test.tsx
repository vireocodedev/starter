import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { Button, FormControl, ThemeProvider, createTheme, type FormControlProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { vireoFormSelectMultipleFieldClasses } from "./VireoFormSelectMultipleField.classes";
import { VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME } from "./VireoFormSelectMultipleField.identity";
import type { VireoFormSelectMultipleFieldProps } from "./VireoFormSelectMultipleField.types";

const options = [
  { id: "platform", label: "Platform" },
  { id: "product", label: "Product" },
  { id: "support", label: "Customer support" },
  { id: "retired", label: "Retired" },
] as const;

type Option = (typeof options)[number];

type TestFormProps = {
  fieldProps?: Partial<VireoFormSelectMultipleFieldProps<Option, string>>;
  initialValue?: string[];
  onSubmit?: ReturnType<typeof vi.fn>;
  validate?: (value: string[]) => unknown;
};

function TestForm({ fieldProps, initialValue = [], onSubmit = vi.fn(), validate }: TestFormProps) {
  const form = useVireoForm({ defaultValues: { teamIds: initialValue }, onSubmit });

  return (
    <form.Form data-testid="form">
      <form.Field name="teamIds" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.SelectMultipleField
            label="Teams"
            placeholder="Choose teams"
            options={options}
            getOptionValue={option => option.id}
            renderOption={option => option.label}
            {...fieldProps}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <Button type="reset">Reset</Button>
    </form.Form>
  );
}

async function openOptions(): Promise<void> {
  await userEvent.setup().click(screen.getByRole("combobox", { name: "Teams" }));
}

describe(VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME, () => {
  it("binds an empty array and defaults to a full-width labelled multiple select", () => {
    render(<TestForm />);

    const select = screen.getByRole("combobox", { name: "Teams" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(select).toHaveTextContent("Choose teams");
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormSelectMultipleFieldClasses.root);
    expect(root?.querySelector("label")).toHaveClass(vireoFormSelectMultipleFieldClasses.inputLabel);
    expect(root?.querySelector(`.${vireoFormSelectMultipleFieldClasses.select}`)).toBeInTheDocument();
  });

  it("keeps the menu open while toggling checkbox rows and submits the ordered selection", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TestForm onSubmit={onSubmit} />);

    await openOptions();
    await user.click(await screen.findByRole("option", { name: "Product" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Platform" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Product, Platform");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { teamIds: ["product", "platform"] } }));
  });

  it("renders checked state and disables unavailable options", async () => {
    render(
      <TestForm initialValue={["platform"]} fieldProps={{ getOptionDisabled: option => option.id === "retired" }} />,
    );

    await openOptions();
    const platform = await screen.findByRole("option", { name: "Platform" });
    expect(platform.querySelector('input[type="checkbox"]')).toBeChecked();
    expect(screen.getByRole("option", { name: "Retired" })).toHaveAttribute("aria-disabled", "true");
  });

  it("uses the compact default summary and supports count-only presentation", () => {
    const { rerender } = render(<TestForm initialValue={["support", "platform", "product"]} />);
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Customer support, Platform +1");

    rerender(<TestForm initialValue={["support", "platform", "product"]} fieldProps={{ maxDisplayedOptions: 0 }} />);
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("3 selected");
  });

  it("passes complete compact-summary context to renderSelectedOptions", () => {
    const renderSelectedOptions = vi.fn(
      ({ displayedOptions, hiddenCount }: { displayedOptions: readonly Option[]; hiddenCount: number }) =>
        `${displayedOptions.map(option => option.label).join(" / ")} and ${hiddenCount} more`,
    );
    render(
      <TestForm
        initialValue={["product", "support", "platform"]}
        fieldProps={{ maxDisplayedOptions: 1, renderSelectedOptions }}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Product and 2 more");
    expect(renderSelectedOptions).toHaveBeenCalledWith({
      selectedOptions: [options[1], options[2], options[0]],
      displayedOptions: [options[1]],
      hiddenCount: 2,
      maxDisplayedOptions: 1,
    });
  });

  it("clears all selections accessibly and restores their original order on reset", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestForm initialValue={["product", "platform"]} fieldProps={{ clearLabel: "Clear teams", onValueChange }} />,
    );

    await user.click(screen.getByRole("button", { name: "Clear teams" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Choose teams");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Product, Platform");
  });

  it("can suppress clear-all and reserves space between its action and the caret", () => {
    const { rerender } = render(<TestForm initialValue={["platform"]} />);
    expect(screen.getByRole("button", { name: "Clear selections" })).toHaveStyle({ marginInlineEnd: "20px" });
    expect(screen.getByTestId("form").querySelector(".MuiSelect-icon")).toBeInTheDocument();

    rerender(<TestForm initialValue={["platform"]} fieldProps={{ disableClearable: true }} />);
    expect(screen.queryByRole("button", { name: "Clear selections" })).not.toBeInTheDocument();
  });

  it("preserves numeric identifiers", async () => {
    const numericOptions = [
      { id: 10, label: "Ten" },
      { id: 20, label: "Twenty" },
    ];
    const onSubmit = vi.fn();

    function NumericForm() {
      const form = useVireoForm({ defaultValues: { limits: [] as number[] }, onSubmit });
      return (
        <form.Form>
          <form.Field name="limits">
            {field => (
              <field.SelectMultipleField
                label="Limits"
                options={numericOptions}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Save limits</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<NumericForm />);
    await user.click(screen.getByRole("combobox", { name: "Limits" }));
    await user.click(await screen.findByRole("option", { name: "Twenty" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Save limits" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { limits: [20] } }));
  });

  it("presents array validation errors through the shared form policy", async () => {
    render(<TestForm validate={value => (value.length === 0 ? "Choose at least one team." : undefined)} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    const error = await screen.findByText("Choose at least one team.");
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveAccessibleDescription("Choose at least one team.");
    expect(error).toHaveClass(vireoFormSelectMultipleFieldClasses.formHelperText);
  });

  it("supports field-level Zod array validation", async () => {
    function ZodFieldForm() {
      const form = useVireoForm({
        defaultValues: { teamIds: [] as string[] },
        validationLogic: revalidateLogic(),
      });
      return (
        <form.Form>
          <form.Field name="teamIds" validators={{ onDynamic: z.array(z.string()).min(1, "Choose one team.") }}>
            {field => (
              <field.SelectMultipleField
                label="Teams"
                options={options}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    render(<ZodFieldForm />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Choose one team.")).toBeInTheDocument();
  });

  it("routes form-level Zod object issues without field validators", async () => {
    function ZodObjectForm() {
      const form = useVireoForm({
        defaultValues: { name: "", teamIds: [] as string[] },
        validationLogic: revalidateLogic(),
        validators: {
          onDynamic: z.object({
            name: z.string().min(2, "Enter a name."),
            teamIds: z.array(z.string()).min(1, "Choose teams."),
          }),
        },
      });
      return (
        <form.Form>
          <form.Field name="name">{field => <field.TextField label="Name" />}</form.Field>
          <form.Field name="teamIds">
            {field => (
              <field.SelectMultipleField
                label="Teams"
                options={options}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    render(<ZodObjectForm />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a name.")).toBeInTheDocument();
    expect(screen.getByText("Choose teams.")).toBeInTheDocument();
  });

  it("honors cancelable select and clear slot handlers", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestForm
        initialValue={["platform"]}
        fieldProps={{
          onValueChange,
          slotProps: {
            clearButton: { onClick: event => event.preventDefault() },
            select: { onChange: event => event.preventDefault() },
          },
        }}
      />,
    );

    await openOptions();
    await user.click(await screen.findByRole("option", { name: "Product" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Clear selections" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Platform");
  });

  it("composes root refs, replacement slots, classes, and owner-state slot props", async () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} data-custom-root="true" />;
      },
    );
    render(
      <TestForm
        fieldProps={{
          ref: forwardedRef,
          classes: { optionCheckbox: "custom-checkbox" },
          slots: { root: CustomRoot },
          slotProps: { root: { ref: rootSlotRef } },
        }}
      />,
    );

    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveAttribute("data-custom-root", "true");
    await openOptions();
    expect((await screen.findByRole("option", { name: "Platform" })).querySelector(".custom-checkbox")).toHaveClass(
      vireoFormSelectMultipleFieldClasses.optionCheckbox,
    );
  });

  it("uses theme defaults and state or slot style overrides", async () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME]: {
          defaultProps: { maxDisplayedOptions: 1, variant: "filled" },
          styleOverrides: { hasValue: { letterSpacing: "3px" }, option: { minHeight: "41px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm initialValue={["platform", "product"]} />
      </ThemeProvider>,
    );

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass(vireoFormSelectMultipleFieldClasses.hasValue);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(root?.querySelector(".MuiFilledInput-root")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Teams" })).toHaveTextContent("Platform +1");
    await openOptions();
    expect(await screen.findByRole("option", { name: "Platform" })).toHaveStyle({ minHeight: "41px" });
  });
});
