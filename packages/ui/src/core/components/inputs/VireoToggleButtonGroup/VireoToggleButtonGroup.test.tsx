import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VireoToggleButtonGroup } from "./VireoToggleButtonGroup";
import { VIREO_TOGGLE_BUTTON_GROUP_NAME } from "./VireoToggleButtonGroup.identity";
const common = {
  options: ["daily", "weekly"],
  renderOption: (value: string) => value,
  renderKey: (value: string) => value,
};
describe(VIREO_TOGGLE_BUTTON_GROUP_NAME, () => {
  it("reports single selection and supports clearing", () => {
    const onChange = vi.fn();
    render(<VireoToggleButtonGroup {...common} value="daily" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "weekly" }));
    expect(onChange).toHaveBeenCalledWith("weekly");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
  it("reports arrays in multiple mode", () => {
    const onChange = vi.fn();
    render(<VireoToggleButtonGroup {...common} multiple value={["daily"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "weekly" }));
    expect(onChange).toHaveBeenCalledWith(["daily", "weekly"]);
  });
});
