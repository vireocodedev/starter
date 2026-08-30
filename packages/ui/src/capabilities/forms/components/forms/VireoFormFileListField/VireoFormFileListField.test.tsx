import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { vireoFormFileListFieldClasses } from "./VireoFormFileListField.classes";
import { VIREO_FORM_FILE_LIST_FIELD_NAME } from "./VireoFormFileListField.identity";
import type { VireoFormFileListFieldProps } from "./VireoFormFileListField.types";

type TestFormProps = {
  fieldProps?: Omit<VireoFormFileListFieldProps, "ref"> & { ref?: React.Ref<HTMLDivElement> };
  initialValue?: File[];
  onSubmit?: Mock<() => void>;
  validate?: (value: File[]) => unknown;
};

function TestForm({ fieldProps, initialValue = [], onSubmit = vi.fn(() => undefined), validate }: TestFormProps) {
  const form = useVireoForm({ defaultValues: { attachments: initialValue }, onSubmit });
  return (
    <form.Form>
      <form.Field name="attachments" validators={validate ? { onChange: ({ value }) => validate(value) } : undefined}>
        {field => (
          <field.FileListField
            helperText="Choose attachments."
            {...fieldProps}
            slotProps={{ input: { "aria-label": "Attachments" }, ...fieldProps?.slotProps }}
          />
        )}
      </form.Field>
      <form.SubmitButton>Submit</form.SubmitButton>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
    </form.Form>
  );
}

function fileInput(): HTMLInputElement {
  return screen.getByLabelText("Attachments");
}

function fieldRoot(): HTMLElement {
  const root = document.querySelector(`.${vireoFormFileListFieldClasses.root}`);
  if (!root) throw new Error("File-list-field root was not rendered.");
  return root as HTMLElement;
}

function file(name: string, contents = "data", type = "application/pdf", lastModified = 1): File {
  return new File([contents], name, { type, lastModified });
}

