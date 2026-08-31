import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { FormControl, ThemeProvider, ToggleButton, createTheme, type FormControlProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { z } from "zod";
import { vireoFormToggleButtonGroupFieldClasses } from "./VireoFormToggleButtonGroupField.classes";
import { VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME } from "./VireoFormToggleButtonGroupField.identity";
import type {
  VireoFormToggleButtonGroupFieldExclusiveProps,
  VireoFormToggleButtonGroupFieldOption,
} from "./VireoFormToggleButtonGroupField.types";

const options = [
  { value: "", label: "Automatic" },
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "retired", label: "Retired", disabled: true },
] as const satisfies readonly VireoFormToggleButtonGroupFieldOption<string>[];

type ExclusiveProps = Partial<
  VireoFormToggleButtonGroupFieldExclusiveProps<string> & React.RefAttributes<HTMLDivElement>
>;

function ExclusiveForm({
  fieldProps,
  initialValue = null,
  onSubmit = vi.fn(() => undefined),
  validate,
}: {
  fieldProps?: ExclusiveProps;
  initialValue?: string | null;
  onSubmit?: Mock<() => void>;
  validate?: (value: string | null) => unknown;
}) {
  const form = useVireoForm({ defaultValues: { density: initialValue }, onSubmit });
  return (
    <form.Form data-testid="form">
      <form.Field name="density" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.ToggleButtonGroupField
            aria-label="Interface density"
            helperText="Choose a density"
            options={options}
            {...fieldProps}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
    </form.Form>
  );
}

function MultipleForm({
  initialValue = [],
  onValueChange,
  disableClearable,
}: {
  initialValue?: string[];
  onValueChange?: (value: string[]) => void;
  disableClearable?: boolean;
}) {
  const form = useVireoForm({ defaultValues: { channels: initialValue } });
  return (
    <form.Form>
      <form.Field name="channels">
        {field => (
          <field.ToggleButtonGroupField
            multiple
            aria-label="Notification channels"
            disableClearable={disableClearable}
            onValueChange={onValueChange}
            options={[
              { value: "email", label: "Email" },
              { value: "sms", label: "SMS" },
              { value: "push", label: "Push" },
            ]}
          />
        )}
      </form.Field>
    </form.Form>
  );
}

