import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = join(import.meta.dirname, "..");
const packagesRoot = join(packageRoot, "..");
const srcRoot = join(packageRoot, "src");
const docsRoot = join(packageRoot, "docs", "storybook");
const historyDocsRoot = join(packagesRoot, "history", "docs", "storybook");
const historyExamplesRoot = join(packagesRoot, "history", "docs", "examples");
const storybookConfigFile = join(packageRoot, ".storybook-vireo", "main.ts");

const EXPECTED_DOCUMENTATION_ROUTES = [
  "Documentation/Overview",
  "Documentation/Installation",
  "Documentation/Guides/Common Patterns",
  "Documentation/Guides/Theming",
  "Documentation/Guides/Providers",
  "Documentation/Guides/Augmentable Interfaces",
  "Documentation/Guides/Notifications",
  "Documentation/Guides/Table Patterns",
  "Documentation/Guides/TanStack Query",
  "Documentation/Guides/Drag and Drop",
] as const;

const EXPECTED_HISTORY_ROUTES = [
  "Libraries/History/Overview",
  "Libraries/History/Primary Workflow",
  "Libraries/History/Record Validation",
  "Libraries/History/Failure Semantics",
] as const;

const APPROVED_STORY_ROUTES = [
  /^Core\/(?:Behavior|Controls|Data Display|Feedback|Hooks|Layout|Navigation|Providers|Surfaces)\/(?:Vireo|useVireo)/u,
  /^Capabilities\/(?:Countries|History|Infinite Canvas|Overlays|Page Layout|Tables)\/(?:Vireo|useVireo)/u,
  /^Capabilities\/Forms\/(?:(?:Fields|Multi-Step|Overlays)\/)?(?:Vireo|useVireo)/u,
  /^Integrations\/(?:Drag and Drop · Hello Pangea DND|Event Source|Localization|Notifications · Sonner|TanStack Query)\/(?:Vireo|useVireo)/u,
] as const;

function findFiles(root: string, predicate: (file: string) => boolean): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const file = join(root, entry.name);
    return entry.isDirectory() ? findFiles(file, predicate) : predicate(file) ? [file] : [];
  });
}

function storyTitle(file: string): string {
  const matches = [...readFileSync(file, "utf8").matchAll(/\btitle:\s*"([^"]+\/[^"]+)"/gu)];
  expect(matches, `${relative(packageRoot, file)} must declare exactly one slash-separated meta.title`).toHaveLength(1);
  return matches[0]?.[1] ?? "";
}

function documentationTitle(file: string): string {
  const match = readFileSync(file, "utf8").match(/<Meta\s+title="([^"]+)"\s*\/>/u);
  expect(match, `${relative(packageRoot, file)} must declare one standalone MDX Meta title`).not.toBeNull();
  return match?.[1] ?? "";
}

describe("Vireo Starter Storybook navigation contract", () => {
  it("discovers the complete UI story catalog and package-owned History pages", () => {
    const configSource = readFileSync(storybookConfigFile, "utf8");

    expect(configSource).toContain('"../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)"');
    expect(configSource).toContain('"../docs/storybook/**/*.mdx"');
    expect(configSource).toContain('"../../history/docs/storybook/**/*.mdx"');
  });

  it("keeps every CSF entry under an approved public root and group", () => {
    const storyFiles = findFiles(srcRoot, file => /\.stories\.[cm]?[jt]sx?$/u.test(file));
    const violations = storyFiles
      .map(file => ({ file, title: storyTitle(file) }))
      .filter(({ title }) => !APPROVED_STORY_ROUTES.some(pattern => pattern.test(title)))
      .map(({ file, title }) => `${relative(packageRoot, file)}: ${title}`);

    expect(violations).toEqual([]);
  });

  it("indexes every standalone MDX page under the visible Documentation root", () => {
    const actualRoutes = findFiles(docsRoot, file => extname(file) === ".mdx")
      .map(documentationTitle)
      .sort();

    expect(actualRoutes).toEqual([...EXPECTED_DOCUMENTATION_ROUTES].sort());
  });

  it("indexes every package-owned History page under Libraries", () => {
    const actualRoutes = findFiles(historyDocsRoot, file => extname(file) === ".mdx")
      .map(documentationTitle)
      .sort();

    expect(actualRoutes).toEqual([...EXPECTED_HISTORY_ROUTES].sort());
  });

  it("executes and displays every History example from the same source module", () => {
    const exampleFiles = findFiles(historyExamplesRoot, file => file.endsWith(".example.ts"));
    const documentationSources = findFiles(historyDocsRoot, file => extname(file) === ".mdx").map(file => ({
      file,
      source: readFileSync(file, "utf8"),
    }));

    for (const exampleFile of exampleFiles) {
      const basename = exampleFile.slice(exampleFile.lastIndexOf("/") + 1, -".example.ts".length);
      const owningPages = documentationSources.filter(({ source }) =>
        source.includes(`../examples/${basename}.example`),
      );

      expect(owningPages, `${relative(packagesRoot, exampleFile)} must be owned by one MDX page`).toHaveLength(1);
      expect(owningPages[0]?.source).toContain(`../examples/${basename}.example.ts?raw`);

      const exampleSource = readFileSync(exampleFile, "utf8");
      expect(exampleSource).toContain('from "@vireocodedev/starter-history"');
      expect(exampleSource).not.toMatch(/\b(?:React|jsx|tsx)\b/u);
    }
  });
});
