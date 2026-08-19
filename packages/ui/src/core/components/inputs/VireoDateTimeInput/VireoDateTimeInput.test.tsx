import { VireoDateTimeInput } from "./VireoDateTimeInput";
import { vireoDateTimeInputClasses } from "./VireoDateTimeInput.classes";
import { VIREO_DATE_TIME_INPUT_NAME } from "./VireoDateTimeInput.identity";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

function renderInput(element: React.ReactElement) {
  return render(<LocalizationProvider dateAdapter={AdapterDayjs}>{element}</LocalizationProvider>);
}

describe(VIREO_DATE_TIME_INPUT_NAME, () => {
  it("renders an empty date-time field with only required props", () => {
    renderInput(<VireoDateTimeInput value={null} onChange={vi.fn()} pickerProps={{ label: "Scheduled for" }} />);
    expect(screen.getByLabelText("Scheduled for")).toHaveValue("");
  });
  it("forwards the root ref and composes root classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderInput(
      <VireoDateTimeInput
        ref={ref}
        value={null}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        pickerProps={{ label: "Scheduled for" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoDateTimeInputClasses.root, "custom-root");
  });
  it("passes validation feedback to the field", () => {
    renderInput(
      <VireoDateTimeInput
        value={null}
        onChange={vi.fn()}
        error
        helperText="Required"
        pickerProps={{ label: "Scheduled for" }}
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
