import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { Button, FormControl, ThemeProvider, createTheme, type FormControlProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { z } from "zod";
import { vireoFormNumberFieldClasses } from "./VireoFormNumberField.classes";
import { VIREO_FORM_NUMBER_FIELD_NAME } from "./VireoFormNumberField.identity";
import type { VireoFormNumberFieldProps } from "./VireoFormNumberField.types";

type TestFormProps = {
  fieldProps?: VireoFormNumberFieldProps;
  initialValue?: number | null;
  onSubmit?: Mock<() => void>;
  validate?: (value: number | null) => unknown;
};

function TestForm({ fieldProps, initialValue = null, onSubmit = vi.fn(() => undefined), validate }: TestFormProps) {
  const form = useVireoForm({
    defaultValues: { amount: initialValue },
    onSubmit,
  });

  return (
    <form.Form data-testid="form">
      <form.Field name="amount" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => <field.NumberField label="Amount" helperText="Optional amount" {...fieldProps} />}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <Button type="reset">Reset</Button>
    </form.Form>
  );
}

describe(VIREO_FORM_NUMBER_FIELD_NAME, () => {
  it("binds a number-or-null value and defaults to a full-width decimal textbox", () => {
    render(<TestForm />);

    const input = screen.getByRole("textbox", { name: "Amount" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(input).toHaveAttribute("name", "amount");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("");
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormNumberFieldClasses.root);
  });

  it("normalizes decimal commas and submits a number rather than text", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Amount" }), { target: { value: "12,5" } });
    expect(screen.getByRole("textbox", { name: "Amount" })).toHaveValue("12.5");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { amount: 12.5 } }));
  });

  it("preserves incomplete numeric drafts locally and normalizes them on blur", () => {
    render(<TestForm />);
    const input = screen.getByRole("textbox", { name: "Amount" });

    fireEvent.change(input, { target: { value: "-" } });
    expect(input).toHaveValue("-");
    fireEvent.blur(input);
    expect(input).toHaveValue("");

    fireEvent.change(input, { target: { value: "1." } });
    expect(input).toHaveValue("1.");
    fireEvent.blur(input);
    expect(input).toHaveValue("1");
  });

  it("emits null for empty input and restores default values on form reset", () => {
    render(<TestForm initialValue={7} />);
    const input = screen.getByRole("textbox", { name: "Amount" });

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(input).toHaveValue("7");
  });

  it("clamps complete values to min and max without emitting invalid numbers", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm fieldProps={{ max: 5, min: 1 }} onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Amount" });

    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "5");
    fireEvent.change(input, { target: { value: "8" } });
    expect(input).toHaveValue("5");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { amount: 5 } }));
  });

  it("rejects nonnumeric edits without corrupting the bound value", () => {
    render(<TestForm initialValue={4} />);
    const input = screen.getByRole("textbox", { name: "Amount" });

    fireEvent.change(input, { target: { value: "4x" } });
    expect(input).toHaveValue("4");
  });

  it("presents validation errors through the shared form policy", async () => {
    render(<TestForm validate={value => (value === null ? "Amount is required." : undefined)} />);
    const input = screen.getByRole("textbox", { name: "Amount" });

    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(await screen.findByText("Amount is required.")).toBeInTheDocument();
    expect(input.closest(".MuiFormControl-root")).toHaveClass(
      vireoFormNumberFieldClasses.invalid,
      vireoFormNumberFieldClasses.errorVisible,
    );
  });

  it("presents field-level Standard Schema validation issues from Zod", async () => {
    const quantitySchema = z
      .number()
      .int("Enter a whole number.")
      .min(1, "Enter at least one item.")
      .nullable()
      .refine(value => value !== null, "Enter a quantity.");

    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { quantity: null as number | null },
        validationLogic: revalidateLogic(),
      });

      return (
        <form.Form>
          <form.Field name="quantity" validators={{ onDynamic: quantitySchema }}>
            {field => <field.NumberField label="Quantity" />}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a quantity.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Quantity" }), "4");
    await waitFor(() => expect(screen.queryByText("Enter a quantity.")).not.toBeInTheDocument());
  });

  it("routes form-level Zod object issues to numeric fields without field validators", async () => {
    function ZodObjectForm() {
      const form = useVireoForm({
        defaultValues: { item: "", quantity: null as number | null },
        validationLogic: revalidateLogic(),
        validators: {
          onDynamic: z.object({
            item: z.string().min(2, "Enter at least two characters."),
            quantity: z
              .number()
              .nullable()
              .refine(value => value !== null, "Enter a quantity."),
          }),
        },
      });

      return (
        <form.Form>
          <form.Field name="item">{field => <field.TextField label="Item" />}</form.Field>
          <form.Field name="quantity">{field => <field.NumberField label="Quantity" />}</form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodObjectForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter at least two characters.")).toBeInTheDocument();
    expect(screen.getByText("Enter a quantity.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Item" }), "Bolt");
    await user.type(screen.getByRole("textbox", { name: "Quantity" }), "12");
    await waitFor(() => {
      expect(screen.queryByText("Enter at least two characters.")).not.toBeInTheDocument();
      expect(screen.queryByText("Enter a quantity.")).not.toBeInTheDocument();
    });
  });

  it("runs consumer handlers before field updates and honors cancellation", () => {
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => event.preventDefault());
    const onBlur = vi.fn((event: React.FocusEvent<HTMLInputElement>) => event.preventDefault());
    render(<TestForm initialValue={2} fieldProps={{ onBlur, onChange }} />);

    const input = screen.getByRole("textbox", { name: "Amount" });
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input).toHaveValue("2");
    expect(input.closest(".MuiFormControl-root")).not.toHaveClass(vireoFormNumberFieldClasses.touched);
  });

  it("composes root and native-input refs with representative slot customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const htmlInputSlotRef = React.createRef<HTMLInputElement>();

    function RefForm() {
      const form = useVireoForm({ defaultValues: { amount: 3 as number | null } });
      return (
        <form.Form>
          <form.Field name="amount">
            {field => (
              <field.NumberField
                ref={forwardedRef}
                inputRef={inputRef}
                label="Amount"
                slotProps={{ root: { ref: rootSlotRef }, htmlInput: { ref: htmlInputSlotRef } }}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }

    render(<RefForm />);
    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveClass(vireoFormNumberFieldClasses.root);
    expect(inputRef.current).toBe(htmlInputSlotRef.current);
    expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Amount" }));
  });

  it("supports a replacement root, owner-state slot props, and class customization", () => {
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} data-custom-root="true" />;
      },
    );

    render(
      <TestForm
        initialValue={2}
        fieldProps={{
          classes: { htmlInput: "custom-input" },
          slots: { root: CustomRoot },
          slotProps: { root: ownerState => ({ "data-dirty": ownerState.dirty }) },
        }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Amount" }), { target: { value: "3" } });

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-dirty", "true");
    expect(screen.getByRole("textbox", { name: "Amount" })).toHaveClass(
      vireoFormNumberFieldClasses.htmlInput,
      "custom-input",
    );
  });

  it("uses theme default props and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_NUMBER_FIELD_NAME]: {
          defaultProps: { size: "small", variant: "filled" },
          styleOverrides: { dirty: { letterSpacing: "3px" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <TestForm initialValue={2} />
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Amount" }), { target: { value: "3" } });

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass("MuiTextField-root", vireoFormNumberFieldClasses.dirty);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(root?.querySelector(".MuiFilledInput-root")).toBeInTheDocument();
  });
});
