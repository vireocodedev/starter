import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { VireoFormFileFieldProps } from "./VireoFormFileField.types";
import { vireoFormFileFieldClasses } from "./VireoFormFileField.classes";
import { VIREO_FORM_FILE_FIELD_NAME } from "./VireoFormFileField.identity";

type TestFormProps = {
  fieldProps?: Omit<VireoFormFileFieldProps, "ref"> & { ref?: React.Ref<HTMLDivElement> };
  initialValue?: File | null;
  onSubmit?: ReturnType<typeof vi.fn>;
  validate?: (value: File | null) => unknown;
};

function TestForm({ fieldProps, initialValue = null, onSubmit = vi.fn(), validate }: TestFormProps) {
  const form = useVireoForm({ defaultValues: { attachment: initialValue }, onSubmit });
  return (
    <form.Form>
      <form.Field name="attachment" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.FileField
            helperText="Choose one attachment."
            {...fieldProps}
            slotProps={{ input: { "aria-label": "Attachment" }, ...fieldProps?.slotProps }}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <form.ResetButton>Reset</form.ResetButton>
    </form.Form>
  );
}

function fileInput(): HTMLInputElement {
  return screen.getByLabelText("Attachment");
}

function fieldRoot(): HTMLElement {
  const root = document.querySelector(`.${vireoFormFileFieldClasses.root}`);
  if (!root) throw new Error("File-field root was not rendered.");
  return root as HTMLElement;
}

