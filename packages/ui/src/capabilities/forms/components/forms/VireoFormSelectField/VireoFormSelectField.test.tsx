import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { Button, FormControl, ThemeProvider, createTheme, type FormControlProps } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { z } from "zod";
import { vireoFormSelectFieldClasses } from "./VireoFormSelectField.classes";
import { VIREO_FORM_SELECT_FIELD_NAME } from "./VireoFormSelectField.identity";
import type { VireoFormSelectFieldProps } from "./VireoFormSelectField.types";

const options = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "retired", label: "Retired" },
] as const;

type Option = (typeof options)[number];

type TestFormProps = {
  fieldProps?: Partial<VireoFormSelectFieldProps<Option, string>>;
  initialValue?: string | null;
  onSubmit?: Mock<() => void>;
  validate?: (value: string | null) => unknown;
};

function TestForm({ fieldProps, initialValue = null, onSubmit = vi.fn(() => undefined), validate }: TestFormProps) {
  const form = useVireoForm({ defaultValues: { teamId: initialValue }, onSubmit });

  return (
    <form.Form data-testid="form">
      <form.Field name="teamId" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.SelectField
            label="Team"
            placeholder="Choose a team"
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

async function chooseOption(name: string): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Team" }));
  await user.click(await screen.findByRole("option", { name }));
}

describe(VIREO_FORM_SELECT_FIELD_NAME, () => {
  it("binds a nullable scalar value and defaults to a full-width labelled select", () => {
    render(<TestForm />);

    const select = screen.getByRole("combobox", { name: "Team" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(select).toHaveTextContent("Choose a team");
    expect(document.querySelector('input[name="teamId"]')).toHaveValue("");
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormSelectFieldClasses.root);
    expect(root?.querySelector(`.${vireoFormSelectFieldClasses.inputLabel}`)).toBeInTheDocument();
    expect(root?.querySelector(`.${vireoFormSelectFieldClasses.select}`)).toBeInTheDocument();
  });

  it("keeps a selected value clear of its floating label when no placeholder is present", () => {
    render(<TestForm initialValue="alpha" fieldProps={{ placeholder: undefined }} />);

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root?.querySelector(`.${vireoFormSelectFieldClasses.inputLabel}`)).toHaveClass("MuiInputLabel-shrink");
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Alpha");
  });

  it("reserves space between the clear action and select caret", () => {
    render(<TestForm initialValue="alpha" />);

    const clearButton = screen.getByRole("button", { name: "Clear selection" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(clearButton).toHaveStyle({ marginInlineEnd: "20px" });
    expect(root?.querySelector(".MuiSelect-icon")).toBeInTheDocument();
  });

  it("selects and submits a string option value", async () => {
    const onSubmit = vi.fn<() => void>();
    render(<TestForm onSubmit={onSubmit} />);

    await chooseOption("Beta");
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Beta");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { teamId: "beta" } }));
  });

  it("preserves numeric option values rather than coercing them to text", async () => {
    const numericOptions = [
      { id: 10, label: "Ten" },
      { id: 20, label: "Twenty" },
    ];
    const onSubmit = vi.fn<() => void>();

    function NumericForm() {
      const form = useVireoForm({ defaultValues: { limit: null as number | null }, onSubmit });
      return (
        <form.Form>
          <form.Field name="limit">
            {field => (
              <field.SelectField
                label="Limit"
                options={numericOptions}
                getOptionValue={option => option.id}
                renderOption={option => option.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Save limit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<NumericForm />);
    await user.click(screen.getByRole("combobox", { name: "Limit" }));
    await user.click(await screen.findByRole("option", { name: "Twenty" }));
    await user.click(screen.getByRole("button", { name: "Save limit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { limit: 20 } }));
  });

  it("clears a selection through an accessible action and restores it on reset", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TestForm initialValue="alpha" fieldProps={{ clearLabel: "Clear team", onValueChange }} />);

    await user.click(screen.getByRole("button", { name: "Clear team" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Choose a team");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Alpha");
  });

  it("honors disabled options and can suppress the clear action", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestForm
        initialValue="alpha"
        fieldProps={{
          disableClearable: true,
          getOptionDisabled: option => option.id === "retired",
          onValueChange,
        }}
      />,
    );

    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    const retiredOption = await screen.findByRole("option", { name: "Retired" });
    expect(retiredOption).toHaveAttribute("aria-disabled", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("presents validation errors through the shared form policy and accessible helper text", async () => {
    render(<TestForm validate={value => (value === null ? "Choose a team." : undefined)} />);
    const select = screen.getByRole("combobox", { name: "Team" });

    await chooseOption("Alpha");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    await waitFor(() => expect(select).toHaveAttribute("aria-invalid", "true"));
    const error = await screen.findByText("Choose a team.");
    expect(select).toHaveAccessibleDescription("Choose a team.");
    expect(error).toHaveClass(vireoFormSelectFieldClasses.formHelperText);
    expect(select.closest(".MuiFormControl-root")).toHaveClass(
      vireoFormSelectFieldClasses.invalid,
      vireoFormSelectFieldClasses.errorVisible,
    );
  });

  it("presents field-level Standard Schema validation issues from Zod", async () => {
    const teamSchema = z.enum(["alpha", "beta"]).nullable().refine(Boolean, "Choose an active team.");

    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { teamId: null as string | null },
        validationLogic: revalidateLogic(),
      });
      return (
        <form.Form>
          <form.Field name="teamId" validators={{ onDynamic: teamSchema }}>
            {field => (
              <field.SelectField
                label="Team"
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

    const user = userEvent.setup();
    render(<ZodForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Choose an active team.")).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.click(await screen.findByRole("option", { name: "Alpha" }));
    await waitFor(() => expect(screen.queryByText("Choose an active team.")).not.toBeInTheDocument());
  });

  it("routes form-level Zod object issues without field validators", async () => {
    function ZodObjectForm() {
      const form = useVireoForm({
        defaultValues: { project: "", teamId: null as string | null },
        validationLogic: revalidateLogic(),
        validators: {
          onDynamic: z.object({
            project: z.string().min(2, "Enter a project."),
            teamId: z.enum(["alpha", "beta"]).nullable().refine(Boolean, "Choose a project team."),
          }),
        },
      });
      return (
        <form.Form>
          <form.Field name="project">{field => <field.TextField label="Project" />}</form.Field>
          <form.Field name="teamId">
            {field => (
              <field.SelectField
                label="Team"
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

    const user = userEvent.setup();
    render(<ZodObjectForm />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a project.")).toBeInTheDocument();
    expect(screen.getByText("Choose a project team.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Project" }), "Vireo");
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.click(await screen.findByRole("option", { name: "Beta" }));
    await waitFor(() => {
      expect(screen.queryByText("Enter a project.")).not.toBeInTheDocument();
      expect(screen.queryByText("Choose a project team.")).not.toBeInTheDocument();
    });
  });

  it("runs select and blur slot handlers first and honors cancellation", async () => {
    const onValueChange = vi.fn();
    const onBlur = vi.fn();
    const user = userEvent.setup();
    render(
      <TestForm
        initialValue="alpha"
        fieldProps={{
          onBlur,
          onValueChange,
          slotProps: {
            select: {
              onBlur: event => event.preventDefault(),
              onChange: event => event.preventDefault(),
            },
          },
        }}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.click(await screen.findByRole("option", { name: "Beta" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Alpha");

    fireEvent.blur(screen.getByRole("combobox", { name: "Team" }));
    expect(onBlur).not.toHaveBeenCalled();
    expect(screen.getByTestId("form").querySelector(".MuiFormControl-root")).not.toHaveClass(
      vireoFormSelectFieldClasses.touched,
    );
  });

  it("allows the clear-button slot handler to cancel clearing", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestForm
        initialValue="alpha"
        fieldProps={{
          onValueChange,
          slotProps: { clearButton: { onClick: event => event.preventDefault() } },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Team" })).toHaveTextContent("Alpha");
  });

  it("composes root and select-input refs with representative slot customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    let selectInput: unknown;

    function RefForm() {
      const form = useVireoForm({ defaultValues: { teamId: "alpha" as string | null } });
      return (
        <form.Form>
          <form.Field name="teamId">
            {field => (
              <field.SelectField
                ref={forwardedRef}
                inputRef={value => {
                  selectInput = value;
                }}
                label="Team"
                options={options}
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
    expect(forwardedRef.current).toHaveClass(vireoFormSelectFieldClasses.root);
    expect(selectInput).toEqual(expect.objectContaining({ value: "alpha" }));
  });

  it("supports replacement slots, owner-state slot props, and class customization", async () => {
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
          classes: { option: "custom-option" },
          slots: { root: CustomRoot },
          slotProps: { root: ownerState => ({ "data-dirty": ownerState.dirty }) },
        }}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    const alphaOption = await screen.findByRole("option", { name: "Alpha" });
    expect(alphaOption).toHaveClass(vireoFormSelectFieldClasses.option, "custom-option");
    await user.click(alphaOption);

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-dirty", "true");
  });

  it("uses theme default props and state or slot style overrides", async () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_SELECT_FIELD_NAME]: {
          defaultProps: { size: "small", variant: "filled" },
          styleOverrides: {
            hasValue: { letterSpacing: "3px" },
            option: { minHeight: "41px" },
          },
        },
      },
    });
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={theme}>
        <TestForm initialValue="alpha" />
      </ThemeProvider>,
    );

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass("MuiTextField-root", vireoFormSelectFieldClasses.hasValue);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
    expect(root?.querySelector(".MuiFilledInput-root")).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    expect(await screen.findByRole("option", { name: "Alpha" })).toHaveStyle({ minHeight: "41px" });
  });
});
