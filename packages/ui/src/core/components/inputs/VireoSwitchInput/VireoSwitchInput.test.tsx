import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoSwitchInput } from "./VireoSwitchInput";
import { VIREO_SWITCH_INPUT_NAME } from "./VireoSwitchInput.identity";
describe(VIREO_SWITCH_INPUT_NAME, () => {
  it("renders controlled state and reports boolean changes", () => {
    const onChange = vi.fn();
    render(<VireoSwitchInput label="Notifications" value={false} onChange={onChange} />);
    const input = screen.getByRole("checkbox", { name: "Notifications" });
    expect(input).not.toBeChecked();
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it("forwards its control ref and renders validation help", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <VireoSwitchInput
        ref={ref}
        label="Notifications"
        value={null}
        onChange={() => undefined}
        error
        helperText="Choose a preference"
      />,
    );
    expect(ref.current).toContainElement(screen.getByRole("checkbox"));
    expect(screen.getByText("Choose a preference")).toBeInTheDocument();
  });
});