describe(VIREO_FORM_FILE_FIELD_NAME, () => {
  it("binds a single File | null value and exposes native file-picker attributes", () => {
    render(<TestForm fieldProps={{ accept: "image/*,.pdf", capture: "environment", required: true }} />);

    expect(screen.getByText("No file selected")).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass(vireoFormFileFieldClasses.empty);
    expect(fileInput()).toHaveAttribute("accept", "image/*,.pdf");
    expect(fileInput()).toHaveAttribute("capture", "environment");
    expect(fileInput()).toBeRequired();
    expect(fileInput()).not.toHaveAttribute("multiple");
  });

  it("selects, displays, submits, clears, and resets one file", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const file = new File(["report"], "quarterly-report.pdf", { type: "application/pdf" });
    render(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(fileInput(), { target: { files: [file] } });
    expect(screen.getByText("quarterly-report.pdf")).toHaveAttribute("title", "quarterly-report.pdf");
    expect(screen.getByText("6 B")).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass(vireoFormFileFieldClasses.populated);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ value: { attachment: file } }));

    await user.click(screen.getByRole("button", { name: "Clear selected file" }));
    expect(screen.getByText("No file selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("No file selected")).toBeInTheDocument();
  });

  it("measures the stable metadata column instead of repeatedly shrinking the displayed filename", () => {
    const file = new File(["brand guide"], "brand-guide.pdf", { type: "application/pdf" });
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains(vireoFormFileFieldClasses.metadata)) return 500;
      if (this.classList.contains(vireoFormFileFieldClasses.fileSize)) return 40;
      if (this.classList.contains(vireoFormFileFieldClasses.fileName)) return 60;
      return 0;
    });
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      font: "",
      measureText: value => ({ width: value.length * 8 }) as TextMetrics,
    } as CanvasRenderingContext2D);

    try {
      render(<TestForm initialValue={file} />);
      expect(screen.getByText("brand-guide.pdf")).toBeInTheDocument();
    } finally {
      clientWidth.mockRestore();
      getContext.mockRestore();
    }
  });

  it("rejects unsupported types before size and preserves the current value", () => {
    const existing = new File(["existing"], "existing.png", { type: "image/png" });
    const rejected = new File(["far too large"], "payload.txt", { type: "text/plain" });
    const onFileRejected = vi.fn();
    render(
      <TestForm
        initialValue={existing}
        fieldProps={{ accept: "image/*", maxSize: 1, onFileRejected, unsupportedTypeText: "Images only." }}
      />,
    );

    fireEvent.change(fileInput(), { target: { files: [rejected] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Images only.");
    expect(screen.getByText("existing.png")).toBeInTheDocument();
    expect(onFileRejected).toHaveBeenCalledWith({ file: rejected, reason: "type" });
  });

  it("rejects oversized accepted files with the decimal size message", () => {
    const rejected = new File(["1234567890"], "large.png", { type: "image/png" });
    render(<TestForm fieldProps={{ accept: ".PNG", maxSize: 5 }} />);

    fireEvent.change(fileInput(), { target: { files: [rejected] } });
    expect(screen.getByRole("alert")).toHaveTextContent("File must be 5 B or smaller.");
    expect(screen.getByText("No file selected")).toBeInTheDocument();
  });

  it("takes only the first dropped file and renders the active drop surface", () => {
    const first = new File(["first"], "first.pdf", { type: "application/pdf" });
    const second = new File(["second"], "second.pdf", { type: "application/pdf" });
    render(<TestForm fieldProps={{ accept: "application/pdf" }} />);
    const root = fieldRoot();
    const dataTransfer = {
      dropEffect: "none",
      files: [first, second],
      items: [{ type: "application/pdf" }],
      types: ["Files"],
    };

    fireEvent.dragEnter(root, { dataTransfer });
    expect(screen.getByText("Drop file here")).toBeInTheDocument();
    expect(root).toHaveClass(vireoFormFileFieldClasses.dragActive);
    fireEvent.drop(root, { dataTransfer });

    expect(screen.getByText("first.pdf")).toBeInTheDocument();
    expect(screen.queryByText("second.pdf")).not.toBeInTheDocument();
  });

  it("blocks selection, drop, and clear while disabled or read-only", () => {
    const existing = new File(["locked"], "locked.pdf", { type: "application/pdf" });
    const replacement = new File(["new"], "new.pdf", { type: "application/pdf" });
    const { rerender } = render(<TestForm initialValue={existing} fieldProps={{ disabled: true }} />);

    expect(screen.getByRole("button", { name: "Replace file" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear selected file" })).toBeDisabled();
    fireEvent.change(fileInput(), { target: { files: [replacement] } });
    expect(screen.getByText("locked.pdf")).toBeInTheDocument();

    rerender(<TestForm initialValue={existing} fieldProps={{ readOnly: true }} />);
    expect(fieldRoot()).toHaveAttribute("aria-readonly", "true");
    expect(screen.getByRole("button", { name: "Replace file" })).toBeDisabled();
  });

  it("renders an opt-in preview on a dedicated line", () => {
    const initial = new File(["image"], "cover.png", { type: "image/png" });
    const Preview = ({ file }: { file: File }) => <div>Previewing {file.name}</div>;
    render(<TestForm initialValue={initial} fieldProps={{ previewRenderer: Preview }} />);

    expect(screen.getByText("Previewing cover.png").parentElement).toHaveClass(
      vireoFormFileFieldClasses.previewContainer,
    );
  });

  it("presents form validation only according to the shared error policy", async () => {
    const user = userEvent.setup();
    render(<TestForm validate={value => (value ? undefined : "Choose the required file.")} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Choose the required file.")).toBeInTheDocument();
    expect(fileInput()).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(fileInput(), { target: { files: [new File(["ok"], "ok.pdf")] } });
    await waitFor(() => expect(screen.queryByText("Choose the required file.")).not.toBeInTheDocument());
  });

  it("composes root and input refs and resolves owner-state slot props", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const inputSlotRef = React.createRef<HTMLInputElement>();

    render(
      <TestForm
        fieldProps={{
          ref: forwardedRef,
          inputRef,
          slots: { root: "section" },
          slotProps: {
            root: ownerState => ({
              ref: rootSlotRef,
              "aria-label": "Customized file field",
              "data-empty": ownerState.empty,
            }),
            input: { ref: inputSlotRef, "aria-label": "Attachment" },
          },
        }}
      />,
    );

    const root = screen.getByRole("region", { name: "Customized file field" });
    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(forwardedRef.current).toBe(root);
    expect(root).toHaveAttribute("data-empty", "true");
    expect(inputRef.current).toBe(inputSlotRef.current);
    expect(inputRef.current).toBe(fileInput());
  });

  it("uses theme default props and style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_FILE_FIELD_NAME]: {
          defaultProps: { chooseFileLabel: "Browse", className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <TestForm />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Browse" })).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass("theme-default-class");
    expect(fieldRoot()).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
