import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import {
  FormControl,
  ThemeProvider,
  Typography,
  createTheme,
  type FormControlProps,
  type TypographyProps,
} from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { z } from "zod";
import { vireoFormSwitchFieldClasses } from "./VireoFormSwitchField.classes";
import { VIREO_FORM_SWITCH_FIELD_NAME } from "./VireoFormSwitchField.identity";
import type { VireoFormSwitchFieldProps } from "./VireoFormSwitchField.types";

type TestFormProps = {
  fieldProps?: Omit<VireoFormSwitchFieldProps, "label">;
  initialValue?: boolean;
  onSubmit?: Mock<() => void>;
  validate?: (value: boolean) => unknown;
};

function TestForm({ fieldProps, initialValue = false, onSubmit = vi.fn(() => undefined), validate }: TestFormProps) {
  const form = useVireoForm({
    defaultValues: { enabled: initialValue },
    onSubmit,
  });

  return (
    <form.Form data-testid="form">
      <form.Field name="enabled" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => <field.SwitchField helperText="Optional preference" label="Enabled" {...fieldProps} />}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <form.ResetButton>Reset</form.ResetButton>
    </form.Form>
  );
}

describe(VIREO_FORM_SWITCH_FIELD_NAME, () => {
  it("binds a boolean field and defaults to a full-width labelled switch", () => {
    render(<TestForm />);

    const input = screen.getByRole("checkbox", { name: "Enabled" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(input).toHaveAttribute("name", "enabled");
    expect(input).not.toBeChecked();
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormSwitchFieldClasses.root);
    expect(root?.querySelector(".MuiFormControlLabel-root")).toHaveClass(vireoFormSwitchFieldClasses.formControlLabel);
    expect(root?.querySelector(".MuiSwitch-root")).toHaveClass(vireoFormSwitchFieldClasses.switch);
    expect(screen.getByText("Enabled")).toHaveClass(vireoFormSwitchFieldClasses.label);
  });

  it("updates and submits the bound boolean value", async () => {
    const onSubmit = vi.fn<() => void>();
    const user = userEvent.setup();
    render(<TestForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("checkbox", { name: "Enabled" }));
    expect(screen.getByRole("checkbox", { name: "Enabled" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { enabled: true } }));
  });

  it("restores the boolean default through form.ResetButton", async () => {
    const user = userEvent.setup();
    render(<TestForm initialValue />);

    await user.click(screen.getByRole("checkbox", { name: "Enabled" }));
    expect(screen.getByRole("checkbox", { name: "Enabled" })).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("checkbox", { name: "Enabled" })).toBeChecked();
  });

  it("presents validation errors through the shared form policy", async () => {
    render(<TestForm initialValue validate={value => (value ? undefined : "Enable this setting.")} />);
    const input = screen.getByRole("checkbox", { name: "Enabled" });

    fireEvent.click(input);
    fireEvent.blur(input);

    expect(await screen.findByText("Enable this setting.")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.closest(".MuiFormControl-root")).toHaveClass(
      vireoFormSwitchFieldClasses.invalid,
      vireoFormSwitchFieldClasses.errorVisible,
    );
  });

  it("presents field-level Standard Schema validation issues from Zod", async () => {
    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { accepted: false },
        validationLogic: revalidateLogic(),
      });

      return (
        <form.Form>
          <form.Field
            name="accepted"
            validators={{ onDynamic: z.boolean().refine(value => value, "Accept the terms.") }}
          >
            {field => <field.SwitchField label="Terms accepted" />}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Accept the terms.")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Terms accepted" }));
    await waitFor(() => expect(screen.queryByText("Accept the terms.")).not.toBeInTheDocument());
  });

  it("routes form-level Zod object issues to boolean fields without field validators", async () => {
    function ZodObjectForm() {
      const form = useVireoForm({
        defaultValues: { displayName: "", subscribed: false },
        validationLogic: revalidateLogic(),
        validators: {
          onDynamic: z.object({
            displayName: z.string().min(2, "Enter at least two characters."),
            subscribed: z.boolean().refine(value => value, "Enable updates."),
          }),
        },
      });

      return (
        <form.Form>
          <form.Field name="displayName">{field => <field.TextField label="Display name" />}</form.Field>
          <form.Field name="subscribed">{field => <field.SwitchField label="Product updates" />}</form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodObjectForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter at least two characters.")).toBeInTheDocument();
    expect(screen.getByText("Enable updates.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Display name" }), "Ada");
    await user.click(screen.getByRole("checkbox", { name: "Product updates" }));
    await waitFor(() => {
      expect(screen.queryByText("Enter at least two characters.")).not.toBeInTheDocument();
      expect(screen.queryByText("Enable updates.")).not.toBeInTheDocument();
    });
  });

  it("wires required, disabled, helper text, and native input accessibility", () => {
    render(<TestForm fieldProps={{ disabled: true, required: true }} />);

    const input = screen.getByRole("checkbox", { name: /Enabled/ });
    const helperText = screen.getByText("Optional preference");
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-describedby", helperText.id);
    expect(input.closest(".MuiFormControl-root")).toHaveClass(vireoFormSwitchFieldClasses.disabled);
  });

  it("runs consumer handlers before field updates and honors cancellation", async () => {
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => event.preventDefault());
    const onBlur = vi.fn((event: React.FocusEvent<HTMLButtonElement>) => event.preventDefault());
    render(<TestForm fieldProps={{ onBlur, onChange }} />);

    const input = screen.getByRole("checkbox", { name: "Enabled" });
    fireEvent.click(input);
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    await waitFor(() => expect(input).not.toBeChecked());
    expect(input.closest(".MuiFormControl-root")).not.toHaveClass(vireoFormSwitchFieldClasses.touched);
  });

  it("composes root and native-input refs", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const switchSlotInputRef = React.createRef<HTMLInputElement>();

    function RefForm() {
      const form = useVireoForm({ defaultValues: { enabled: false } });
      return (
        <form.Form>
          <form.Field name="enabled">
            {field => (
              <field.SwitchField
                ref={forwardedRef}
                inputRef={inputRef}
                label="Enabled"
                slotProps={{ root: { ref: rootSlotRef }, switch: { inputRef: switchSlotInputRef } }}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }

    render(<RefForm />);
    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveClass(vireoFormSwitchFieldClasses.root);
    expect(inputRef.current).toBe(switchSlotInputRef.current);
    expect(inputRef.current).toBe(screen.getByRole("checkbox", { name: "Enabled" }));
  });

  it("supports replacement slots, owner-state slot props, and class customization", async () => {
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} data-custom-root="true" />;
      },
    );
    const CustomLabel = React.forwardRef<HTMLElement, TypographyProps & { ownerState?: unknown }>(function CustomLabel(
      { ownerState: _ownerState, ...props },
      ref,
    ) {
      void _ownerState;
      return <Typography {...props} ref={ref} data-custom-label="true" />;
    });
    const user = userEvent.setup();

    render(
      <TestForm
        fieldProps={{
          classes: { switch: "custom-switch" },
          slots: { label: CustomLabel, root: CustomRoot },
          slotProps: { root: ownerState => ({ "data-checked": ownerState.checked }) },
        }}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Enabled" }));

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-checked", "true");
    expect(screen.getByText("Enabled")).toHaveAttribute("data-custom-label", "true");
    expect(root?.querySelector(".MuiSwitch-root")).toHaveClass(vireoFormSwitchFieldClasses.switch, "custom-switch");
  });

  it("supports label placement through the component contract", () => {
    render(<TestForm fieldProps={{ labelPlacement: "start" }} />);

    expect(screen.getByText("Enabled").closest(".MuiFormControlLabel-root")).toHaveClass(
      "MuiFormControlLabel-labelPlacementStart",
    );
  });

  it("uses theme default props and checked-state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_SWITCH_FIELD_NAME]: {
          defaultProps: { labelPlacement: "start" },
          styleOverrides: { checked: { letterSpacing: "3px" } },
        },
      },
    });

    function ThemedForm() {
      const form = useVireoForm({ defaultValues: { enabled: true } });
      return (
        <form.Form data-testid="form">
          <form.Field name="enabled">{field => <field.SwitchField label="Themed enabled" />}</form.Field>
        </form.Form>
      );
    }

    render(
      <ThemeProvider theme={theme}>
        <ThemedForm />
      </ThemeProvider>,
    );

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass(vireoFormSwitchFieldClasses.checked);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(screen.getByText("Themed enabled").closest(".MuiFormControlLabel-root")).toHaveClass(
      "MuiFormControlLabel-labelPlacementStart",
    );
  });
});
