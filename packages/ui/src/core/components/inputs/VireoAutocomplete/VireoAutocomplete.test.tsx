import { VireoAutocomplete } from "./VireoAutocomplete";
import { vireoAutocompleteClasses } from "./VireoAutocomplete.classes";
import { VIREO_AUTOCOMPLETE_NAME } from "./VireoAutocomplete.identity";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const options = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta" },
];
describe(VIREO_AUTOCOMPLETE_NAME, () => {
  it("renders an empty autocomplete with only required props", () => {
    render(
      <VireoAutocomplete
        value={null}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        textFieldProps={{ label: "Customer" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Customer" })).toHaveValue("");
  });
  it("displays the selected option", () => {
    render(
      <VireoAutocomplete
        value={options[0]}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        textFieldProps={{ label: "Customer" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Customer" })).toHaveValue("Alpha");
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoAutocomplete
        ref={ref}
        value={null}
        onChange={vi.fn()}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        classes={{ root: "custom-root" }}
        textFieldProps={{ label: "Customer" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoAutocompleteClasses.root, "custom-root");
  });
});
