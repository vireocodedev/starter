import { VireoFreeSoloAutocomplete } from "./VireoFreeSoloAutocomplete";
import { vireoFreeSoloAutocompleteClasses } from "./VireoFreeSoloAutocomplete.classes";
import { VIREO_FREE_SOLO_AUTOCOMPLETE_NAME } from "./VireoFreeSoloAutocomplete.identity";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
const options = [{ id: "alpha", label: "Alpha" }];
const common = {
  options,
  getOptionLabel: (option: (typeof options)[number]) => option.label,
  isOptionEqualToValue: (a: (typeof options)[number], b: (typeof options)[number]) => a.id === b.id,
  getStringValue: (option: (typeof options)[number]) => option.id,
  createSyntheticOption: (value: string) => ({ id: value, label: value }),
  addLabel: (value: string) => `Add ${value}`,
};
describe(VIREO_FREE_SOLO_AUTOCOMPLETE_NAME, () => {
  it("renders an empty free-solo field with only required props", () => {
    render(<VireoFreeSoloAutocomplete {...common} value={null} onChange={vi.fn()} textFieldProps={{ label: "Tag" }} />);
    expect(screen.getByRole("combobox", { name: "Tag" })).toHaveValue("");
  });
  it("renders a synthetic value that is not in the option list", () => {
    render(
      <VireoFreeSoloAutocomplete {...common} value="Custom" onChange={vi.fn()} textFieldProps={{ label: "Tag" }} />,
    );
    expect(screen.getByRole("combobox", { name: "Tag" })).toHaveValue("Custom");
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoFreeSoloAutocomplete
        {...common}
        ref={ref}
        value={null}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        textFieldProps={{ label: "Tag" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoFreeSoloAutocompleteClasses.root, "custom-root");
  });
});
