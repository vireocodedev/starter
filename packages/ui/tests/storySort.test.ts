import preview from "../.storybook-vireo/preview";
import { describe, expect, it } from "vitest";

type StoryEntry = { title: string };
const vireoStorySort = preview.parameters?.options?.storySort as (a: StoryEntry, b: StoryEntry) => number;

describe("vireoStorySort", () => {
  it("keeps monorepo documentation first and each library at the root", () => {
    const titles = [
      "History/Overview",
      "UI/Integrations/TanStack Query/VireoQueryBoundary",
      "UI/Capabilities/Forms/VireoForm",
      "UI/Core/Data Display/VireoIcon",
      "Documentation/Overview",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "UI/Core/Data Display/VireoIcon",
      "UI/Capabilities/Forms/VireoForm",
      "UI/Integrations/TanStack Query/VireoQueryBoundary",
      "History/Overview",
    ]);
  });

  it("keeps History's package pages in their learning order", () => {
    const titles = [
      "History/Failure Semantics",
      "History/Record Validation",
      "History/Overview",
      "History/Primary Workflow",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "History/Overview",
      "History/Primary Workflow",
      "History/Record Validation",
      "History/Failure Semantics",
    ]);
  });

  it("prioritizes onboarding pages and the approved guide order", () => {
    const titles = [
      "UI/Documentation/Guides/Drag and Drop",
      "UI/Documentation/Installation",
      "UI/Documentation/Guides/Common Patterns",
      "UI/Overview",
      "Documentation/Overview",
      "UI/Documentation/Guides/Theming",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "UI/Overview",
      "UI/Documentation/Installation",
      "UI/Documentation/Guides/Common Patterns",
      "UI/Documentation/Guides/Theming",
      "UI/Documentation/Guides/Drag and Drop",
    ]);
  });

  it("places component files before child folders and alphabetizes each kind", () => {
    const titles = [
      "UI/Capabilities/Forms/VireoFormSubmitButton",
      "UI/Capabilities/Forms/Fields/VireoFormTextField",
      "UI/Capabilities/Forms/VireoForm",
      "UI/Capabilities/Forms/VireoFormActions",
      "UI/Capabilities/Forms/Fields/VireoFormCheckboxField",
      "UI/Capabilities/Forms/VireoFormSection",
      "UI/Capabilities/Forms/VireoFormSectionItem",
      "UI/Capabilities/Forms/VireoFormResetButton",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "UI/Capabilities/Forms/VireoForm",
      "UI/Capabilities/Forms/VireoFormActions",
      "UI/Capabilities/Forms/VireoFormResetButton",
      "UI/Capabilities/Forms/VireoFormSection",
      "UI/Capabilities/Forms/VireoFormSectionItem",
      "UI/Capabilities/Forms/VireoFormSubmitButton",
      "UI/Capabilities/Forms/Fields/VireoFormCheckboxField",
      "UI/Capabilities/Forms/Fields/VireoFormTextField",
    ]);
  });

  it("applies file-first ordering recursively and alphabetizes sibling folders", () => {
    const titles = [
      "UI/Capabilities/Forms/Advanced/Groups/VireoNested",
      "UI/Capabilities/Forms/Fields/VireoTextField",
      "UI/Capabilities/Forms/Advanced/VireoRule",
      "UI/Capabilities/Forms/VireoForm",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "UI/Capabilities/Forms/VireoForm",
      "UI/Capabilities/Forms/Advanced/VireoRule",
      "UI/Capabilities/Forms/Advanced/Groups/VireoNested",
      "UI/Capabilities/Forms/Fields/VireoTextField",
    ]);
  });

  it("preserves declaration order for entries belonging to the same component title", () => {
    expect(
      vireoStorySort({ title: "UI/Capabilities/Forms/VireoForm" }, { title: "UI/Capabilities/Forms/VireoForm" }),
    ).toBe(0);
  });
});
