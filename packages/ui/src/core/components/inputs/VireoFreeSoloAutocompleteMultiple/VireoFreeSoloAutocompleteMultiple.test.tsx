import { VireoFreeSoloAutocompleteMultiple } from "./VireoFreeSoloAutocompleteMultiple";
import { vireoFreeSoloAutocompleteMultipleClasses } from "./VireoFreeSoloAutocompleteMultiple.classes";
import { VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME } from "./VireoFreeSoloAutocompleteMultiple.identity";
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
describe(VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME, () => {
  it("renders an empty multiple free-solo field with only required props", () => {
    render(
      <VireoFreeSoloAutocompleteMultiple
        {...common}
        value={[]}
        onChange={vi.fn()}
        textFieldProps={{ label: "Tags" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Tags" })).toHaveValue("");
  });
  it("renders known and synthetic values as tags", () => {
    render(
      <VireoFreeSoloAutocompleteMultiple
        {...common}
        value={["alpha", "Custom"]}
        onChange={vi.fn()}
        textFieldProps={{ label: "Tags" }}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
  it("forwards refs and composes classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoFreeSoloAutocompleteMultiple
        {...common}
        ref={ref}
        value={[]}
        onChange={vi.fn()}
        classes={{ root: "custom-root" }}
        textFieldProps={{ label: "Tags" }}
      />,
    );
    expect(ref.current).toHaveClass(vireoFreeSoloAutocompleteMultipleClasses.root, "custom-root");
  });
});
