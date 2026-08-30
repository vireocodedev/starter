import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { vireoStorybookMatrixStories } from "../.storybook-vireo/testing/storybook-matrix-stories";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const sourceRoot = join(packageRoot, "src");
const storybookDirectory = join(packageRoot, ".storybook-vireo");
const matrixTag = '"vireo-matrix"';
const ignoredRepositoryDirectories = new Set([".git", "build", "coverage", "dist", "node_modules"]);
const executableStoryFileName = /^(?:Vireo|useVireo).*\.stories\.(?:js|jsx|mjs|ts|tsx)$/u;

const representativeStories = {
  data: "core/components/data-display/VireoJsonViewer/VireoJsonViewer.stories.tsx",
  feedback: "core/components/feedback/VireoLoadingRegion/VireoLoadingRegion.stories.tsx",
  forms: "capabilities/forms/components/forms/VireoFormTextField/VireoFormTextField.stories.tsx",
  "infinite canvas":
    "capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/VireoInfiniteCanvas.stories.tsx",
  integrations: "integrations/tanstack-query/components/feedback/VireoQueryBoundary/VireoQueryBoundary.stories.tsx",
  layout: "capabilities/page-layout/components/layout/VireoPage/VireoPage.stories.tsx",
  overlays: "capabilities/overlays/components/overlays/VireoBottomDrawer/VireoBottomDrawer.stories.tsx",
  tables:
    "capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/VireoResponsiveTable.stories.tsx",
} as const;

function findStoryFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return ignoredRepositoryDirectories.has(entry.name) ? [] : findStoryFiles(path);
    return /\.stories\.[cm]?[jt]sx?$/u.test(entry.name) ? [path] : [];
  });
}

describe("Storybook mode matrix coverage", () => {
  it("covers every representative component family", () => {
    for (const [family, story] of Object.entries(representativeStories)) {
      const source = readFileSync(join(sourceRoot, story), "utf8");
      expect(source, `${family}: ${story}`).toContain(matrixTag);
    }
  });

  it("keeps a broad minimum set in alternate theme, viewport, and motion modes", () => {
    const matrixStories = findStoryFiles(sourceRoot).filter(path => readFileSync(path, "utf8").includes(matrixTag));

    expect(
      matrixStories.length,
      `matrix stories:\n${matrixStories.map(path => relative(sourceRoot, path)).join("\n")}`,
    ).toBeGreaterThanOrEqual(11);
  });

  it("keeps the explicit matrix corpus equal to every vireo-matrix story", () => {
    const taggedStories = findStoryFiles(sourceRoot)
      .filter(path => readFileSync(path, "utf8").includes(matrixTag))
      .map(path => relative(sourceRoot, path))
      .sort();
    const matrixCorpus = vireoStorybookMatrixStories
      .map(story => relative(sourceRoot, resolve(storybookDirectory, story)))
      .sort();

    expect(new Set(matrixCorpus).size).toBe(11);
    expect(matrixCorpus).toEqual(taggedStories);
  });

  it("keeps every executable CSF story inside the UI source corpus", () => {
    const repositoryExecutableStories = findStoryFiles(repositoryRoot).filter(path =>
      executableStoryFileName.test(basename(path)),
    );
    const outsideUiSource = repositoryExecutableStories
      .filter(path => !path.startsWith(`${sourceRoot}${sep}`))
      .map(path => relative(repositoryRoot, path));

    expect(outsideUiSource, `executable CSF stories outside packages/ui/src:\n${outsideUiSource.join("\n")}`).toEqual(
      [],
    );
  });
});
