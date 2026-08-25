import preview from "../.storybook-vireo/preview";
import { describe, expect, it } from "vitest";

type StoryEntry = { title: string };
const vireoStorySort = preview.parameters?.options?.storySort as (a: StoryEntry, b: StoryEntry) => number;

describe("vireoStorySort", () => {
  it("keeps monorepo documentation first and groups libraries by runtime", () => {
    const titles = [
      "TypeScript/Overview",
      "TypeScript/History/Overview",
      "JVM/History/Overview",
      "JVM/Offline/Overview",
      "JVM/Auth/Overview",
      "JVM/Core/Overview",
      "JVM/BOM/Overview",
      "JVM/Overview",
      "TypeScript/Infrastructure/Overview",
      "TypeScript/Localization/Overview",
      "TypeScript/Query Engine/Overview",
      "TypeScript/SQLite/Overview",
      "TypeScript/Shell/Overview",
      "TypeScript/UI/Integrations/TanStack Query/VireoQueryBoundary",
      "TypeScript/UI/Capabilities/Forms/VireoForm",
      "TypeScript/UI/Core/Data Display/VireoIcon",
      "Documentation/Overview",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "TypeScript/Overview",
      "TypeScript/UI/Core/Data Display/VireoIcon",
      "TypeScript/UI/Capabilities/Forms/VireoForm",
      "TypeScript/UI/Integrations/TanStack Query/VireoQueryBoundary",
      "TypeScript/History/Overview",
      "TypeScript/Infrastructure/Overview",
      "TypeScript/Localization/Overview",
      "TypeScript/Query Engine/Overview",
      "TypeScript/SQLite/Overview",
      "TypeScript/Shell/Overview",
      "JVM/Overview",
      "JVM/BOM/Overview",
      "JVM/Core/Overview",
      "JVM/Auth/Overview",
      "JVM/History/Overview",
      "JVM/Offline/Overview",
    ]);
  });

  it("keeps audited JVM artifacts and pages in their learning order", () => {
    const titles = [
      "JVM/Overview",
      "JVM/History/Security and Actors",
      "JVM/BOM/Consumption and Release Semantics",
      "JVM/BOM/Overview",
      "JVM/Offline/Configuration, Security, and Persistence",
      "JVM/Offline/Primary Workflow",
      "JVM/Offline/Overview",
      "JVM/Query Engine/Configuration, Security, and Persistence",
      "JVM/Query Engine/Primary Workflow",
      "JVM/Query Engine/Overview",
      "JVM/Core/Web, Migrations, and Extensions",
      "JVM/Auth/Configuration and Security",
      "JVM/Core/Primary Workflow",
      "JVM/History/Overview",
      "JVM/Core/Overview",
      "JVM/Auth/Primary Workflow",
      "JVM/Auth/Overview",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "JVM/Overview",
      "JVM/BOM/Overview",
      "JVM/BOM/Consumption and Release Semantics",
      "JVM/Core/Overview",
      "JVM/Core/Primary Workflow",
      "JVM/Core/Web, Migrations, and Extensions",
      "JVM/Auth/Overview",
      "JVM/Auth/Primary Workflow",
      "JVM/Auth/Configuration and Security",
      "JVM/Query Engine/Overview",
      "JVM/Query Engine/Primary Workflow",
      "JVM/Query Engine/Configuration, Security, and Persistence",
      "JVM/History/Overview",
      "JVM/History/Security and Actors",
      "JVM/Offline/Overview",
      "JVM/Offline/Primary Workflow",
      "JVM/Offline/Configuration, Security, and Persistence",
    ]);
  });

  it("keeps Infrastructure's package pages in their learning order", () => {
    const titles = [
      "TypeScript/Infrastructure/Failure Semantics",
      "TypeScript/Infrastructure/Session Expiry",
      "TypeScript/Infrastructure/Connectivity",
      "TypeScript/Infrastructure/Overview",
      "TypeScript/Infrastructure/HTTP and Pagination",
      "TypeScript/Infrastructure/Primary Workflow",
      "TypeScript/Infrastructure/Persistent State",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/Infrastructure/Overview",
      "TypeScript/Infrastructure/Primary Workflow",
      "TypeScript/Infrastructure/HTTP and Pagination",
      "TypeScript/Infrastructure/Connectivity",
      "TypeScript/Infrastructure/Persistent State",
      "TypeScript/Infrastructure/Session Expiry",
      "TypeScript/Infrastructure/Failure Semantics",
    ]);
  });

  it("keeps Query Engine's package pages in their learning order", () => {
    const titles = [
      "TypeScript/Query Engine/Failure Semantics",
      "TypeScript/Query Engine/Config Persistence",
      "TypeScript/Query Engine/Primary Workflow",
      "TypeScript/Query Engine/SQLite Execution",
      "TypeScript/Query Engine/Overview",
      "TypeScript/Query Engine/Filter Compilation",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/Query Engine/Overview",
      "TypeScript/Query Engine/Primary Workflow",
      "TypeScript/Query Engine/Filter Compilation",
      "TypeScript/Query Engine/SQLite Execution",
      "TypeScript/Query Engine/Config Persistence",
      "TypeScript/Query Engine/Failure Semantics",
    ]);
  });

  it("keeps SQLite's package pages in their learning order", () => {
    const titles = [
      "TypeScript/SQLite/Failure Semantics",
      "TypeScript/SQLite/Offline Utilities",
      "TypeScript/SQLite/Managed Runtime",
      "TypeScript/SQLite/Overview",
      "TypeScript/SQLite/Hydration State",
      "TypeScript/SQLite/Primary Workflow",
      "TypeScript/SQLite/Offline Replay",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/SQLite/Overview",
      "TypeScript/SQLite/Primary Workflow",
      "TypeScript/SQLite/Managed Runtime",
      "TypeScript/SQLite/Offline Replay",
      "TypeScript/SQLite/Hydration State",
      "TypeScript/SQLite/Offline Utilities",
      "TypeScript/SQLite/Failure Semantics",
    ]);
  });

  it("keeps Shell's package pages in their learning order", () => {
    const titles = [
      "TypeScript/Shell/Failure Semantics",
      "TypeScript/Shell/Overlay History",
      "TypeScript/Shell/Auth Redirects",
      "TypeScript/Shell/Navigation and Config",
      "TypeScript/Shell/Sitemap and Paths",
      "TypeScript/Shell/Primary Workflow",
      "TypeScript/Shell/Overview",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/Shell/Overview",
      "TypeScript/Shell/Primary Workflow",
      "TypeScript/Shell/Sitemap and Paths",
      "TypeScript/Shell/Navigation and Config",
      "TypeScript/Shell/Auth Redirects",
      "TypeScript/Shell/Overlay History",
      "TypeScript/Shell/Failure Semantics",
    ]);
  });

  it("keeps History's package pages in their learning order", () => {
    const titles = [
      "TypeScript/History/Failure Semantics",
      "TypeScript/History/Collections",
      "TypeScript/History/Node Model",
      "TypeScript/History/Record Validation",
      "TypeScript/History/Formatting and Comparison",
      "TypeScript/History/Overview",
      "TypeScript/History/Nested Definitions",
      "TypeScript/History/Primary Workflow",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/History/Overview",
      "TypeScript/History/Primary Workflow",
      "TypeScript/History/Nested Definitions",
      "TypeScript/History/Collections",
      "TypeScript/History/Formatting and Comparison",
      "TypeScript/History/Node Model",
      "TypeScript/History/Record Validation",
      "TypeScript/History/Failure Semantics",
    ]);
  });

  it("keeps Localization's package pages in their learning order", () => {
    const titles = [
      "TypeScript/Localization/Failure Semantics",
      "TypeScript/Localization/Custom Namespaces",
      "TypeScript/Localization/Primary Workflow",
      "TypeScript/Localization/Number Formatting",
      "TypeScript/Localization/Overview",
      "TypeScript/Localization/Late Registration",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/Localization/Overview",
      "TypeScript/Localization/Primary Workflow",
      "TypeScript/Localization/Late Registration",
      "TypeScript/Localization/Custom Namespaces",
      "TypeScript/Localization/Number Formatting",
      "TypeScript/Localization/Failure Semantics",
    ]);
  });

  it("prioritizes onboarding pages and the approved guide order", () => {
    const titles = [
      "TypeScript/UI/Documentation/Guides/Drag and Drop",
      "TypeScript/UI/Documentation/Installation",
      "TypeScript/UI/Documentation/Guides/Common Patterns",
      "TypeScript/UI/Overview",
      "TypeScript/Overview",
      "Documentation/Overview",
      "TypeScript/UI/Documentation/Guides/Theming",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "Documentation/Overview",
      "TypeScript/Overview",
      "TypeScript/UI/Overview",
      "TypeScript/UI/Documentation/Installation",
      "TypeScript/UI/Documentation/Guides/Common Patterns",
      "TypeScript/UI/Documentation/Guides/Theming",
      "TypeScript/UI/Documentation/Guides/Drag and Drop",
    ]);
  });

  it("places component files before child folders and alphabetizes each kind", () => {
    const titles = [
      "TypeScript/UI/Capabilities/Forms/VireoFormSubmitButton",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormTextField",
      "TypeScript/UI/Capabilities/Forms/VireoForm",
      "TypeScript/UI/Capabilities/Forms/VireoFormActions",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormCheckboxField",
      "TypeScript/UI/Capabilities/Forms/VireoFormSection",
      "TypeScript/UI/Capabilities/Forms/VireoFormSectionItem",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/UI/Capabilities/Forms/VireoForm",
      "TypeScript/UI/Capabilities/Forms/VireoFormActions",
      "TypeScript/UI/Capabilities/Forms/VireoFormSection",
      "TypeScript/UI/Capabilities/Forms/VireoFormSectionItem",
      "TypeScript/UI/Capabilities/Forms/VireoFormSubmitButton",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormCheckboxField",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormTextField",
    ]);
  });

  it("applies file-first ordering recursively and alphabetizes sibling folders", () => {
    const titles = [
      "TypeScript/UI/Capabilities/Forms/Advanced/Groups/VireoNested",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoTextField",
      "TypeScript/UI/Capabilities/Forms/Advanced/VireoRule",
      "TypeScript/UI/Capabilities/Forms/VireoForm",
    ];

    expect(
      titles
        .map(title => ({ title }))
        .sort(vireoStorySort)
        .map(entry => entry.title),
    ).toEqual([
      "TypeScript/UI/Capabilities/Forms/VireoForm",
      "TypeScript/UI/Capabilities/Forms/Advanced/VireoRule",
      "TypeScript/UI/Capabilities/Forms/Advanced/Groups/VireoNested",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoTextField",
    ]);
  });

  it("preserves declaration order for entries belonging to the same component title", () => {
    expect(
      vireoStorySort(
        { title: "TypeScript/UI/Capabilities/Forms/VireoForm" },
        { title: "TypeScript/UI/Capabilities/Forms/VireoForm" },
      ),
    ).toBe(0);
  });
});
