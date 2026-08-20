import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { defaultVireoFormErrorFormatter } from "@/capabilities/forms/utils/vireoFormErrors";
import { Button, FormControl, MenuItem, ThemeProvider, createTheme, type FormControlProps } from "@mui/material";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { vireoFormTextFieldClasses } from "./VireoFormTextField.classes";
import { VIREO_FORM_TEXT_FIELD_NAME } from "./VireoFormTextField.identity";
import type { VireoFormTextFieldProps } from "./VireoFormTextField.types";

type TestFormProps = {
  fieldProps?: VireoFormTextFieldProps;
  initialValue?: string;
  validate?: (value: string) => unknown;
};

function TestForm({
  fieldProps,
  initialValue = "",
  validate = value => (!value ? "Name is required." : undefined),
}: TestFormProps) {
  const form = useVireoForm({
    defaultValues: { name: initialValue },
    onSubmit: () => undefined,
  });

  return (
    <form.Form data-testid="form">
      <form.Field
        name="name"
        validators={{
          onMount: ({ value }) => validate(value),
          onBlur: ({ value }) => validate(value),
          onChange: ({ value }) => validate(value),
        }}
      >
        {field => <field.TextField label="Name" helperText="Optional guidance" {...fieldProps} />}
      </form.Field>
      <Button type="submit">Submit</Button>
    </form.Form>
  );
}

