import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  VIREO_STORYBOOK_A11Y_DEBT_LIMIT,
  vireoStorybookA11yDebt,
  vireoStorybookA11yDebtGroups,
} from "../.storybook-vireo/testing/storybook-a11y-debt";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const readPackageFile = (path: string) => readFileSync(join(packageRoot, path), "utf8");
const readRepositoryFile = (path: string) => readFileSync(join(repositoryRoot, path), "utf8");

describe("Storybook executable contract gate", () => {
  it("enables Vitest execution and fail-on-violation accessibility checks", () => {
    const main = readPackageFile(".storybook-vireo/main.ts");
    const preview = readPackageFile(".storybook-vireo/preview.tsx");
    const a11yDebt = readPackageFile(".storybook-vireo/testing/storybook-a11y-debt.ts");

    expect(main).toContain('"@storybook/addon-a11y"');
    expect(main).toContain('"@storybook/addon-vitest"');
    expect(preview).toContain('a11y: { test: "error" }');
    expect(preview).toContain('test: "todo"');
    expect(a11yDebt).toContain("vireoStorybookA11yDebtGroups");
    expect(preview).toContain('initialGlobals: { vireoDirection: "ltr", vireoTheme: "dark" }');
  });

  it("keeps accessibility debt reduction-only, owned, and time-bounded", () => {
    const groupedStories = vireoStorybookA11yDebtGroups.flatMap(group => group.stories);

    expect(vireoStorybookA11yDebt.size).toBeGreaterThan(0);
    expect(vireoStorybookA11yDebt.size).toBeLessThanOrEqual(VIREO_STORYBOOK_A11Y_DEBT_LIMIT);
    expect(new Set(groupedStories).size, "duplicate accessibility-debt story keys").toBe(groupedStories.length);
    expect(vireoStorybookA11yDebt.size).toBe(groupedStories.length);
    expect(new Set(vireoStorybookA11yDebtGroups.map(group => group.owner)).size).toBe(
      vireoStorybookA11yDebtGroups.length,
    );

    for (const group of vireoStorybookA11yDebtGroups) {
      expect(group.owner).toMatch(/^(?:core|capabilities\/[a-z0-9-]+|integrations\/[a-z0-9-]+)$/u);
      expect(group.expiresOn).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
      expect(Date.parse(`${group.expiresOn}T23:59:59.999Z`), `${group.owner} expiry`).toBeGreaterThan(Date.now());
      expect(group.stories.length, `${group.owner} debt`).toBeGreaterThan(0);
      for (const story of group.stories) expect(story).toMatch(/^TypeScript\/UI\/.+::.+$/u);
    }
  });

  it("runs a bounded adaptive visual-mode matrix", () => {
    const config = readPackageFile("vitest.storybook.config.ts");
    const runner = readPackageFile("run-storybook-contracts.mjs");

    expect(config).toContain('name: "desktop-dark"');
    expect(config).toContain('name: "mobile-dark"');
    expect(config).toContain('name: "desktop-light"');
    expect(config).toContain('name: "desktop-reduced"');
    expect(config).toContain('name: "desktop-rtl"');
    expect(config).toContain('name: "desktop-forced-colors"');
    expect(config).toContain('name: "mobile-landscape"');
    expect(config).toContain('initialGlobals: { vireoTheme: "light" }');
    expect(config).toContain('initialGlobals: { vireoDirection: "rtl", vireoTheme: "dark" }');
    expect(config).toContain('reducedMotion: "reduce"');
    expect(config).toContain('forcedColors: "active"');
    expect(config.match(/include: \["vireo-matrix"\]/gu)).toHaveLength(6);
    expect(config.match(/skip: \["contract-debt"\]/gu)).toHaveLength(7);
    expect(config).toContain("fileParallelism: false");
    expect(config).toContain("maxWorkers: 1");
    expect(config.match(/permissions: \["clipboard-read", "clipboard-write"\]/gu)).toHaveLength(7);
    expect(config).toContain('include: ["react/jsx-dev-runtime"]');
    expect(config.match(/browser: "chromium"/gu)).toHaveLength(7);
    expect(runner).toContain("spawnSync");
    expect(runner.match(/"storybook-[a-z-]+"/gu)).toHaveLength(7);
    expect(runner).toContain('{ matrixCorpus: false, name: "storybook-desktop-dark" }');
    expect(runner.match(/matrixCorpus: true/gu)).toHaveLength(6);
    expect(runner).toContain('if (project.matrixCorpus) environment.VIREO_STORYBOOK_MATRIX = "true"');
    expect(runner).toContain("delete environment.VIREO_STORYBOOK_MATRIX");

    for (const story of [
      "src/capabilities/application-navigation/components/navigation/VireoMobileBottomNavigation/VireoMobileBottomNavigation.stories.tsx",
      "src/core/components/controls/VireoLabeledIconButton/VireoLabeledIconButton.stories.tsx",
      "src/core/components/navigation/VireoTabs/VireoTabs.stories.tsx",
    ]) {
      const source = readPackageFile(story);
      expect(source, `${story} matrix coverage`).toContain('"vireo-matrix"');
      expect(source, `${story} enforced accessibility`).toContain('a11y: { test: "error" }');
    }
  });

  it("keeps contract execution in the authoritative local and hosted gates", () => {
    const verification = readRepositoryFile("scripts/verify.sh");
    const contractStep = verification.indexOf("corepack npm run test:storybook");
    const staticBuildStep = verification.indexOf("corepack npm run build-storybook");
    expect(contractStep).toBeGreaterThan(0);
    expect(staticBuildStep).toBeGreaterThan(contractStep);

    const hostedGates = {
      "ci.yml": "npm run gate:fast",
      "release-npm.yml": "npm run gate:release",
      "support-evidence.yml": "npm run verify",
    };

    for (const [workflow, gateCommand] of Object.entries(hostedGates)) {
      const source = readRepositoryFile(`.github/workflows/${workflow}`);
      const browserInstall = source.indexOf("playwright install --with-deps chromium");
      const verify = source.indexOf(gateCommand);
      expect(browserInstall, `${workflow} browser installation`).toBeGreaterThan(0);
      expect(verify, `${workflow} ${gateCommand} step`).toBeGreaterThan(browserInstall);
    }
  });

  it("uses one mode-aware provider in normal Storybook and contract execution", () => {
    const main = readPackageFile(".storybook-vireo/main.ts");
    const testProvider = readPackageFile(".storybook-vireo/testing/storybook-entry.tsx");
    const publishedProvider = readPackageFile("storybook/VireoStorybookProvider.tsx");
    const preview = readPackageFile(".storybook-vireo/preview.tsx");

    expect(main).toContain('process.env.VIREO_STORYBOOK_CONTRACTS === "true"');
    expect(main).toContain("/^@vireocodedev\\/ui\\/storybook$/");
    expect(testProvider).toContain('export * from "../../storybook"');
    expect(publishedProvider).toContain('"light-ltr": createVireoTheme({ mode: "light", direction: "ltr" })');
    expect(publishedProvider).toContain('"dark-rtl": createVireoTheme({ mode: "dark", direction: "rtl" })');
    expect(publishedProvider).toContain("themeMode ?? inheritedTheme.mode");
    expect(publishedProvider).toContain("themeDirection ?? inheritedTheme.direction");
    expect(preview).toContain("themeDirection={themeDirection}");
  });

  it("uses the explicit matrix corpus only for adaptive contract projects", () => {
    const main = readPackageFile(".storybook-vireo/main.ts");
    const matrixStories = readPackageFile(".storybook-vireo/testing/storybook-matrix-stories.ts");

    expect(main).toContain('process.env.VIREO_STORYBOOK_MATRIX === "true"');
    expect(main).toContain("[...vireoStorybookMatrixStories]");
    expect(main).toContain('"../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)"');
    expect(matrixStories.match(/\.stories\.tsx/g)).toHaveLength(11);
  });

  it("prioritizes matrix contracts, then executable CSF contracts, then the complete Storybook corpus", () => {
    const main = readPackageFile(".storybook-vireo/main.ts");
    const routing = main.slice(main.indexOf("const storybookStories ="), main.indexOf("\n\nconst config"));
    const executableCorpus =
      'const executableStorybookCorpus = ["../src/**/{Vireo,useVireo}*.stories.@(js|jsx|mjs|ts|tsx)"];';
    const fullCorpus = "const fullStorybookCorpus = [";
    const documentationGlobs = [
      "../docs/storybook/**/*.mdx",
      "../../history/docs/storybook/**/*.mdx",
      "../../infrastructure/docs/storybook/**/*.mdx",
      "../../localization/docs/storybook/**/*.mdx",
      "../../queryengine/docs/storybook/**/*.mdx",
      "../../shell/docs/storybook/**/*.mdx",
      "../../sqlite/docs/storybook/**/*.mdx",
      "../../../jvm/docs/storybook/**/*.mdx",
      "../../../jvm/*/docs/storybook/**/*.mdx",
    ];

    expect(main).toContain(executableCorpus);
    expect(main).toContain(fullCorpus);
    for (const documentationGlob of documentationGlobs) expect(main).toContain(`"${documentationGlob}"`);
    expect(routing.indexOf('process.env.VIREO_STORYBOOK_MATRIX === "true"')).toBeLessThan(
      routing.indexOf('process.env.VIREO_STORYBOOK_CONTRACTS === "true"'),
    );
    expect(routing.indexOf('process.env.VIREO_STORYBOOK_CONTRACTS === "true"')).toBeLessThan(
      routing.indexOf(": fullStorybookCorpus"),
    );
  });

  it("keeps browser-discovered legacy debt explicit and bounded", () => {
    const historyEntryStories = readPackageFile(
      "src/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.stories.tsx",
    );

    expect(historyEntryStories.match(/"contract-debt"/gu)).toHaveLength(1);
    expect(historyEntryStories).toContain("nine-pixel loading-state drift");
  });
});
