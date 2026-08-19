import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VireoCounterInput } from "./VireoCounterInput";
import { VIREO_COUNTER_INPUT_NAME } from "./VireoCounterInput.identity";
describe(VIREO_COUNTER_INPUT_NAME, () => {
  it("increments and decrements within bounds", () => {
    const onChange = vi.fn();
    const { rerender } = render(<VireoCounterInput label="Seats" value={2} min={1} max={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase value" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    rerender(<VireoCounterInput label="Seats" value={1} min={1} max={3} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Decrease value" })).toBeDisabled();
  });
  it("supports direct bounded entry", () => {
    const onChange = vi.fn();
    render(<VireoCounterInput label="Seats" value={2} min={1} max={5} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "9" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
