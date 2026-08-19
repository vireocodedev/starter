import { VireoDateInput } from "./VireoDateInput";
import { vireoDateInputClasses } from "./VireoDateInput.classes";
import { VIREO_DATE_INPUT_NAME } from "./VireoDateInput.identity";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

function renderDateInput(element: React.ReactElement) {
  return render(<LocalizationProvider dateAdapter={AdapterDayjs}>{element}</LocalizationProvider>);
}

describe(VIREO_DATE_INPUT_NAME, () => {
  it("renders an empty date field with only required props", () => {
    renderDateInput(<VireoDateInput value={null} onChange={vi.fn()} pickerProps={{ label: "Start date" }} />);
    expect(screen.getByLabelText("Start date")).toHaveValue("");
  });

  it("forwards the root ref and composes root classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderDateInput(
      <VireoDateInput
        ref={ref}
        value={null}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        pickerProps={{ label: "Start date" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoDateInputClasses.root, "custom-root");
  });

  it("passes validation state and input refs to the picker field", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    renderDateInput(
      <VireoDateInput
        value={null}
        onChange={vi.fn()}
        error
        helperText="Choose a valid date"
        inputRef={inputRef}
        pickerProps={{ label: "Start date" }}
      />,
    );
    expect(inputRef.current).toBe(screen.getByLabelText("Start date"));
    expect(screen.getByText("Choose a valid date")).toBeInTheDocument();
  });
});
