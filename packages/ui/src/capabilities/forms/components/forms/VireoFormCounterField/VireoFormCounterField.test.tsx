import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { FormControl, ThemeProvider, createTheme, type FormControlProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { vireoFormCounterFieldClasses } from "./VireoFormCounterField.classes";
import { VIREO_FORM_COUNTER_FIELD_NAME } from "./VireoFormCounterField.identity";
import type { VireoFormCounterFieldProps } from "./VireoFormCounterField.types";

type CounterProps = Partial<VireoFormCounterFieldProps & React.RefAttributes<HTMLDivElement>>;

function TestForm({
  fieldProps,
  initialValue = 1,
  onSubmit = vi.fn(),
  validate,
}: {
  fieldProps?: CounterProps;
  initialValue?: number | null;
  onSubmit?: ReturnType<typeof vi.fn>;
  validate?: (value: number | null) => unknown;
}) {
  const form = useVireoForm({ defaultValues: { quantity: initialValue }, onSubmit });
  return (
    <form.Form data-testid="form">
      <form.Field name="quantity" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => <field.CounterField aria-label="Quantity" helperText="Choose a quantity" {...fieldProps} />}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.Form>
  );
}

describe(VIREO_FORM_COUNTER_FIELD_NAME, () => {
  it("renders the editable counter semantics and full-width default", () => {
    render(<TestForm />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const root = screen.getByRole("group", { name: "Quantity" });
    expect(input).toHaveValue("1");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormCounterFieldClasses.root);
    expect(screen.getByRole("button", { name: "Decrease" })).toHaveAttribute("aria-controls", input.id);
    expect(screen.getByRole("button", { name: "Increase" })).toHaveAttribute("aria-controls", input.id);
  });

  it("steps with buttons and Arrow keys, edits directly, and submits the numeric value", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TestForm onSubmit={onSubmit} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(input).toHaveValue("2");
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input).toHaveValue("1");
    input.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}");
    expect(input).toHaveValue("2");
    fireEvent.change(input, { target: { value: "7" } });
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { quantity: 7 } }));
  });

  it("uses zero as the null stepping baseline and clamps it to bounds", async () => {
    const user = userEvent.setup();
    const first = render(<TestForm initialValue={null} fieldProps={{ step: 2 }} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("2");
    first.unmount();
    render(<TestForm initialValue={null} fieldProps={{ min: 5, max: 10, step: 2 }} />);
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("5");
  });

  it("normalizes decimal arithmetic without snapping typed values to the step grid", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestForm initialValue={0.35} fieldProps={{ step: 0.1, onValueChange }} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("0.45");
    expect(onValueChange).toHaveBeenLastCalledWith(0.45);
  });

  it("keeps external out-of-range values visible and corrects them toward the nearest bound", async () => {
    const user = userEvent.setup();
    render(<TestForm initialValue={12} fieldProps={{ min: 0, max: 10 }} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input).toHaveValue("12");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input).toHaveValue("10");
  });

  it("disables only the direction that cannot change a bounded value", async () => {
    const user = userEvent.setup();
    render(<TestForm initialValue={0} fieldProps={{ min: 0, max: 1 }} />);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    expect(screen.getByRole("group", { name: "Quantity" })).toHaveClass(vireoFormCounterFieldClasses.atMax);
  });

  it("preserves incomplete drafts, accepts decimal commas, and normalizes on blur", () => {
    render(<TestForm initialValue={2} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.change(input, { target: { value: "-" } });
    expect(input).toHaveValue("-");
    fireEvent.blur(input);
    expect(input).toHaveValue("2");
    fireEvent.change(input, { target: { value: "1," } });
    expect(input).toHaveValue("1.");
    fireEvent.change(input, { target: { value: "1,25" } });
    expect(input).toHaveValue("1.25");
  });

  it("clears to null and rejects unsupported syntax without corrupting the stored value", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TestForm initialValue={4} onSubmit={onSubmit} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.change(input, { target: { value: "1e5" } });
    expect(input).toHaveValue("4");
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { quantity: null } }));
  });

  it("prevents wheel stepping and semantic no-op emissions", () => {
    const nativeChange = vi.fn();
    const onValueChange = vi.fn();
    render(<TestForm initialValue={10} fieldProps={{ max: 10, onChange: nativeChange, onValueChange }} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.wheel(input, { deltaY: -100 });
    expect(input).toHaveValue("10");
    fireEvent.change(input, { target: { value: "12" } });
    expect(nativeChange).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("10");
  });

  it("keeps disabled and read-only counters unchanged", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const first = render(<TestForm fieldProps={{ disabled: true, onValueChange }} />);
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    first.unmount();
    render(<TestForm fieldProps={{ readOnly: true, onValueChange }} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input).toHaveAttribute("aria-readonly", "true");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.type(input, "9");
    expect(input).toHaveValue("1");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("composes input events in order and lets cancellation block the field update", () => {
    const order: string[] = [];
    render(
      <TestForm
        fieldProps={{
          onChange: event => {
            order.push("direct");
            event.preventDefault();
          },
          onValueChange: () => order.push("value"),
          slotProps: {
            htmlInput: { onChange: () => order.push("html") },
            input: { onChange: () => order.push("input") },
          },
        }}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.change(input, { target: { value: "3" } });
    expect(order).toEqual(["html", "input", "direct"]);
    expect(input).toHaveValue("1");
  });

  it("lets button slot handlers cancel stepping", async () => {
    const user = userEvent.setup();
    render(<TestForm fieldProps={{ slotProps: { incrementButton: { onClick: event => event.preventDefault() } } }} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("1");
  });

  it("treats focus movement inside the composite as internal and touches only when focus leaves", () => {
    const onBlur = vi.fn();
    render(<TestForm fieldProps={{ onBlur }} />);
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const increment = screen.getByRole("button", { name: "Increase" });
    fireEvent.blur(input, { relatedTarget: increment });
    expect(onBlur).not.toHaveBeenCalled();
    expect(screen.getByRole("group", { name: "Quantity" })).not.toHaveClass(vireoFormCounterFieldClasses.touched);
    fireEvent.blur(increment, { relatedTarget: document.body });
    expect(onBlur).toHaveBeenCalledOnce();
    expect(screen.getByRole("group", { name: "Quantity" })).toHaveClass(vireoFormCounterFieldClasses.touched);
  });

  it("presents Zod validation, required semantics, helper relationships, and invalid-submit focus", async () => {
    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { quantity: null as number | null },
        validationLogic: revalidateLogic(),
      });
      return (
        <form.Form>
          <form.Field
            name="quantity"
            validators={{ onDynamic: z.number({ message: "Choose a quantity." }).min(1, "Choose a quantity.") }}
          >
            {field => <field.CounterField required aria-label="Quantity" min={1} />}
          </form.Field>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.Form>
      );
    }
    const user = userEvent.setup();
    render(<ZodForm />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    const errorMessage = await screen.findByText("Choose a quantity.");
    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-describedby", errorMessage.id);
  });

  it("fails fast for invalid configuration and non-finite field values", () => {
    expect(() => render(<TestForm fieldProps={{ step: 0 }} />)).toThrow("step must be greater than zero");
    expect(() => render(<TestForm fieldProps={{ min: 2, max: 1 }} />)).toThrow("min must be less than or equal");
    expect(() => render(<TestForm fieldProps={{ min: Number.POSITIVE_INFINITY }} />)).toThrow(
      "min must be a finite number",
    );
    expect(() => render(<TestForm initialValue={Number.NaN} />)).toThrow("finite number or null field value");
  });

  it("composes refs, replacement slots, owner-state slot props, and utility classes", async () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} data-custom-root="true" />;
      },
    );
    const user = userEvent.setup();
    render(
      <TestForm
        fieldProps={{
          ref: rootRef,
          inputRef,
          classes: { incrementButton: "custom-increment" },
          slots: { root: CustomRoot, incrementIcon: AddCircleOutlineIcon },
          slotProps: { root: state => ({ "data-has-value": state.hasValue }) },
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(rootRef.current).toHaveAttribute("data-custom-root", "true");
    expect(rootRef.current).toHaveAttribute("data-has-value", "true");
    expect(inputRef.current).toBe(screen.getByRole("spinbutton", { name: "Quantity" }));
    expect(screen.getByRole("button", { name: "Increase" })).toHaveClass(
      vireoFormCounterFieldClasses.incrementButton,
      "custom-increment",
    );
  });

  it("uses theme default props and owner-state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_COUNTER_FIELD_NAME]: {
          defaultProps: { size: "small", step: 2 },
          styleOverrides: { hasValue: { letterSpacing: "3px" }, incrementButton: { borderRadius: "3px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm />
      </ThemeProvider>,
    );
    const root = screen.getByRole("group", { name: "Quantity" });
    expect(root).toHaveClass(vireoFormCounterFieldClasses.hasValue);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(screen.getByRole("button", { name: "Increase" })).toHaveStyle({ borderRadius: "3px" });
  });
});
