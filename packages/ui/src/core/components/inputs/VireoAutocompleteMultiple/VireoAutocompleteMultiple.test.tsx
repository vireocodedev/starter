import { VireoAutocompleteMultiple } from "./VireoAutocompleteMultiple";
import { vireoAutocompleteMultipleClasses } from "./VireoAutocompleteMultiple.classes";
import { VIREO_AUTOCOMPLETE_MULTIPLE_NAME } from "./VireoAutocompleteMultiple.identity";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const options = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
];
describe(VIREO_AUTOCOMPLETE_MULTIPLE_NAME, () => {
  it("renders an empty multiple autocomplete with only required props", () => {
    render(
      <VireoAutocompleteMultiple
        value={[]}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        textFieldProps={{ label: "Customers" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Customers" })).toHaveValue("");
  });
  it("displays selected options as tags", () => {
    render(
      <VireoAutocompleteMultiple
        value={options}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        textFieldProps={{ label: "Customers" }}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoAutocompleteMultiple
        ref={ref}
        value={[]}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        classes={{ root: "custom-root" }}
        textFieldProps={{ label: "Customers" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoAutocompleteMultipleClasses.root, "custom-root");
  });
});
