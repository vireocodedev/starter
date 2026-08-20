import preview from "../.storybook-vireo/preview";
import { describe, expect, it } from "vitest";

type StoryEntry = { title: string };
const vireoStorySort = preview.parameters?.options?.storySort as (a: StoryEntry, b: StoryEntry) => number;

describe("vireoStorySort", () => {
  it("places component files before child folders and alphabetizes each kind", () => {
    const titles = [
      "Forms/Forms/VireoFormSubmitButton",
      "Forms/Forms/Fields/VireoFormTextField",
      "Forms/Forms/VireoForm",
      "Forms/Forms/Fields/VireoFormCheckboxField",
      "Forms/Forms/VireoFormSection",
      "Forms/Forms/VireoFormResetButton",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Forms/Forms/VireoForm",
      "Forms/Forms/VireoFormResetButton",
      "Forms/Forms/VireoFormSection",
      "Forms/Forms/VireoFormSubmitButton",
      "Forms/Forms/Fields/VireoFormCheckboxField",
      "Forms/Forms/Fields/VireoFormTextField",
    ]);
  });

  it("applies file-first ordering recursively and alphabetizes sibling folders", () => {
    const titles = [
      "Capability/Forms/Advanced/Groups/VireoNested",
      "Capability/Forms/Fields/VireoTextField",
      "Capability/Forms/Advanced/VireoRule",
      "Capability/Forms/VireoForm",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Capability/Forms/VireoForm",
      "Capability/Forms/Advanced/VireoRule",
      "Capability/Forms/Advanced/Groups/VireoNested",
      "Capability/Forms/Fields/VireoTextField",
    ]);
  });

  it("preserves declaration order for entries belonging to the same component title", () => {
    expect(vireoStorySort({ title: "Forms/Forms/VireoForm" }, { title: "Forms/Forms/VireoForm" })).toBe(0);
  });
});
