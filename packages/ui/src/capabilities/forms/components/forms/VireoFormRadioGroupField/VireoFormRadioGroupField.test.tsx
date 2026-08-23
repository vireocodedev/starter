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
import { vireoFormRadioGroupFieldClasses } from "./VireoFormRadioGroupField.classes";
import { VIREO_FORM_RADIO_GROUP_FIELD_NAME } from "./VireoFormRadioGroupField.identity";
import type { VireoFormRadioGroupFieldProps } from "./VireoFormRadioGroupField.types";

const strategies = [
  { id: "rolling", label: "Rolling", disabled: false },
  { id: "canary", label: "Canary", disabled: false },
  { id: "retired", label: "Retired", disabled: true },
] as const;

type Strategy = (typeof strategies)[number];
type TestFieldProps = Partial<VireoFormRadioGroupFieldProps<Strategy, string>>;

type TestFormProps = {
  fieldProps?: TestFieldProps;
  initialValue?: string | null;
  onSubmit?: Mock<() => void>;
  validate?: (value: string | null) => unknown;
};

function TestForm({ fieldProps, initialValue = null, onSubmit = vi.fn(() => undefined), validate }: TestFormProps) {
  const form = useVireoForm({ defaultValues: { strategy: initialValue }, onSubmit });

  return (
    <form.Form data-testid="form">
      <form.Field name="strategy" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.RadioGroupField
            aria-label="Deployment strategy"
            helperText="Choose one strategy"
            options={strategies}
            getOptionValue={strategy => strategy.id}
            renderOption={strategy => strategy.label}
            {...fieldProps}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <form.ResetButton>Reset</form.ResetButton>
    </form.Form>
  );
}

