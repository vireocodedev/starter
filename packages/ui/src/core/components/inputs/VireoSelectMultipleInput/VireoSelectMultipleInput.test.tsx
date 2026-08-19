import { VireoSelectMultipleInput } from "./VireoSelectMultipleInput";
import { vireoSelectMultipleInputClasses } from "./VireoSelectMultipleInput.classes";
import { VIREO_SELECT_MULTIPLE_INPUT_NAME } from "./VireoSelectMultipleInput.identity";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const options = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
];
describe(VIREO_SELECT_MULTIPLE_INPUT_NAME, () => {
  it("renders an empty multiple-select with only required props", () => {
    render(
      <VireoSelectMultipleInput
        value={[]}
        onChange={vi.fn()}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        placeholder="Choose teams"
      />,
    );
    expect(screen.getByText("Choose teams")).toBeInTheDocument();
  });
  it("renders every selected option", () => {
    render(
      <VireoSelectMultipleInput
        value={["alpha", "beta"]}
        onChange={vi.fn()}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Alpha, Beta");
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoSelectMultipleInput
        ref={ref}
        value={[]}
        onChange={vi.fn()}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        classes={{ root: "custom-root" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoSelectMultipleInputClasses.root, "custom-root");
  });
});
