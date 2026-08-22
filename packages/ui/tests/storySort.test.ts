import preview from "../.storybook-vireo/preview";
import { describe, expect, it } from "vitest";

type StoryEntry = { title: string };
const vireoStorySort = preview.parameters?.options?.storySort as (a: StoryEntry, b: StoryEntry) => number;

describe("vireoStorySort", () => {
  it("keeps the four public roots in their approved order", () => {
    const titles = [
      "Integrations/TanStack Query/VireoQueryBoundary",
      "Capabilities/Forms/VireoForm",
      "Core/Data Display/VireoIcon",
      "Documentation/Overview",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "Core/Data Display/VireoIcon",
      "Capabilities/Forms/VireoForm",
      "Integrations/TanStack Query/VireoQueryBoundary",
    ]);
  });

  it("prioritizes onboarding pages and the approved guide order", () => {
    const titles = [
      "Documentation/Guides/Drag and Drop",
      "Documentation/Installation",
      "Documentation/Guides/Common Patterns",
      "Documentation/Overview",
      "Documentation/Guides/Theming",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "Documentation/Installation",
      "Documentation/Guides/Common Patterns",
      "Documentation/Guides/Theming",
      "Documentation/Guides/Drag and Drop",
    ]);
  });

  it("places component files before child folders and alphabetizes each kind", () => {
    const titles = [
      "Capabilities/Forms/VireoFormSubmitButton",
      "Capabilities/Forms/Fields/VireoFormTextField",
      "Capabilities/Forms/VireoForm",
      "Capabilities/Forms/VireoFormActions",
      "Capabilities/Forms/Fields/VireoFormCheckboxField",
      "Capabilities/Forms/VireoFormSection",
      "Capabilities/Forms/VireoFormSectionItem",
      "Capabilities/Forms/VireoFormResetButton",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Capabilities/Forms/VireoForm",
      "Capabilities/Forms/VireoFormActions",
      "Capabilities/Forms/VireoFormResetButton",
      "Capabilities/Forms/VireoFormSection",
      "Capabilities/Forms/VireoFormSectionItem",
      "Capabilities/Forms/VireoFormSubmitButton",
      "Capabilities/Forms/Fields/VireoFormCheckboxField",
      "Capabilities/Forms/Fields/VireoFormTextField",
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
    expect(vireoStorySort({ title: "Capabilities/Forms/VireoForm" }, { title: "Capabilities/Forms/VireoForm" })).toBe(
      0,
    );
  });
});