describe(VIREO_FORM_RADIO_GROUP_FIELD_NAME, () => {
  it("binds a nullable scalar field and defaults to a full-width column radio group", () => {
    render(<TestForm />);

    const group = screen.getByRole("radiogroup", { name: "Deployment strategy" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(screen.getByRole("radio", { name: "Rolling" })).toHaveAttribute("name", "strategy");
    expect(group).toHaveClass(vireoFormRadioGroupFieldClasses.radioGroup);
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormRadioGroupFieldClasses.root);
    expect(screen.getByRole("radio", { name: "Rolling" })).not.toBeChecked();
    expect(screen.getByText("Rolling")).toHaveClass(vireoFormRadioGroupFieldClasses.optionLabel);
    expect(root?.querySelector(".MuiFormControlLabel-root")).toHaveClass(
      vireoFormRadioGroupFieldClasses.formControlLabel,
    );
    expect(root?.querySelector(".MuiRadio-root")).toHaveClass(vireoFormRadioGroupFieldClasses.radio);
  });

  it("updates and submits the selected string value", async () => {
    const onSubmit = vi.fn<() => void>();
    const user = userEvent.setup();
    render(<TestForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "Canary" }));
    expect(screen.getByRole("radio", { name: "Canary" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { strategy: "canary" } }));
  });

  it("preserves numeric option values instead of submitting DOM strings", async () => {
    const onSubmit = vi.fn<() => void>();
    const levels = [
      { id: 1, label: "Basic" },
      { id: 2, label: "Advanced" },
    ] as const;

    function NumericForm() {
      const form = useVireoForm({ defaultValues: { level: null as number | null }, onSubmit });
      return (
        <form.Form>
          <form.Field name="level">
            {field => (
              <field.RadioGroupField
                aria-label="Access level"
                options={levels}
                getOptionValue={level => level.id}
                renderOption={level => level.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Submit level</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<NumericForm />);
    await user.click(screen.getByRole("radio", { name: "Advanced" }));
    await user.click(screen.getByRole("button", { name: "Submit level" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { level: 2 } }));
  });

  it("protects the field-owned radio name and encoded option value from slot overrides", async () => {
    const user = userEvent.setup();
    render(<TestForm fieldProps={{ slotProps: { radio: { name: "overridden", value: "overridden" } } }} />);

    const canary = screen.getByRole("radio", { name: "Canary" });
    expect(canary).toHaveAttribute("name", "strategy");
    expect(canary).not.toHaveAttribute("value", "overridden");
    await user.click(canary);
    expect(canary).toBeChecked();
  });

  it("restores the nullable default through form.ResetButton", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    await user.click(screen.getByRole("radio", { name: "Rolling" }));
    expect(screen.getByRole("radio", { name: "Rolling" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("radio", { name: "Rolling" })).not.toBeChecked();
  });

  it("supports row layout and option-specific disabled state", () => {
    render(<TestForm fieldProps={{ row: true, getOptionDisabled: option => option.disabled }} />);

    expect(screen.getByRole("radiogroup", { name: "Deployment strategy" })).toHaveClass("MuiRadioGroup-row");
    expect(screen.getByRole("radio", { name: "Retired" })).toBeDisabled();
    expect(screen.getByTestId("form").querySelector(".MuiFormControl-root")).toHaveClass(
      vireoFormRadioGroupFieldClasses.row,
    );
  });

  it("presents validation errors through the shared form policy", async () => {
    render(<TestForm validate={value => (value === "canary" ? undefined : "Choose canary.")} />);
    const rolling = screen.getByRole("radio", { name: "Rolling" });

    fireEvent.click(rolling);
    fireEvent.blur(rolling);

    expect(await screen.findByText("Choose canary.")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Deployment strategy" })).toHaveAttribute("aria-invalid", "true");
    expect(rolling.closest(".MuiFormControl-root")).toHaveClass(
      vireoFormRadioGroupFieldClasses.invalid,
      vireoFormRadioGroupFieldClasses.errorVisible,
    );
  });

  it("presents field-level Standard Schema validation issues from Zod", async () => {
    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { strategy: null as string | null },
        validationLogic: revalidateLogic(),
      });
      return (
        <form.Form>
          <form.Field
            name="strategy"
            validators={{
              onDynamic: z.enum(["rolling", "canary"]).nullable().refine(Boolean, "Choose a strategy."),
            }}
          >
            {field => (
              <field.RadioGroupField
                aria-label="Strategy"
                options={strategies.slice(0, 2)}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Choose a strategy.")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Rolling" }));
    await waitFor(() => expect(screen.queryByText("Choose a strategy.")).not.toBeInTheDocument());
  });

  it("routes form-level Zod object issues to the matching radio field", async () => {
    function ZodObjectForm() {
      const form = useVireoForm({
        defaultValues: { name: "", strategy: null as string | null },
        validationLogic: revalidateLogic(),
        validators: {
          onDynamic: z.object({
            name: z.string().min(2, "Enter at least two characters."),
            strategy: z.enum(["rolling", "canary"]).nullable().refine(Boolean, "Choose a strategy."),
          }),
        },
      });
      return (
        <form.Form>
          <form.Field name="name">{field => <field.TextField label="Name" />}</form.Field>
          <form.Field name="strategy">
            {field => (
              <field.RadioGroupField
                aria-label="Strategy"
                options={strategies.slice(0, 2)}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodObjectForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter at least two characters.")).toBeInTheDocument();
    expect(screen.getByText("Choose a strategy.")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("radio", { name: "Canary" }));
    await waitFor(() => {
      expect(screen.queryByText("Enter at least two characters.")).not.toBeInTheDocument();
      expect(screen.queryByText("Choose a strategy.")).not.toBeInTheDocument();
    });
  });

  it("wires required, disabled, helper text, and group accessibility", () => {
    render(<TestForm fieldProps={{ disabled: true, required: true }} />);

    const group = screen.getByRole("radiogroup", { name: "Deployment strategy" });
    const helperText = screen.getByText("Choose one strategy");
    expect(group).toHaveAttribute("aria-describedby", helperText.id);
    expect(screen.getByRole("radio", { name: "Rolling" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Rolling" })).toBeRequired();
    expect(group.closest(".MuiFormControl-root")).toHaveClass(vireoFormRadioGroupFieldClasses.disabled);
  });

  it("runs consumer handlers before field updates and honors cancellation", async () => {
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => event.preventDefault());
    const onBlur = vi.fn((event: React.FocusEvent<HTMLDivElement>) => event.preventDefault());
    render(<TestForm fieldProps={{ onBlur, onChange }} />);

    const rolling = screen.getByRole("radio", { name: "Rolling" });
    fireEvent.click(rolling);
    fireEvent.blur(rolling);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    await waitFor(() => expect(rolling).not.toBeChecked());
    expect(rolling.closest(".MuiFormControl-root")).not.toHaveClass(vireoFormRadioGroupFieldClasses.touched);
  });

  it("composes forwarded and root-slot refs", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    function RefForm() {
      const form = useVireoForm({ defaultValues: { strategy: null as string | null } });
      return (
        <form.Form>
          <form.Field name="strategy">
            {field => (
              <field.RadioGroupField
                ref={forwardedRef}
                aria-label="Strategy"
                options={strategies}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
                slotProps={{ root: { ref: rootSlotRef } }}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }

    render(<RefForm />);
    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveClass(vireoFormRadioGroupFieldClasses.root);
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
          classes: { radio: "custom-radio" },
          slots: { optionLabel: CustomLabel, root: CustomRoot },
          slotProps: { root: ownerState => ({ "data-has-value": ownerState.hasValue }) },
        }}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "Rolling" }));

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-has-value", "true");
    expect(screen.getByText("Rolling")).toHaveAttribute("data-custom-label", "true");
    expect(root?.querySelector(".MuiRadio-root")).toHaveClass(vireoFormRadioGroupFieldClasses.radio, "custom-radio");
  });

  it("supports option label placement through the component contract", () => {
    render(<TestForm fieldProps={{ labelPlacement: "start" }} />);

    expect(screen.getByText("Rolling").closest(".MuiFormControlLabel-root")).toHaveClass(
      "MuiFormControlLabel-labelPlacementStart",
    );
  });

  it("uses theme default props and selected-state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_RADIO_GROUP_FIELD_NAME]: {
          defaultProps: { row: true },
          styleOverrides: { hasValue: { letterSpacing: "3px" } },
        },
      },
    });

    function ThemedForm() {
      const form = useVireoForm({ defaultValues: { strategy: "rolling" as string | null } });
      return (
        <form.Form data-testid="form">
          <form.Field name="strategy">
            {field => (
              <field.RadioGroupField
                aria-label="Themed strategy"
                options={strategies}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }

    render(
      <ThemeProvider theme={theme}>
        <ThemedForm />
      </ThemeProvider>,
    );

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass(vireoFormRadioGroupFieldClasses.hasValue);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(screen.getByRole("radiogroup", { name: "Themed strategy" })).toHaveClass("MuiRadioGroup-row");
  });
});
