import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VireoSliderInput } from "./VireoSliderInput";
import { VIREO_SLIDER_INPUT_NAME } from "./VireoSliderInput.identity";
describe(VIREO_SLIDER_INPUT_NAME, () => {
  it("reports slider and direct input values", () => {
    const onChange = vi.fn();
    render(<VireoSliderInput aria-label="Opacity" value={40} onChange={onChange} min={0} max={100} step={5} />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "120" } });
    expect(onChange).toHaveBeenCalledWith(100);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });
    expect(onChange).toHaveBeenCalledWith(55);
  });
  it("uses the minimum for a null slider value and renders help", () => {
    render(
      <VireoSliderInput
        value={null}
        onChange={() => undefined}
        min={10}
        max={20}
        step={1}
        helperText="Choose a threshold"
      />,
    );
    expect(screen.getByRole("slider")).toHaveValue("10");
    expect(screen.getByText("Choose a threshold")).toBeInTheDocument();
  });
});