describe(VIREO_FORM_TEXT_FIELD_NAME, () => {
  it("binds the current string field and defaults to full width", () => {
    render(<TestForm initialValue="Northstar" />);

    const input = screen.getByRole("textbox", { name: "Name" });
    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");

    expect(input).toHaveAttribute("name", "name");
    expect(input).toHaveValue("Northstar");
    expect(input).toHaveClass(vireoFormTextFieldClasses.htmlInput);
    expect(root).toHaveClass("MuiFormControl-fullWidth", vireoFormTextFieldClasses.root);

    fireEvent.change(input, { target: { value: "Atlas" } });
    expect(input).toHaveValue("Atlas");
    expect(root).toHaveClass(vireoFormTextFieldClasses.dirty);
  });

  it("preserves MUI's native-input reset when the html-input slot is not replaced", () => {
    render(<TestForm initialValue="Northstar" />);

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveStyle({
      background: "none",
      border: "0px",
      boxSizing: "content-box",
      display: "block",
      width: "100%",
    });
  });

  it("adds stable utility classes to every rendered MUI slot", () => {
    const onSelectChange = vi.fn();
    render(
      <TestForm
        initialValue="Northstar"
        fieldProps={{
          helperText: "Guidance",
          select: true,
          children: [
            <MenuItem key="northstar" value="Northstar">
              Northstar
            </MenuItem>,
            <MenuItem key="atlas" value="Atlas">
              Atlas
            </MenuItem>,
          ],
          slotProps: { select: { onChange: onSelectChange } },
        }}
      />,
    );

    const root = screen.getByTestId("form").querySelector(".MuiFormControl-root");
    expect(root).toHaveClass(vireoFormTextFieldClasses.root);
    expect(root?.querySelector("label")).toHaveClass(vireoFormTextFieldClasses.inputLabel);
    expect(root?.querySelector(".MuiInputBase-root")).toHaveClass(
      vireoFormTextFieldClasses.input,
      vireoFormTextFieldClasses.select,
    );
    expect(root?.querySelector(".MuiFormHelperText-root")).toHaveClass(vireoFormTextFieldClasses.formHelperText);
    expect(root?.querySelector(".MuiSelect-select")).toHaveClass(vireoFormTextFieldClasses.htmlInput);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Name" }));
    fireEvent.click(screen.getByRole("option", { name: "Atlas" }));
    expect(onSelectChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("combobox", { name: "Name" })).toHaveTextContent("Atlas");
  });

  it("keeps validation invalidity accessible while delaying its message until touch", async () => {
    render(<TestForm />);
    const input = screen.getByRole("textbox", { name: "Name" });

    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("Optional guidance")).toBeInTheDocument();

    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByText("Name is required.")).toBeInTheDocument());

    const root = input.closest(".MuiFormControl-root");
    expect(root).toHaveClass(
      vireoFormTextFieldClasses.touched,
      vireoFormTextFieldClasses.invalid,
      vireoFormTextFieldClasses.errorVisible,
    );
  });

  it("reveals an untouched validation error after submission", async () => {
    render(<TestForm />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(screen.getByText("Name is required.")).toBeInTheDocument());
  });

  it("submits on the first attempt after correcting a submitted error without blurring first", async () => {
    const onSubmit = vi.fn();

    function CorrectedSubmissionForm() {
      const form = useVireoForm({
        defaultValues: { name: "" },
        onSubmit,
        validationLogic: revalidateLogic(),
      });

      return (
        <form.Form>
          <form.Field
            name="name"
            validators={{
              onDynamic: ({ value }) => (value.trim() ? undefined : "Name is required."),
            }}
          >
            {field => <field.TextField label="Name" />}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<CorrectedSubmissionForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Name is required.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "TEST");
    await waitFor(() => expect(screen.queryByText("Name is required.")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { name: "TEST" } }));
  });

  it("presents Standard Schema validation issues from Zod", async () => {
    function ZodForm() {
      const form = useVireoForm({
        defaultValues: { email: "" },
        validationLogic: revalidateLogic(),
      });

      return (
        <form.Form>
          <form.Field name="email" validators={{ onDynamic: z.string().email("Enter a valid email address.") }}>
            {field => <field.TextField label="Email" />}
          </form.Field>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.Form>
      );
    }

    const user = userEvent.setup();
    render(<ZodForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Email" }), "developer@example.com");
    await waitFor(() => expect(screen.queryByText("Enter a valid email address.")).not.toBeInTheDocument());
  });

  it("supports field error-display and formatter overrides", async () => {
    render(
      <TestForm
        initialValue="valid"
        validate={() => ({ code: "REQUIRED", message: "Schema message" })}
        fieldProps={{ errorDisplay: "always", formatError: error => `Formatted: ${(error as { code: string }).code}` }}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "invalid" } });
    await waitFor(() => expect(screen.getByText("Formatted: REQUIRED")).toBeInTheDocument());
  });

  it("does not stringify unknown validation objects or fall back to consumer helper text", async () => {
    render(
      <TestForm
        initialValue="valid"
        validate={() => ({ code: "UNKNOWN" })}
        fieldProps={{ errorDisplay: "always", helperText: "Should be hidden" }}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "invalid" } });

    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(screen.queryByText("Should be hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
  });

  it("recognizes strings, Errors, Standard Schema issues, and nested error arrays safely", () => {
    expect(defaultVireoFormErrorFormatter("Required")).toBe("Required");
    expect(defaultVireoFormErrorFormatter(new Error("Failed"))).toBe("Failed");
    expect(defaultVireoFormErrorFormatter({ message: "Schema issue" })).toBe("Schema issue");
    expect(defaultVireoFormErrorFormatter([undefined, [{ message: "Nested issue" }]])).toBe("Nested issue");
    expect(defaultVireoFormErrorFormatter({ code: "UNKNOWN" })).toBeUndefined();
  });

  it("can suppress validation messages without suppressing invalid accessibility", async () => {
    render(<TestForm fieldProps={{ errorDisplay: "never" }} />);
    const input = screen.getByRole("textbox", { name: "Name" });

    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("Optional guidance")).toBeInTheDocument();
    expect(screen.queryByText("Name is required.")).not.toBeInTheDocument();
  });

  it("runs consumer handlers before field updates and honors cancellation", () => {
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => event.preventDefault());
    const onBlur = vi.fn((event: React.FocusEvent<HTMLInputElement>) => event.preventDefault());
    render(<TestForm initialValue="Northstar" fieldProps={{ onBlur, onChange }} />);

    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "Atlas" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input).toHaveValue("Northstar");
    expect(input.closest(".MuiFormControl-root")).not.toHaveClass(vireoFormTextFieldClasses.touched);
  });

  it("composes root and native-input refs with slot refs", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLElement>();
    const htmlInputSlotRef = React.createRef<HTMLInputElement>();

    function RefForm() {
      const form = useVireoForm({ defaultValues: { name: "Northstar" } });
      return (
        <form.Form>
          <form.Field name="name">
            {field => (
              <field.TextField
                ref={forwardedRef}
                inputRef={inputRef}
                label="Name"
                slotProps={{ root: { ref: rootSlotRef }, htmlInput: { ref: htmlInputSlotRef } }}
              />
            )}
          </form.Field>
        </form.Form>
      );
    }

    render(<RefForm />);
    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toHaveClass(vireoFormTextFieldClasses.root);
    expect(inputRef.current).toBe(htmlInputSlotRef.current);
    expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Name" }));
  });

  it("supports owner-state slot props, replacement slots, read-only state, and class customization", () => {
    const CustomRoot = React.forwardRef<HTMLDivElement, FormControlProps & { ownerState?: unknown }>(
      function CustomRoot({ ownerState: _ownerState, ...props }, ref) {
        void _ownerState;
        return <FormControl {...props} ref={ref} />;
      },
    );

    render(
      <TestForm
        initialValue="Northstar"
        fieldProps={{
          classes: { readOnly: "custom-read-only" },
          readOnly: true,
          slots: { root: CustomRoot },
          slotProps: { root: ownerState => ({ "data-read-only": ownerState.readOnly }) },
        }}
      />,
    );

    const root = screen.getByTestId("form").querySelector("[data-read-only='true']");
    expect(root).toHaveClass(vireoFormTextFieldClasses.readOnly, "custom-read-only");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("readonly");
  });

  it("reports submission state without automatically disabling the field", async () => {
    let finishSubmission: (() => void) | undefined;
    const pendingSubmission = new Promise<void>(resolve => {
      finishSubmission = resolve;
    });

    function PendingForm() {
      const form = useVireoForm({
        defaultValues: { name: "Northstar" },
        onSubmit: () => pendingSubmission,
      });
      return (
        <form.Form>
          <form.Field name="name">{field => <field.TextField label="Name" />}</form.Field>
          <Button type="submit">Submit</Button>
        </form.Form>
      );
    }

    render(<PendingForm />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    const input = screen.getByRole("textbox", { name: "Name" });
    const root = input.closest(".MuiFormControl-root");

    await waitFor(() => expect(root).toHaveClass(vireoFormTextFieldClasses.submitting));
    expect(input).not.toBeDisabled();

    await act(async () => finishSubmission?.());
    await waitFor(() => expect(root).not.toHaveClass(vireoFormTextFieldClasses.submitting));
  });

  it("supports theme defaults plus root, state, and non-root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_TEXT_FIELD_NAME]: {
          defaultProps: { size: "small" },
          styleOverrides: {
            root: { marginTop: 11 },
            htmlInput: { letterSpacing: "3px" },
            inputLabel: { color: "rgb(123, 45, 67)" },
            readOnly: { opacity: 0.75 },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <TestForm initialValue="Northstar" fieldProps={{ readOnly: true }} />
      </ThemeProvider>,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    const root = input.closest(".MuiFormControl-root");
    expect(root).toHaveClass("MuiTextField-root", vireoFormTextFieldClasses.readOnly);
    expect(root).toHaveStyle({ marginTop: "11px", opacity: "0.75" });
    expect(input).toHaveStyle({ letterSpacing: "3px" });
    expect(root?.querySelector("label")).toHaveStyle({ color: "rgb(123, 45, 67)" });
    expect(root?.querySelector(".MuiInputBase-sizeSmall")).toBeInTheDocument();
  });
});
