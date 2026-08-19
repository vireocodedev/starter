import { VireoDurationInput } from "./VireoDurationInput";
import { vireoDurationInputClasses } from "./VireoDurationInput.classes";
import { VIREO_DURATION_INPUT_NAME } from "./VireoDurationInput.identity";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const renderInput = (element: React.ReactElement) =>
  render(<LocalizationProvider dateAdapter={AdapterDayjs}>{element}</LocalizationProvider>);
describe(VIREO_DURATION_INPUT_NAME, () => {
  it("renders a duration field with only required props", () => {
    renderInput(<VireoDurationInput value={90} onChange={vi.fn()} fieldProps={{ label: "Duration" }} />);
    expect(screen.getByLabelText("Duration")).toBeInTheDocument();
  });
  it("forwards the root ref and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    renderInput(
      <VireoDurationInput
        ref={ref}
        value={null}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        fieldProps={{ label: "Duration" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoDurationInputClasses.root, "custom-root");
  });
  it("renders validation feedback", () => {
    renderInput(
      <VireoDurationInput
        value={null}
        onChange={vi.fn()}
        error
        helperText="Required"
        fieldProps={{ label: "Duration" }}
      />,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