describe(VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME, () => {
  it("binds nullable exclusive values including the empty string and defaults to full width", async () => {
    const user = userEvent.setup();
    render(<ExclusiveForm />);

    const automatic = screen.getByRole("button", { name: "Automatic" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormToggleButtonGroupFieldClasses.root);
    expect(automatic).toHaveAttribute("aria-pressed", "false");
    await user.click(automatic);
    expect(automatic).toHaveAttribute("aria-pressed", "true");
    expect(root).toHaveClass(
      vireoFormToggleButtonGroupFieldClasses.dirty,
      vireoFormToggleButtonGroupFieldClasses.hasValue,
    );
  });

  it("preserves numeric option values when submitting", async () => {
    const onSubmit = vi.fn<() => void>();
    function NumericForm() {
      const form = useVireoForm({ defaultValues: { columns: null as number | null }, onSubmit });
      return (
        <form.Form>
          <form.Field name="columns">
            {field => (
              <field.ToggleButtonGroupField
                aria-label="Columns"
                options={[
                  { value: 0, label: "Auto" },
                  { value: 2, label: "Two" },
                ]}
              />
            )}
          </form.Field>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.Form>
      );
    }
    const user = userEvent.setup();
    render(<NumericForm />);
    await user.click(screen.getByRole("button", { name: "Two" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { columns: 2 } }));
  });

  it("clears exclusive values by default and prevents clearing when disableClearable", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ExclusiveForm initialValue="compact" />);
    const compact = screen.getByRole("button", { name: "Compact" });
    await user.click(compact);
    expect(compact).toHaveAttribute("aria-pressed", "false");

    rerender(<ExclusiveForm initialValue="compact" fieldProps={{ disableClearable: true }} />);
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
  });

  it("emits multiple values in option order and drops stale values on the next interaction", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<MultipleForm initialValue={["stale", "push"]} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Email" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["email", "push"]);
    await user.click(screen.getByRole("button", { name: "SMS" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["email", "sms", "push"]);
  });

  it("allows an empty multiple value by default and protects the final value when disableClearable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const firstRender = render(<MultipleForm initialValue={["email"]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Email" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);

    firstRender.unmount();
    onValueChange.mockClear();
    render(<MultipleForm initialValue={["email"]} onValueChange={onValueChange} disableClearable />);
    await user.click(screen.getByRole("button", { name: "Email" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Email" })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps disabled and read-only choices unchanged without invoking callbacks", async () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(<ExclusiveForm fieldProps={{ disabled: true, onChange, onValueChange }} />);
    expect(screen.getByRole("button", { name: "Compact" })).toBeDisabled();

    rerender(<ExclusiveForm fieldProps={{ readOnly: true, onChange, onValueChange }} />);
    expect(screen.queryByRole("group", { name: "Interface density" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Compact" })).not.toBeInTheDocument();
    expect(screen.getByText("Not provided")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("applies option disabled state, rich rendering, per-option props, and protected binding props", () => {
    render(
      <ExclusiveForm
        fieldProps={{
          renderOption: option => <span>Rendered {option.label}</span>,
          getOptionProps: ((option: VireoFormToggleButtonGroupFieldOption<string>) => ({
            "data-option": option.value,
            selected: true,
            value: "overridden",
          })) as unknown as NonNullable<ExclusiveProps["getOptionProps"]>,
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Rendered Retired" })).toBeDisabled();
    const compact = screen.getByRole("button", { name: "Rendered Compact" });
    expect(compact).toHaveAttribute("data-option", "compact");
    expect(compact).toHaveAttribute("value", "compact");
    expect(compact).toHaveAttribute("aria-pressed", "false");
  });

  it("throws for duplicate scalar option values", () => {
    expect(() =>
      render(
        <ExclusiveForm
          fieldProps={{
            options: [
              { value: "same", label: "One" },
              { value: "same", label: "Duplicate" },
            ],
          }}
        />,
      ),
    ).toThrow("options must have unique values");
  });

  it("supports vertical layout, visual group props, and an empty option collection", () => {
    const { rerender } = render(
      <ExclusiveForm fieldProps={{ color: "success", fullWidth: false, orientation: "vertical", size: "small" }} />,
    );
    const group = screen.getByRole("group", { name: "Interface density" });
    expect(group).toHaveClass("MuiToggleButtonGroup-vertical");
    expect(screen.getByRole("button", { name: "Compact" })).toHaveClass(
      "MuiToggleButton-sizeSmall",
      "MuiToggleButton-success",
    );

    rerender(<ExclusiveForm fieldProps={{ options: [] }} />);
    expect(screen.getByText("Choose a density")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /Automatic|Compact|Comfortable|Retired/ })).toHaveLength(0);
  });

  it("runs slot and direct change callbacks before field updates and honors cancellation", async () => {
    const order: string[] = [];
    const user = userEvent.setup();
    render(
      <ExclusiveForm
        fieldProps={{
          onChange: event => {
            order.push("direct");
            event.preventDefault();
          },
          onValueChange: () => order.push("value"),
          slotProps: { toggleButtonGroup: { onChange: () => order.push("slot") } },
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(order).toEqual(["slot", "direct"]);
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "false");
  });

  it("composes blur handlers and lets cancellation preserve untouched state", () => {
    const onBlur = vi.fn((event: React.FocusEvent<HTMLElement>) => event.preventDefault());
    render(<ExclusiveForm fieldProps={{ onBlur }} />);
    fireEvent.blur(screen.getByRole("button", { name: "Compact" }));
    expect(onBlur).toHaveBeenCalledOnce();
    expect(screen.getByTestId("form").querySelector(".MuiFormControl-root")).not.toHaveClass(
      vireoFormToggleButtonGroupFieldClasses.touched,
    );
  });

  it("presents validation, helper relationships, required semantics, and Zod field issues", async () => {
    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { density: null as string | null },
        validationLogic: revalidateLogic(),
      });
      return (
        <form.Form>
          <form.Field
            name="density"
            validators={{ onDynamic: z.string().nullable().refine(Boolean, "Choose a density.") }}
          >
            {field => <field.ToggleButtonGroupField required aria-label="Density" options={options.slice(1, 3)} />}
          </form.Field>
          <form.SubmitButton>Save</form.SubmitButton>
        </form.Form>
      );
    }
    const user = userEvent.setup();
    render(<ZodForm />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    const error = await screen.findByText("Choose a density.");
    const group = screen.getByRole("group", { name: "Density" });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAttribute("aria-required");
    expect(group).toHaveAttribute("aria-describedby", error.id);
    const root = group.closest(".MuiFormControl-root");
    expect(root).toHaveAttribute("data-vireo-field-invalid", "true");
    expect(root).toHaveClass(
      vireoFormToggleButtonGroupFieldClasses.invalid,
      vireoFormToggleButtonGroupFieldClasses.errorVisible,
    );
  });

  it("keeps required and disableClearable independent and presents a direct error", () => {
    render(
      <ExclusiveForm
        initialValue="compact"
        fieldProps={{
          disableClearable: false,
          error: true,
          helperText: "Server rejected this density",
          required: true,
        }}
      />,
    );
    const group = screen.getByRole("group", { name: "Interface density" });
    const root = group.closest(".MuiFormControl-root");
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(root).toHaveClass(vireoFormToggleButtonGroupFieldClasses.errorVisible);
    expect(screen.getByText("Server rejected this density")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
  });

  it("focuses the selected enabled option when an invalid form is submitted", async () => {
    const user = userEvent.setup();
    render(<ExclusiveForm initialValue="compact" validate={() => "Invalid density"} />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Compact" })).toHaveFocus());
  });

  it("composes root and group refs and supports replacement slots and state classes", async () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} data-custom-root="true" />;
      },
    );
    const user = userEvent.setup();
    render(
      <ExclusiveForm
        fieldProps={{
          ref: rootRef,
          classes: { toggleButton: "custom-button" },
          slots: { root: CustomRoot, toggleButton: ToggleButton },
          slotProps: {
            root: state => ({ "data-has-value": state.hasValue }),
            toggleButtonGroup: { ref: groupRef },
          },
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(rootRef.current).toHaveAttribute("data-custom-root", "true");
    expect(rootRef.current).toHaveAttribute("data-has-value", "true");
    expect(groupRef.current).toBe(screen.getByRole("group", { name: "Interface density" }));
    expect(screen.getByRole("button", { name: "Compact" })).toHaveClass("custom-button");
  });

  it("uses theme default props and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME]: {
          defaultProps: { size: "small" },
          styleOverrides: { hasValue: { letterSpacing: "3px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <ExclusiveForm initialValue="compact" />
      </ThemeProvider>,
    );
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass(vireoFormToggleButtonGroupFieldClasses.hasValue);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(screen.getByRole("button", { name: "Compact" })).toHaveClass("MuiToggleButton-sizeSmall");
  });
});
