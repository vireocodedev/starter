import { VireoTimeInput } from "./VireoTimeInput";
import { vireoTimeInputClasses } from "./VireoTimeInput.classes";
import { VIREO_TIME_INPUT_NAME } from "./VireoTimeInput.identity";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const renderInput = (element: React.ReactElement) =>
  render(<LocalizationProvider dateAdapter={AdapterDayjs}>{element}</LocalizationProvider>);
describe(VIREO_TIME_INPUT_NAME, () => {
  it("renders an empty time field with only required props", () => {
    renderInput(<VireoTimeInput value={null} onChange={vi.fn()} pickerProps={{ label: "Start time" }} />);
    expect(screen.getByLabelText("Start time")).toHaveValue("");
  });
  it("forwards the root ref and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderInput(
      <VireoTimeInput
        ref={ref}
        value={null}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        pickerProps={{ label: "Start time" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoTimeInputClasses.root, "custom-root");
  });
  it("renders validation feedback", () => {
    renderInput(
      <VireoTimeInput
        value={null}
        onChange={vi.fn()}
        error
        helperText="Required"
        pickerProps={{ label: "Start time" }}
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
