import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = join(import.meta.dirname, "..");
const srcRoot = join(packageRoot, "src");
const docsRoot = join(packageRoot, "docs", "storybook");

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

describe("Vireo Storybook navigation contract", () => {
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
});
