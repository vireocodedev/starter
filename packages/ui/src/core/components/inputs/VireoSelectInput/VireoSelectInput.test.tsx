import { VireoSelectInput } from "./VireoSelectInput";
import { vireoSelectInputClasses } from "./VireoSelectInput.classes";
import { VIREO_SELECT_INPUT_NAME } from "./VireoSelectInput.identity";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const options = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
];
describe(VIREO_SELECT_INPUT_NAME, () => {
  it("renders an empty single-select with only required props", () => {
    render(
      <VireoSelectInput
        value={null}
        onChange={vi.fn()}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        placeholder="Choose"
      />,
    );
    expect(screen.getByText("Choose")).toBeInTheDocument();
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoSelectInput
        ref={ref}
        value="alpha"
        onChange={vi.fn()}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        classes={{ root: "custom-root" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoSelectInputClasses.root, "custom-root");
  });
  it("clears a selected value through the accessible clear action", () => {
    const onChange = vi.fn();
    render(
      <VireoSelectInput
        value="alpha"
        onChange={onChange}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        clearLabel="Clear team"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear team" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