describe(VIREO_FORM_FILE_LIST_FIELD_NAME, () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      font: "",
      measureText: value =>
        ({
          width: value.length * 8,
        }) as TextMetrics,
    } as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("binds the canonical empty File[] value and exposes multiple-picker semantics", () => {
    render(<TestForm fieldProps={{ accept: "image/*,.pdf", capture: "environment", required: true }} />);

    expect(screen.getByText("0 files")).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass(
      vireoFormFileListFieldClasses.empty,
      vireoFormFileListFieldClasses.fullWidth,
      vireoFormFileListFieldClasses.required,
    );
    expect(fileInput()).toHaveAttribute("accept", "image/*,.pdf");
    expect(fileInput()).toHaveAttribute("capture", "environment");
    expect(fileInput()).toHaveAttribute("multiple");
    expect(fileInput()).toHaveAttribute("aria-required", "true");
    expect(fileInput()).toBeRequired();
  });

  it("appends repeated selections in order and submits the complete collection", async () => {
    const initial = file("initial.pdf", "one");
    const second = file("second.pdf", "two");
    const third = file("third.pdf", "three");
    const onFilesAdded = vi.fn();
    const onSubmit = vi.fn<() => void>();
    const user = userEvent.setup();
    render(<TestForm initialValue={[initial]} onSubmit={onSubmit} fieldProps={{ onFilesAdded }} />);

    fireEvent.change(fileInput(), { target: { files: [second, third] } });
    expect(
      screen
        .getAllByRole("listitem")
        .slice(0, 3)
        .map(item => item.getAttribute("aria-label")),
    ).toEqual(["initial.pdf, file 1 of 3", "second.pdf, file 2 of 3", "third.pdf, file 3 of 3"]);
    expect(onFilesAdded).toHaveBeenCalledWith([second, third], [initial, second, third]);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ value: { attachments: [initial, second, third] } }),
    );
  });

  it("partially accepts a batch and reports every deterministic rejection reason", () => {
    const existing = file("existing.pdf", "123");
    const unsupported = file("notes.txt", "1", "text/plain");
    const oversized = file("large.pdf", "123456");
    const duplicate = file("existing.pdf", "123");
    const acceptedA = file("accepted-a.pdf", "1234");
    const totalOverflow = file("total-overflow.pdf", "1234");
    const acceptedB = file("accepted-b.pdf", "1");
    const countOverflow = file("count-overflow.pdf", "1");
    const onFilesAdded = vi.fn();
    const onFilesRejected = vi.fn();
    render(
      <TestForm
        initialValue={[existing]}
        fieldProps={{
          accept: "application/pdf",
          maxFiles: 3,
          maxSize: 5,
          maxTotalSize: 10,
          onFilesAdded,
          onFilesRejected,
        }}
      />,
    );

    fireEvent.change(fileInput(), {
      target: { files: [unsupported, oversized, duplicate, acceptedA, totalOverflow, acceptedB, countOverflow] },
    });

    expect(onFilesAdded).toHaveBeenCalledWith([acceptedA, acceptedB], [existing, acceptedA, acceptedB]);
    expect(onFilesRejected).toHaveBeenCalledWith([
      { file: unsupported, reason: "type" },
      { file: oversized, reason: "size" },
      { file: duplicate, reason: "duplicate" },
      { file: totalOverflow, reason: "totalSize" },
      { file: countOverflow, reason: "maxFiles" },
    ]);
    expect(screen.getByText("notes.txt").closest("li")).toHaveTextContent("This file type is not accepted.");
    expect(screen.getAllByText("existing.pdf").at(-1)?.closest("li")).toHaveTextContent("already selected");
  });

  it("supports custom duplicate identity and explicit duplicate allowance", () => {
    const first = file("report.pdf", "same", "application/pdf", 1);
    const second = file("report.pdf", "same", "application/pdf", 2);
    const { rerender } = render(
      <TestForm initialValue={[first]} fieldProps={{ getFileKey: selected => selected.name }} />,
    );

    fireEvent.change(fileInput(), { target: { files: [second] } });
    expect(screen.getByText(/already selected/)).toBeInTheDocument();

    rerender(<TestForm initialValue={[first]} fieldProps={{ allowDuplicates: true }} />);
    fireEvent.change(fileInput(), { target: { files: [second] } });
    expect(screen.getByText("2 files")).toBeInTheDocument();
  });

  it("removes one file, clears all files, and reports lifecycle callbacks", async () => {
    const first = file("first.pdf");
    const second = file("second.pdf");
    const onFileRemoved = vi.fn();
    const onFilesCleared = vi.fn();
    const user = userEvent.setup();
    render(<TestForm initialValue={[first, second]} fieldProps={{ onFileRemoved, onFilesCleared }} />);

    await user.click(screen.getByRole("button", { name: "Remove first.pdf" }));
    expect(onFileRemoved).toHaveBeenCalledWith(first, 0);
    expect(screen.queryByText("first.pdf")).not.toBeInTheDocument();

    fireEvent.change(fileInput(), { target: { files: [first] } });
    await user.click(screen.getByRole("button", { name: "Clear all selected files" }));
    expect(onFilesCleared).toHaveBeenCalledWith([second, first]);
    expect(screen.getByText("0 files")).toBeInTheDocument();
  });

  it("disables additions at capacity and restores them after removal", async () => {
    const user = userEvent.setup();
    render(<TestForm initialValue={[file("only.pdf")]} fieldProps={{ maxFiles: 1 }} />);

    expect(screen.getByRole("button", { name: "Add more files" })).toBeDisabled();
    expect(screen.getByText("Maximum of 1 files selected")).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass(vireoFormFileListFieldClasses.capacityReached);

    await user.click(screen.getByRole("button", { name: "Remove only.pdf" }));
    expect(screen.getByRole("button", { name: "Choose files" })).toBeEnabled();
  });

  it("reorders with the keyboard and announces the new position", () => {
    const first = file("first.pdf");
    const second = file("second.pdf");
    const third = file("third.pdf");
    render(<TestForm initialValue={[first, second, third]} fieldProps={{ reorderable: true }} />);

    fireEvent.keyDown(screen.getByRole("button", { name: /Reorder second\.pdf/ }), { key: "ArrowUp" });
    expect(screen.getByText("Moved second.pdf to position 1 of 3.")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("listitem")
        .slice(0, 3)
        .map(item => item.getAttribute("aria-label")),
    ).toEqual(["second.pdf, file 1 of 3", "first.pdf, file 2 of 3", "third.pdf, file 3 of 3"]);
  });

  it("reorders through the dedicated pointer drag handle", () => {
    render(<TestForm initialValue={[file("first.pdf"), file("second.pdf")]} fieldProps={{ reorderable: true }} />);
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      files: [],
      items: [],
      types: ["application/x-vireo-file-list-row"],
      setData: vi.fn(),
    };

    fireEvent.dragStart(screen.getByRole("button", { name: /Reorder first\.pdf/ }), { dataTransfer });
    const secondRow = screen.getByRole("listitem", { name: "second.pdf, file 2 of 2" });
    fireEvent.dragOver(secondRow, { dataTransfer });
    fireEvent.drop(secondRow, { dataTransfer });
    expect(
      screen
        .getAllByRole("listitem")
        .slice(0, 2)
        .map(item => item.getAttribute("aria-label")),
    ).toEqual(["second.pdf, file 1 of 2", "first.pdf, file 2 of 2"]);
  });

  it("appends all externally dropped files and exposes the active chooser state", () => {
    const first = file("first.pdf");
    const second = file("second.pdf");
    render(<TestForm fieldProps={{ accept: "application/pdf" }} />);
    const chooser = document.querySelector(`.${vireoFormFileListFieldClasses.chooser}`) as HTMLElement;
    const dataTransfer = {
      dropEffect: "none",
      files: [first, second],
      items: [{ type: "application/pdf" }, { type: "application/pdf" }],
      types: ["Files"],
    };

    fireEvent.dragEnter(chooser, { dataTransfer });
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass(vireoFormFileListFieldClasses.dragActive);
    fireEvent.drop(chooser, { dataTransfer });
    expect(screen.getByText("2 files")).toBeInTheDocument();
  });

  it("blocks every mutation while disabled or read-only", () => {
    const initial = file("locked.pdf");
    const replacement = file("new.pdf");
    const { rerender } = render(
      <TestForm initialValue={[initial]} fieldProps={{ disabled: true, reorderable: true }} />,
    );

    expect(screen.getByRole("button", { name: "Add more files" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove locked.pdf" })).toBeDisabled();
    fireEvent.change(fileInput(), { target: { files: [replacement] } });
    expect(screen.getByText("1 file")).toBeInTheDocument();

    rerender(<TestForm initialValue={[initial]} fieldProps={{ readOnly: true }} />);
    expect(screen.getByText("locked.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add more files" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove locked.pdf" })).not.toBeInTheDocument();
  });

  it("renders one opt-in preview on each file row", () => {
    const Preview = ({ file: selected }: { file: File }) => <div>Previewing {selected.name}</div>;
    render(
      <TestForm initialValue={[file("first.png"), file("second.png")]} fieldProps={{ previewRenderer: Preview }} />,
    );

    expect(screen.getByText("Previewing first.png").parentElement).toHaveClass(
      vireoFormFileListFieldClasses.previewContainer,
    );
    expect(screen.getByText("Previewing second.png")).toBeInTheDocument();
  });

  it("keeps short filenames complete when the stable metadata column has room", () => {
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains(vireoFormFileListFieldClasses.metadata)) return 500;
      if (this.classList.contains(vireoFormFileListFieldClasses.fileSize)) return 40;
      return 0;
    });
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      font: "",
      measureText: value =>
        ({
          width: value.length * 8,
        }) as TextMetrics,
    } as CanvasRenderingContext2D);

    try {
      render(<TestForm initialValue={[file("brand-guide.pdf")]} />);
      expect(screen.getByText("brand-guide.pdf")).toBeInTheDocument();
    } finally {
      clientWidth.mockRestore();
      getContext.mockRestore();
    }
  });

  it("shows validation through the shared form policy", async () => {
    const user = userEvent.setup();
    render(<TestForm validate={value => (value.length > 0 ? undefined : "Choose at least one file.")} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Choose at least one file.")).toBeInTheDocument();
    expect(fileInput()).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(fileInput(), { target: { files: [file("valid.pdf")] } });
    await waitFor(() => expect(screen.queryByText("Choose at least one file.")).not.toBeInTheDocument());
  });

  it("composes refs, classes, row owner-state props, and cancelable slot events", async () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const user = userEvent.setup();
    render(
      <TestForm
        initialValue={[file("kept.pdf"), file("also-kept.pdf")]}
        fieldProps={{
          ref: forwardedRef,
          inputRef,
          classes: { root: "consumer-root" },
          slotProps: {
            root: ownerState => ({ ref: rootSlotRef, "data-count": ownerState.fileCount }),
            fileRow: ownerState => ({ "data-first": ownerState.first }),
            removeButton: { onClick: event => event.preventDefault() },
          },
        }}
      />,
    );

    expect(forwardedRef.current).toBe(rootSlotRef.current);
    expect(inputRef.current).toBe(fileInput());
    expect(fieldRoot()).toHaveClass(vireoFormFileListFieldClasses.root, "consumer-root");
    expect(fieldRoot()).toHaveAttribute("data-count", "2");
    expect(screen.getByRole("listitem", { name: /^kept\.pdf/ })).toHaveAttribute("data-first", "true");
    await user.click(screen.getByRole("button", { name: "Remove kept.pdf" }));
    expect(screen.getByText("2 files")).toBeInTheDocument();
  });

  it("uses theme default props and representative slot overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_FILE_LIST_FIELD_NAME]: {
          defaultProps: { chooseFilesLabel: "Browse attachments", className: "theme-default-class" },
          styleOverrides: { chooser: { borderColor: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <TestForm />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Browse attachments" })).toBeInTheDocument();
    expect(fieldRoot()).toHaveClass("theme-default-class");
    expect(document.querySelector(`.${vireoFormFileListFieldClasses.chooser}`)).toHaveStyle({
      borderColor: "rgb(123, 45, 67)",
    });
  });
});
