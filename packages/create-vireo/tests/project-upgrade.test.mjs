import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import {
  checkGeneratedEntities,
  generateEntity,
  removeExample,
  sha256,
  stableJson,
  upgradeVireoProject,
  vireoProjectStatus,
  VireoUpgradeError,
} from "../dist/index.js";
import {
  formatVireoStatusText,
  formatVireoUpgradeText,
  upgradeVireoProjectForTest,
  validateApplicationOwnedActions,
  vireoProjectStatusForTest,
} from "../dist/project-upgrade.js";

const sourceCommit = "2520c99b1550246c3b0c5299b3cc6055dd10ead7";
const dependencies = {
  "@vireocodedev/history": "^0.2.1",
  "@vireocodedev/infrastructure": "^0.2.1",
  "@vireocodedev/localization": "^0.2.1",
  "@vireocodedev/query": "^0.2.1",
  "@vireocodedev/shell": "^0.2.1",
  "@vireocodedev/ui": "^0.2.1",
};
const targetDependencies = {
  "@vireocodedev/history": "^0.2.2",
  "@vireocodedev/infrastructure": "^0.2.2",
  "@vireocodedev/localization": "^0.2.2",
  "@vireocodedev/query": "^0.2.2",
  "@vireocodedev/shell": "^0.2.2",
  "@vireocodedev/ui": "^0.3.0",
};
const targetCommit = "11e1795a798d5dbaee9344b8ff207d5b0ea59657";
const applicationOwnedActions = [
  {
    id: "navigation-landmark-and-links",
    paths: [
      "frontend/src/app/shell/layout/AppShellLayout.tsx",
      "frontend/src/app/ui/localization/resources/app.en.ts",
      "frontend/src/app/ui/localization/resources/app.hr.ts",
    ],
    requirement:
      "Update AppShellLayout for the 0.3 navigation contract, add localized navigation.PRIMARY values in en and hr, pass the translated value as the navigationLabel prop, and replace placeholder destinations with real href values while preserving client-side navigation behavior.",
    verificationCommands: ["cd frontend && corepack npm run typecheck"],
  },
  {
    id: "responsive-table-live-announcements",
    paths: [
      "frontend/src/pages/**/AppPage*.tsx",
      "frontend/src/pages/**/localization/resources/*.en.ts",
      "frontend/src/pages/**/localization/resources/*.hr.ts",
    ],
    requirement:
      "Update every AppPageItems use for the 0.3 responsive-table contract and add localized loadingNextPage and loadedNextPage messages in en and hr that announce page-load state without relying on visual table changes.",
    verificationCommands: ["cd frontend && corepack npm run typecheck"],
  },
  {
    id: "accessible-name-contracts",
    paths: ["frontend/src/**/*.tsx", "frontend/src/**/*.ts"],
    requirement:
      "Resolve compiler-reported overlay and frame call sites with localized aria-label values or aria-labelledby connections to visible localized text; library default names are not sufficient for dialogs, drawers, frames, and overlays.",
    verificationCommands: ["cd frontend && corepack npm run typecheck"],
  },
  {
    id: "surface-palette-ownership",
    paths: [
      "frontend/src/app/ui/theme/config/theme.types.ts",
      "frontend/src/app/ui/theme/config/theme.light.ts",
      "frontend/src/app/ui/theme/config/theme.dark.ts",
      "frontend/src/app/ui/theme/config/theme.components.ts",
    ],
    requirement:
      "Remove conflicting application Palette.surface definitions, use the 0.3 appSurface pattern for canvas and overlay surfaces, and review default, elevated, and overlay states in both colour schemes for contrast, separators, focus rings, and scrims.",
    verificationCommands: ["cd frontend && corepack npm run typecheck"],
  },
  {
    id: "full-frontend-verification",
    paths: ["frontend/package.json", "frontend/package-lock.json", "scripts/setup.mjs", "scripts/verify.sh"],
    requirement:
      "Refresh the frontend lockfile after the dependency updates, run frontend typecheck and the complete application verification suite, and resolve the pending contract errors before treating the upgrade as complete.",
    verificationCommands: [
      "corepack npm install --package-lock-only --prefix frontend",
      "corepack npm run setup",
      "cd frontend && corepack npm run typecheck",
      "./scripts/verify.sh",
    ],
  },
];

function pendingActions() {
  return applicationOwnedActions.map(action => ({ ...action, status: "pending" }));
}

function isPolicyError(error) {
  return error?.name === "VireoUpgradeError" && error.code === "VIR-UPG-001";
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "vireo-upgrade-test-"));
  await mkdir(join(root, ".vireo"), { recursive: true });
  await mkdir(join(root, "frontend"), { recursive: true });
  await mkdir(join(root, "src/main/resources/db/migration"), { recursive: true });
  await writeFile(
    join(root, ".vireo/project.json"),
    `${JSON.stringify({ schemaVersion: 1, projectName: "fixture", javaPackage: "dev.example.fixture", database: "h2", packageManager: "npm", templateCommit: sourceCommit, createdBy: "create-vireo@0.2.0" }, null, 2)}\n`,
  );
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({ scripts: { vireo: "npx --yes --package=create-vireo@0.2.0 vireo", test: "node --test" } }, null, 2)}\n`,
  );
  await writeFile(
    join(root, "frontend/package.json"),
    `${JSON.stringify({ dependencies: { ...dependencies, react: "^19.0.0" } }, null, 2)}\n`,
  );
  await writeFile(
    join(root, "frontend/package-lock.json"),
    `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies: { ...dependencies, react: "^19.0.0" } } } }, null, 2)}\n`,
  );
  await writeFile(join(root, "gradle.properties"), "starterVersion=0.2.0\n");
  await writeFile(join(root, "src/main/resources/db/migration/V1__baseline.sql"), "SELECT 1;\n");
  return root;
}

async function legacyGeneratedFixture(root) {
  const sourceSchema = JSON.parse(
    await readFile(new URL("../fixtures/purchase-order.entity.json", import.meta.url), "utf8"),
  );
  const schemaPath = join(root, "purchase-order.entity.json");
  const parserCompatibleLegacySchema = structuredClone(sourceSchema);
  parserCompatibleLegacySchema.database.migrationVersion = 3;
  await writeFile(schemaPath, stableJson(parserCompatibleLegacySchema));
  await generateEntity({ projectDirectory: root, schemaPath });

  const legacySchema = JSON.parse(
    await readFile(new URL("../fixtures/purchase-order.0.2.0.entity.json", import.meta.url), "utf8"),
  );
  const canonicalLegacySchema = stableJson(legacySchema);
  const manifestPath = join(root, ".vireo/generated/purchase-orders.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.generatorVersion = "0.2.0";
  manifest.schemaDigest = sha256(canonicalLegacySchema);
  manifest.files.find(file => file.path === manifest.schemaPath).sha256 = sha256(canonicalLegacySchema);
  await writeFile(join(root, manifest.schemaPath), canonicalLegacySchema);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const paths = new Set([
    `.vireo/generated/${manifest.plural}.json`,
    manifest.schemaPath,
    `.vireo/contracts/${manifest.plural}.contract.json`,
    ...manifest.files.map(file => file.path),
  ]);
  return { manifest, paths: [...paths].sort() };
}

async function flywayMigrationVersions(root) {
  const migrationRoot = join(root, "src/main/resources/db/migration");
  return (await readdir(migrationRoot))
    .map(file => /^V([0-9]+)__/u.exec(file)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((left, right) => left - right);
}

async function snapshot(root, paths) {
  return new Map(await Promise.all(paths.map(async path => [path, await readFile(join(root, path))])));
}

function assertSameSnapshot(before, after) {
  assert.deepEqual([...after.keys()], [...before.keys()]);
  for (const [path, bytes] of before) assert.deepEqual(after.get(path), bytes, `${path} changed during upgrade.`);
}

test("upgrade policy rejects removed, duplicate, and malformed application-owned actions", () => {
  assert.doesNotThrow(() => validateApplicationOwnedActions(applicationOwnedActions));
  assert.throws(() => validateApplicationOwnedActions(applicationOwnedActions.slice(1)), isPolicyError);
  const duplicate = structuredClone(applicationOwnedActions);
  duplicate[1].id = duplicate[0].id;
  assert.throws(() => validateApplicationOwnedActions(duplicate), isPolicyError);
  const malformed = structuredClone(applicationOwnedActions);
  malformed[0].verificationCommands = [];
  assert.throws(() => validateApplicationOwnedActions(malformed), isPolicyError);
});

test("0.2.0 to 0.3.0 is dry-run-first, explicit, and idempotent", async () => {
  const root = await fixture();
  try {
    const managedInputPaths = [
      ".vireo/project.json",
      "package.json",
      "frontend/package.json",
      "frontend/package-lock.json",
      "gradle.properties",
    ];
    const before = {};
    for (const path of managedInputPaths) before[path] = await readFile(join(root, path), "utf8");
    const dryRun = await upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" });
    assert.equal(dryRun.dryRun, true);
    assert.deepEqual(dryRun.manualActions, pendingActions());
    assert.match(formatVireoUpgradeText(dryRun).join("\n"), /\[PENDING\] full-frontend-verification/u);
    assert.match(formatVireoUpgradeText(dryRun).join("\n"), /Affected paths: frontend\/package\.json/u);
    assert.match(formatVireoUpgradeText(dryRun).join("\n"), /Verify: corepack npm run setup/u);
    assert.equal(dryRun.checks.find(check => check.id === "application-owned").status, "manual");
    assert.deepEqual(
      dryRun.files.map(file => file.path),
      [
        "package.json",
        "frontend/package.json",
        "gradle.properties",
        ".vireo/project.json",
        ".vireo/managed-files.json",
        ".vireo/upgrade-0.2.0-to-0.3.0.json",
      ],
    );
    for (const path of managedInputPaths) assert.equal(await readFile(join(root, path), "utf8"), before[path]);

    await assert.rejects(
      upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0", dryRun: false }),
      error => error instanceof VireoUpgradeError && error.code === "VIR-UPG-007",
    );
    const applied = await upgradeVireoProject({
      projectDirectory: root,
      targetRelease: "0.3.0",
      dryRun: false,
      acceptApplicationOwned: true,
    });
    assert.equal(applied.dryRun, false);
    assert.deepEqual(applied.manualActions, pendingActions());
    assert.match(
      formatVireoUpgradeText(applied).at(-1),
      /Managed migration applied; refresh the lockfile before verification/u,
    );
    const rootManifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    assert.equal(rootManifest.scripts.vireo, "npx --yes --package=create-vireo@0.6.0 vireo");
    assert.equal(rootManifest.scripts.test, "node --test");
    const frontendManifest = JSON.parse(await readFile(join(root, "frontend/package.json"), "utf8"));
    assert.deepEqual(
      Object.fromEntries(Object.keys(targetDependencies).map(name => [name, frontendManifest.dependencies[name]])),
      targetDependencies,
    );
    assert.equal(frontendManifest.dependencies.react, "^19.0.0");
    const frontendLock = JSON.parse(await readFile(join(root, "frontend/package-lock.json"), "utf8"));
    assert.deepEqual(
      Object.fromEntries(Object.keys(dependencies).map(name => [name, frontendLock.packages[""].dependencies[name]])),
      dependencies,
    );
    assert.equal(frontendLock.packages[""].dependencies.react, "^19.0.0");
    assert.equal(await readFile(join(root, "gradle.properties"), "utf8"), "starterVersion=0.3.0\n");
    const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.createdBy, "create-vireo@0.2.0");
    assert.equal(metadata.templateCommit, targetCommit);
    assert.equal(metadata.lastUpgradedBy, "create-vireo@0.3.0");
    assert.equal(metadata.lastUpgrade.sourceTemplateCommit, sourceCommit);
    const record = JSON.parse(await readFile(join(root, ".vireo/upgrade-0.2.0-to-0.3.0.json"), "utf8"));
    assert.deepEqual(record.managedSurfaces, [
      "package.json#scripts.vireo",
      "frontend/package.json#dependencies",
      "gradle.properties#starterVersion",
      ".vireo/project.json#templateCommit,templateVersion,templateTag,lastUpgradedBy,lastUpgrade",
      ".vireo/managed-files.json",
    ]);
    assert.deepEqual(record.applicationOwnedActions, pendingActions());
    const repeated = await upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" });
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
    assert.deepEqual(repeated.manualActions, pendingActions());
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("project upgrade preserves admitted 0.2 generated bytes and subsequent checks", async () => {
  const root = await fixture();
  try {
    const generated = await legacyGeneratedFixture(root);
    assert.deepEqual(await flywayMigrationVersions(root), [1, 3]);
    assert.deepEqual(await checkGeneratedEntities(root), [{ entity: "PurchaseOrder", ok: true, problems: [] }]);
    const before = await snapshot(root, generated.paths);

    await upgradeVireoProject({
      projectDirectory: root,
      targetRelease: "0.3.0",
      dryRun: false,
      acceptApplicationOwned: true,
    });
    assertSameSnapshot(before, await snapshot(root, generated.paths));
    assert.deepEqual(await checkGeneratedEntities(root), [{ entity: "PurchaseOrder", ok: true, problems: [] }]);

    const repeated = await upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" });
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
    assertSameSnapshot(before, await snapshot(root, generated.paths));
    assert.deepEqual(await checkGeneratedEntities(root), [{ entity: "PurchaseOrder", ok: true, problems: [] }]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("current public example generates its explicit unused V4 Flyway migration", async () => {
  const root = await fixture();
  try {
    const schemaPath = join(root, "purchase-order.entity.json");
    await writeFile(
      schemaPath,
      await readFile(new URL("../fixtures/purchase-order.entity.json", import.meta.url), "utf8"),
    );
    await generateEntity({ projectDirectory: root, schemaPath });
    assert.deepEqual(await flywayMigrationVersions(root), [1, 4]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("release pair refuses dependency, lockfile, migration, and source-baseline drift", async () => {
  for (const mutate of [
    async root => {
      const manifest = JSON.parse(await readFile(join(root, "frontend/package.json"), "utf8"));
      manifest.dependencies["@vireocodedev/ui"] = "workspace:*";
      await writeFile(join(root, "frontend/package.json"), JSON.stringify(manifest));
    },
    async root => {
      const lock = JSON.parse(await readFile(join(root, "frontend/package-lock.json"), "utf8"));
      lock.packages[""].dependencies["@vireocodedev/ui"] = "^9.0.0";
      await writeFile(join(root, "frontend/package-lock.json"), JSON.stringify(lock));
    },
    async root => writeFile(join(root, "src/main/resources/db/migration/Vbad__invalid.sql"), "SELECT 2;\n"),
    async root => {
      const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
      metadata.templateCommit = "unknown";
      await writeFile(join(root, ".vireo/project.json"), JSON.stringify(metadata));
    },
  ]) {
    const root = await fixture();
    try {
      await mutate(root);
      await assert.rejects(upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" }), VireoUpgradeError);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("release pair refuses generated wire-contract drift", async () => {
  const root = await fixture();
  try {
    const schemaPath = join(root, "purchase-order.entity.json");
    const shippedFixture = new URL("../fixtures/purchase-order.entity.json", import.meta.url);
    await writeFile(schemaPath, await readFile(shippedFixture, "utf8"));
    await generateEntity({ projectDirectory: root, schemaPath });
    const wireContract = join(root, ".vireo/contracts/purchase-orders.contract.json");
    await writeFile(wireContract, `${await readFile(wireContract, "utf8")}\n`);
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" }),
      error => error instanceof VireoUpgradeError && error.code === "VIR-UPG-006",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

const adjacentSourceRelease = "0.7.0";
const adjacentTargetRelease = "0.8.0";
const adjacentSourceCommit = "a670d7f95f720a91705c7c156d19e605582fb4c8";
const adjacentEdge = "0.7.0->0.8.0";
const adjacentPolicy = JSON.parse(
  await readFile(new URL("../schema/vireo-upgrade-policy.json", import.meta.url), "utf8"),
);
const adjacentSource = adjacentPolicy.releaseGraph.releases.find(release => release.release === adjacentSourceRelease);
const adjacentTarget = adjacentPolicy.releaseGraph.releases.find(release => release.release === adjacentTargetRelease);

function releaseLifecyclePolicies(policy, sourceRelease, targetRelease) {
  const candidatePolicy = structuredClone(policy);
  const graph = candidatePolicy.releaseGraph;
  const releases = new Set(graph.releases.map(release => release.release));
  if (!releases.has(sourceRelease) || !releases.has(targetRelease)) {
    throw new Error("Release lifecycle fixture requires declared source and target releases.");
  }
  if (!graph.edges.some(edge => edge.from === sourceRelease && edge.to === targetRelease)) {
    throw new Error("Release lifecycle fixture requires a direct source-to-target edge.");
  }
  const descendants = new Set();
  const pending = [targetRelease];
  while (pending.length > 0) {
    const release = pending.pop();
    for (const edge of graph.edges.filter(edge => edge.from === release)) {
      if (descendants.has(edge.to)) continue;
      descendants.add(edge.to);
      pending.push(edge.to);
    }
  }
  graph.releases = graph.releases.filter(release => !descendants.has(release.release));
  graph.edges = graph.edges.filter(edge => !descendants.has(edge.from) && !descendants.has(edge.to));
  delete graph.candidateRelease;
  const source = graph.releases.find(release => release.release === sourceRelease);
  const target = graph.releases.find(release => release.release === targetRelease);
  if (!source || !target) throw new Error("Release lifecycle fixture pruned its source or target release.");
  for (const release of graph.releases) release.status = "historical";
  graph.publicRelease = sourceRelease;
  graph.previousRelease = sourceRelease;
  graph.candidateRelease = targetRelease;
  source.status = "current";
  target.status = "candidate";

  const finalizedPolicy = structuredClone(candidatePolicy);
  delete finalizedPolicy.releaseGraph.candidateRelease;
  finalizedPolicy.releaseGraph.publicRelease = targetRelease;
  finalizedPolicy.releaseGraph.previousRelease = sourceRelease;
  finalizedPolicy.releaseGraph.releases.find(release => release.release === sourceRelease).status = "historical";
  finalizedPolicy.releaseGraph.releases.find(release => release.release === targetRelease).status = "current";
  return { candidatePolicy, finalizedPolicy, sourceRelease, targetRelease };
}

async function adjacentFixture(profile) {
  const root = await mkdtemp(join(tmpdir(), `vireo-${profile}-0.7-`));
  const frontend = profile === "frontend";
  await mkdir(join(root, ".vireo"), { recursive: true });
  await mkdir(join(root, "scripts"), { recursive: true });
  if (!frontend) await mkdir(join(root, "frontend"), { recursive: true });
  const dependencies = { ...adjacentSource.frontendDependencies, react: "^19.0.0" };
  const rootManifest = {
    name: "upgrade-fixture",
    scripts: { vireo: adjacentSource.rootVireoScript, doctor: "node scripts/vireo-frontend-doctor.mjs" },
    ...(frontend ? { dependencies } : {}),
  };
  await writeFile(join(root, "package.json"), `${JSON.stringify(rootManifest, null, 2)}\n`);
  if (frontend) {
    await writeFile(
      join(root, "package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    // The 0.8 edge adds managed application skills; their absence is the verified source state.
  } else {
    await writeFile(join(root, "frontend/package.json"), `${JSON.stringify({ dependencies }, null, 2)}\n`);
    await writeFile(
      join(root, "frontend/package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    await writeFile(join(root, "gradle.properties"), `starterVersion=${adjacentSource.starterJvmVersion}\n`);
    // The full-stack source also intentionally has no managed 0.8 skill additions.
  }
  await writeFile(join(root, "application-owned.txt"), "keep this application customization\n");
  await writeFile(join(root, "AGENTS.md"), "application-owned guidance\n");
  await writeFile(
    join(root, ".vireo/project.json"),
    `${JSON.stringify({ schemaVersion: 1, profile, projectName: "upgrade-fixture", ...(frontend ? {} : { javaPackage: "dev.example.upgradefixture", database: "h2" }), templateCommit: adjacentSourceCommit, createdBy: "create-vireo@0.7.0" }, null, 2)}\n`,
  );
  return root;
}

async function treeBytes(root, directory = root) {
  const result = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) for (const [name, bytes] of await treeBytes(root, path)) result.set(name, bytes);
    else if (entry.isFile()) result.set(path.slice(root.length + 1), await readFile(path));
  }
  return result;
}

const pristine084OverviewSpec = `import { expect, test } from "@playwright/test";
import { authenticateAsDevelopmentAdministrator } from "./support/authentication";

test("the development administrator reaches a settled live Overview", async ({ page }) => {
  await authenticateAsDevelopmentAdministrator(page);

  await expect(page.locator('[data-app-overview-state="loaded"]')).toBeVisible();
  const overviewHero = page.locator("[data-app-overview-hero]");
  const liveSnapshot = overviewHero.getByText("Live snapshot", { exact: true });
  await expect(liveSnapshot).toHaveCount(1);
  await expect(liveSnapshot).toBeVisible();
  await expect(page.locator("[data-app-overview-metrics]")).toBeVisible();
});
`;
const pristine084OverviewDigest = "aea0494de1223a26a132f64d4cad8e3f753348c5aa7f41519edf16798af4d3e3";

function synthetic085Policies() {
  const { candidatePolicy, finalizedPolicy } = releaseLifecyclePolicies(adjacentPolicy, "0.8.4", "0.8.6");
  const source = candidatePolicy.releaseGraph.releases.find(release => release.release === "0.8.4");
  const target = candidatePolicy.releaseGraph.releases.find(release => release.release === "0.8.6");
  if (!source || !target) throw new Error("Active 0.8.6 policy requires its declared adjacent releases.");
  return { candidatePolicy, finalizedPolicy, source, target };
}

async function overview085Fixture(profile, source) {
  const root = await mkdtemp(join(tmpdir(), `vireo-${profile}-084-overview-`));
  const frontendOnly = profile === "frontend";
  const dependencies = { ...source.frontendDependencies, react: "^19.0.0" };
  await mkdir(join(root, ".vireo"), { recursive: true });
  const samplePath = frontendOnly ? "src/features/item/public.ts" : "frontend/src/features/item/public.ts";
  const compatibilityBaselines = adjacentPolicy.releaseGraph.baselines["0.8.4->0.8.6"][profile];
  const storybookBaseline = compatibilityBaselines.find(
    file => file.path.endsWith("vitest.storybook.config.ts"),
  );
  if (!storybookBaseline?.sourceContent) {
    throw new Error(`${profile} requires an exact 0.8.4 Storybook baseline.`);
  }
  await mkdir(join(root, dirname(samplePath)), { recursive: true });
  await writeFile(join(root, samplePath), "export type Item = { id: number };\n");
  await writeFile(join(root, storybookBaseline.path), storybookBaseline.sourceContent);
  for (const baseline of compatibilityBaselines.filter(file => file.operation === "update")) {
    if (baseline.path === storybookBaseline.path) continue;
    await mkdir(join(root, dirname(baseline.path)), { recursive: true });
    await writeFile(join(root, baseline.path), baseline.sourceContent);
  }
  if (!frontendOnly) await mkdir(join(root, "frontend/tests/e2e"), { recursive: true });
  const scripts = source.managedFrontendScripts[profile];
  const rootManifest = {
    name: `vireo-${profile}-overview`,
    scripts: frontendOnly
      ? { vireo: source.rootVireoScript, ...source.managedRootScripts, ...scripts }
      : { vireo: source.rootVireoScript },
    ...(frontendOnly ? { dependencies } : {}),
  };
  await writeFile(join(root, "package.json"), `${JSON.stringify(rootManifest, null, 2)}\n`);
  if (frontendOnly) {
    await writeFile(
      join(root, "package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
  } else {
    await writeFile(join(root, "frontend/package.json"), `${JSON.stringify({ scripts, dependencies }, null, 2)}\n`);
    await writeFile(
      join(root, "frontend/package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    await writeFile(join(root, "gradle.properties"), `starterVersion=${source.starterJvmVersion}\n`);
    await writeFile(join(root, "frontend/tests/e2e/overview.spec.ts"), pristine084OverviewSpec);
    await writeFile(join(root, "frontend/tests/e2e/login.spec.ts"), "export {};\n");
  }
  await writeFile(
    join(root, ".vireo/project.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        profile,
        projectName: `vireo-${profile}-overview`,
        ...(frontendOnly ? {} : { javaPackage: "dev.example.overview", database: "h2" }),
        templateCommit: source.templateCommit,
        templateVersion: source.release,
        templateTag: `starter-template@${source.release}`,
        createdBy: `create-vireo@${source.release}`,
        lastUpgradedBy: `create-vireo@${source.release}`,
      },
      null,
      2,
    )}\n`,
  );
  const managedPaths = [
    ...(frontendOnly ? ["package.json"] : ["package.json", "frontend/package.json", "gradle.properties"]),
    ...compatibilityBaselines.filter(file => file.operation === "update").map(file => file.path),
  ];
  await writeFile(
    join(root, ".vireo/managed-files.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        templateCommit: source.templateCommit,
        files: await Promise.all(
          managedPaths.map(async path => ({ path, sha256: sha256(await readFile(join(root, path))) })),
        ),
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(root, ".vireo/example-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        templateCommit: source.templateCommit,
        files: { [samplePath]: sha256(await readFile(join(root, samplePath))) },
      },
      null,
      2,
    )}\n`,
  );
  return root;
}

test("0.8.4 to 0.8.6 transactionally records the pristine Overview sample before removal for both profiles", async () => {
  assert.equal(sha256(pristine084OverviewSpec), pristine084OverviewDigest);
  const { candidatePolicy, finalizedPolicy, source, target } = synthetic085Policies();
  for (const profile of ["full-stack", "frontend"]) {
    const root = await overview085Fixture(profile, source);
    try {
      const lockPath = join(root, profile === "frontend" ? "package-lock.json" : "frontend/package-lock.json");
      const lockBefore = await readFile(lockPath, "utf8");
      const beforeCandidate = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: "0.8.6" }, candidatePolicy),
        error => error.code === "VIR-UPG-008",
      );
      assertSameSnapshot(beforeCandidate, await treeBytes(root));

      const preview = await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: "0.8.6" },
        finalizedPolicy,
      );
      assert.equal(preview.checks.find(check => check.id === "lockfile")?.status, "pass");
      assert.equal(
        preview.files.find(file => file.path === ".vireo/example-manifest.json")?.status,
        "update",
        `${profile} plans the manifest migration`,
      );
      const storybookBaseline = candidatePolicy.releaseGraph.baselines["0.8.4->0.8.6"][profile].find(
        file => file.path.endsWith("vitest.storybook.config.ts"),
      );
      assert.equal(preview.files.find(file => file.path === storybookBaseline.path)?.status, "update");
      assertSameSnapshot(beforeCandidate, await treeBytes(root));

      await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: "0.8.6", dryRun: false, acceptApplicationOwned: true },
        finalizedPolicy,
      );
      assert.equal(await readFile(lockPath, "utf8"), lockBefore, `${profile} lockfile remains byte-identical`);
      assert.equal(
        sha256(await readFile(join(root, storybookBaseline.path))),
        storybookBaseline.targetSha256,
        `${profile} receives immutable Storybook optimizer compatibility bytes`,
      );
      const manifest = JSON.parse(await readFile(join(root, ".vireo/example-manifest.json"), "utf8"));
      assert.equal(manifest.templateCommit, target.templateCommit);
      assert.equal(
        manifest.files["frontend/tests/e2e/overview.spec.ts"],
        profile === "full-stack" ? pristine084OverviewDigest : undefined,
      );
      const samplePath =
        profile === "frontend" ? "src/features/item/public.ts" : "frontend/src/features/item/public.ts";
      assert.equal(manifest.files[samplePath], sha256(await readFile(join(root, samplePath))));
      const upgradeReceiptPath = join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json");
      const receipt = JSON.parse(await readFile(upgradeReceiptPath, "utf8"));
      assert.ok(receipt.managedSurfaces.includes(".vireo/example-manifest.json"));
      const receiptBeforeRepeat = await readFile(upgradeReceiptPath, "utf8");
      const repeatedBeforeRemoval = await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: "0.8.6" },
        finalizedPolicy,
      );
      assert.ok(repeatedBeforeRemoval.files.every(file => file.status === "unchanged"));
      assert.equal(await readFile(upgradeReceiptPath, "utf8"), receiptBeforeRepeat);

      const removal = await removeExample(root, true);
      assert.equal(removal.state, "removed");
      await assert.rejects(readFile(join(root, ".vireo/example-manifest.json")), /ENOENT/u);
      assert.equal(removal.files.find(file => file.path === samplePath)?.status, "delete");
      await assert.rejects(readFile(join(root, samplePath)), /ENOENT/u);
      if (profile === "full-stack") {
        await assert.rejects(readFile(join(root, "frontend/tests/e2e/overview.spec.ts")), /ENOENT/u);
        assert.equal(await readFile(join(root, "frontend/tests/e2e/login.spec.ts"), "utf8"), "export {};\n");
      }
      const receiptAfterRemoval = await readFile(upgradeReceiptPath, "utf8");
      assert.equal(receiptAfterRemoval, receiptBeforeRepeat, "sample removal does not rewrite prior upgrade evidence");
      const repeated = await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: "0.8.6" },
        finalizedPolicy,
      );
      assert.ok(repeated.files.every(file => file.status === "unchanged"));
      assert.equal(await readFile(upgradeReceiptPath, "utf8"), receiptAfterRemoval);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.8.4 to 0.8.6 refuses customized Overview bytes or a wrong predeclared digest before writing", async () => {
  const { finalizedPolicy, source } = synthetic085Policies();
  for (const scenario of ["customized-bytes", "wrong-declared-digest"]) {
    const root = await overview085Fixture("full-stack", source);
    try {
      const overviewPath = join(root, "frontend/tests/e2e/overview.spec.ts");
      if (scenario === "customized-bytes") {
        await writeFile(overviewPath, `${pristine084OverviewSpec}// consumer customization\n`);
      } else {
        const manifestPath = join(root, ".vireo/example-manifest.json");
        const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
        manifest.files["frontend/tests/e2e/overview.spec.ts"] = "0".repeat(64);
        await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      }
      const before = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: "0.8.6" }, finalizedPolicy),
        error =>
          error.code === "VIR-UPG-003" &&
          (scenario === "customized-bytes"
            ? /Overview sample differs/u
            : /customized full-stack Overview sample digest/u
          ).test(error.message),
      );
      assertSameSnapshot(before, await treeBytes(root));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.8.4 to 0.8.6 refuses a pre-existing target-edge upgrade receipt before writing", async () => {
  const { finalizedPolicy, source } = synthetic085Policies();
  const root = await overview085Fixture("frontend", source);
  try {
    await writeFile(join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json"), "{}\n");
    const before = await treeBytes(root);
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: "0.8.6" }, finalizedPolicy),
      error => error.code === "VIR-UPG-003" && /target-edge upgrade receipt already exists/u.test(error.message),
    );
    assertSameSnapshot(before, await treeBytes(root));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("already-target 0.8.6 refuses forged or stale historical upgrade receipts without writing", async () => {
  const { finalizedPolicy, source } = synthetic085Policies();
  for (const scenario of ["null", "wrong-commit", "wrong-surfaces", "wrong-actions", "extra-field"]) {
    const root = await overview085Fixture("frontend", source);
    try {
      await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: "0.8.6", dryRun: false, acceptApplicationOwned: true },
        finalizedPolicy,
      );
      const receiptPath = join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      if (scenario === "null") await writeFile(receiptPath, "null\n");
      else {
        if (scenario === "wrong-commit") receipt.targetTemplateCommit = "0".repeat(40);
        if (scenario === "wrong-surfaces") receipt.managedSurfaces = ["package.json#scripts.vireo"];
        if (scenario === "wrong-actions") receipt.applicationOwnedActions = [{ id: "forged" }];
        if (scenario === "extra-field") receipt.forged = true;
        await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
      }
      const before = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: "0.8.6" }, finalizedPolicy),
        error => error.code === "VIR-UPG-003",
        scenario,
      );
      assertSameSnapshot(before, await treeBytes(root));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.8.4 to 0.8.6 transactionally migrates a completed removal receipt without recreating example provenance", async () => {
  const { finalizedPolicy, source, target } = synthetic085Policies();
  const root = await overview085Fixture("frontend", source);
  try {
    await rm(join(root, ".vireo/example-manifest.json"));
    await rm(join(root, "src/features/item/public.ts"));
    const receiptPath = join(root, ".vireo/remove-example.json");
    const sourceReceipt = `${JSON.stringify(
      { schemaVersion: 1, templateCommit: source.templateCommit, removed: true },
      null,
      2,
    )}\n`;
    await writeFile(receiptPath, sourceReceipt);
    const beforePreview = await treeBytes(root);
    const preview = await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: "0.8.6" },
      finalizedPolicy,
    );
    assert.equal(preview.files.find(file => file.path === ".vireo/remove-example.json")?.status, "update");
    assert.equal(
      preview.files.some(file => file.path === ".vireo/example-manifest.json"),
      false,
    );
    assertSameSnapshot(beforePreview, await treeBytes(root));
    await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: "0.8.6", dryRun: false, acceptApplicationOwned: true },
      finalizedPolicy,
    );
    await assert.rejects(readFile(join(root, ".vireo/example-manifest.json")), /ENOENT/u);
    const upgradedReceipt = JSON.parse(await readFile(receiptPath, "utf8"));
    assert.equal(upgradedReceipt.removed, true);
    assert.equal(upgradedReceipt.templateCommit, target.templateCommit);
    const record = JSON.parse(await readFile(join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json"), "utf8"));
    assert.ok(record.managedSurfaces.includes(".vireo/remove-example.json"));
    const receiptBeforeRepeat = await readFile(join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json"), "utf8");
    const repeated = await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: "0.8.6" },
      finalizedPolicy,
    );
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
    assert.equal(await readFile(join(root, ".vireo/upgrade-0.8.4-to-0.8.6.json"), "utf8"), receiptBeforeRepeat);

    const journalChanges = await Promise.all(
      [
        "package.json",
        ".vireo/project.json",
        ".vireo/managed-files.json",
        ".vireo/remove-example.json",
        ".vireo/upgrade-0.8.4-to-0.8.6.json",
      ].map(async path => ({
        path,
        previousBase64:
          path === ".vireo/upgrade-0.8.4-to-0.8.6.json"
            ? null
            : Buffer.from(beforePreview.get(path) ?? "").toString("base64"),
      })),
    );
    await writeFile(
      join(root, ".vireo/upgrade-journal.json"),
      `${JSON.stringify({ schemaVersion: 1, changes: journalChanges })}\n`,
    );
    await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: "0.8.6", dryRun: false, acceptApplicationOwned: true },
      finalizedPolicy,
    );
    assert.equal(JSON.parse(await readFile(receiptPath, "utf8")).templateCommit, target.templateCommit);
    await assert.rejects(readFile(join(root, ".vireo/upgrade-journal.json")), /ENOENT/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("0.8.4 to 0.8.6 refuses missing, malformed, or conflicting example-removal provenance", async () => {
  const { finalizedPolicy, source } = synthetic085Policies();
  for (const scenario of ["missing", "malformed-receipt", "conflicting-states", "symlink-receipt"]) {
    const root = await overview085Fixture("frontend", source);
    try {
      const manifestPath = join(root, ".vireo/example-manifest.json");
      const receiptPath = join(root, ".vireo/remove-example.json");
      if (scenario !== "conflicting-states") await rm(manifestPath);
      if (scenario === "malformed-receipt") await writeFile(receiptPath, '{"removed":false}\n');
      if (scenario === "conflicting-states") {
        await writeFile(
          receiptPath,
          `${JSON.stringify({ schemaVersion: 1, templateCommit: source.templateCommit, removed: true }, null, 2)}\n`,
        );
      }
      if (scenario === "symlink-receipt") {
        const outsideReceipt = join(root, "outside-receipt.json");
        await writeFile(outsideReceipt, "{}\n");
        await symlink(outsideReceipt, receiptPath, "file");
      }
      const before = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: "0.8.6" }, finalizedPolicy),
        error => error.code === "VIR-UPG-003",
        scenario,
      );
      assertSameSnapshot(before, await treeBytes(root));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.7.0 projects expose a non-writing adjacent 0.8.0 status and dry run for both profiles", async () => {
  for (const profile of ["full-stack", "frontend"]) {
    const root = await adjacentFixture(profile);
    try {
      const before = await treeBytes(root);
      const status = await vireoProjectStatus(root);
      assert.equal(status.recordedRelease, adjacentSourceRelease);
      assert.equal(status.nextHop, adjacentTargetRelease);
      assert.ok(status.managedFiles.some(file => file.state === "add"));
      assert.match(formatVireoStatusText(status).join("\n"), /next hop: 0\.8\.0/u);
      const preview = await upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease });
      assert.equal(preview.dryRun, true);
      assert.ok(preview.files.some(file => file.status === "create"));
      assert.match(
        preview.checks.find(check => check.id === "lockfile").detail,
        profile === "frontend"
          ? /corepack npm install --package-lock-only before verification/u
          : /corepack npm install --package-lock-only --prefix frontend before verification/u,
      );
      if (profile === "full-stack") {
        assert.ok(preview.files.some(file => file.path === "gradle.properties" && file.status === "update"));
        assert.equal(await readFile(join(root, "gradle.properties"), "utf8"), "starterVersion=0.3.0\n");
      } else {
        assert.ok(preview.files.every(file => file.path !== "gradle.properties"));
      }
      assertSameSnapshot(before, await treeBytes(root));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("managed baselines fail closed for missing required bytes while valid deletes remain supported", async () => {
  const root = await adjacentFixture("frontend");
  try {
    const missingAddTarget = structuredClone(adjacentPolicy);
    delete missingAddTarget.releaseGraph.baselines[adjacentEdge].frontend[0].targetSha256;
    delete missingAddTarget.releaseGraph.baselines[adjacentEdge].frontend[0].targetContent;
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: adjacentTargetRelease }, missingAddTarget),
      error => error.code === "VIR-UPG-001",
    );

    const missingUpdateSource = structuredClone(adjacentPolicy);
    const updatePath = "managed/required-source.txt";
    const targetContent = "target bytes\n";
    missingUpdateSource.releaseGraph.baselines[adjacentEdge].frontend.push({
      path: updatePath,
      operation: "update",
      targetSha256: sha256(targetContent),
      targetContent,
    });
    await mkdir(join(root, "managed"), { recursive: true });
    await writeFile(join(root, updatePath), "source bytes\n");
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease: adjacentTargetRelease }, missingUpdateSource),
      error => error.code === "VIR-UPG-001",
    );

    const validDelete = structuredClone(adjacentPolicy);
    const deletePath = "managed/valid-delete.txt";
    const sourceContent = "remove these bytes\n";
    validDelete.releaseGraph.baselines[adjacentEdge].frontend.push({
      path: deletePath,
      operation: "delete",
      sourceSha256: sha256(sourceContent),
      sourceContent,
    });
    await writeFile(join(root, deletePath), sourceContent);
    const preview = await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: adjacentTargetRelease },
      validDelete,
    );
    assert.ok(preview.files.some(file => file.path === deletePath && file.status === "delete"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("0.7.0 to 0.8.0 adds managed skills once and preserves application-owned bytes", async () => {
  for (const profile of ["full-stack", "frontend"]) {
    const root = await adjacentFixture(profile);
    try {
      const applied = await upgradeVireoProject({
        projectDirectory: root,
        targetRelease: adjacentTargetRelease,
        dryRun: false,
        acceptApplicationOwned: true,
      });
      assert.ok(applied.files.some(file => file.status === "create"));
      assert.equal(
        await readFile(join(root, "application-owned.txt"), "utf8"),
        "keep this application customization\n",
      );
      assert.equal(await readFile(join(root, "AGENTS.md"), "utf8"), "application-owned guidance\n");
      if (profile === "full-stack") {
        assert.equal(await readFile(join(root, "gradle.properties"), "utf8"), "starterVersion=0.3.1\n");
      } else {
        await assert.rejects(readFile(join(root, "gradle.properties")), /ENOENT/u);
      }
      for (const baseline of adjacentPolicy.releaseGraph.baselines[adjacentEdge][profile]) {
        assert.equal(await readFile(join(root, baseline.path), "utf8"), baseline.targetContent, baseline.path);
      }
      await assert.rejects(
        readFile(join(root, ".vireo", "application", ".agents", "skills", "vireo-app-feature-author", "SKILL.md")),
        /ENOENT/u,
      );
      const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
      assert.equal(metadata.lastUpgradedBy, "create-vireo@0.8.0");
      assert.equal(metadata.templateCommit, adjacentTarget.templateCommit);
      const managed = JSON.parse(await readFile(join(root, ".vireo/managed-files.json"), "utf8"));
      for (const baseline of adjacentPolicy.releaseGraph.baselines[adjacentEdge][profile]) {
        assert.ok(
          managed.files.some(file => file.path === baseline.path),
          baseline.path,
        );
      }
      assert.ok(
        managed.files.every(file => !file.path.startsWith(".vireo/application/.agents/")),
        "consumer skill additions must never be recorded under Template-only provenance paths",
      );
      const repeated = await upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease });
      assert.ok(repeated.files.every(file => file.status === "unchanged"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("structurally valid candidate policy rejects preview and apply without writes", async () => {
  const root = await adjacentFixture("frontend");
  try {
    const { candidatePolicy, targetRelease } = releaseLifecyclePolicies(
      adjacentPolicy,
      adjacentSourceRelease,
      adjacentTargetRelease,
    );
    const beforeCandidate = await treeBytes(root);
    for (const options of [
      { projectDirectory: root, targetRelease, dryRun: true },
      { projectDirectory: root, targetRelease, dryRun: false, acceptApplicationOwned: true },
    ]) {
      await assert.rejects(upgradeVireoProjectForTest(options, candidatePolicy), error => error.code === "VIR-UPG-008");
      assertSameSnapshot(beforeCandidate, await treeBytes(root));
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("0.7.0 adjacent upgrades reject unknown commits, managed drift, unsafe paths, symlinks, and dry journal recovery", async () => {
  const root = await adjacentFixture("frontend");
  try {
    const metadataPath = join(root, ".vireo/project.json");
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    metadata.templateCommit = "not-an-immutable-commit";
    await writeFile(metadataPath, JSON.stringify(metadata));
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-002",
    );
    metadata.templateCommit = adjacentSourceCommit;
    await writeFile(metadataPath, JSON.stringify(metadata));
    const driftedPath = adjacentPolicy.releaseGraph.baselines[adjacentEdge].frontend[0].path;
    await mkdir(dirname(join(root, driftedPath)), { recursive: true });
    await writeFile(join(root, driftedPath), "customized\n");
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-003",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }

  const unsafe = await adjacentFixture("frontend");
  try {
    await writeFile(
      join(unsafe, ".vireo/managed-files.json"),
      JSON.stringify({
        schemaVersion: 1,
        templateCommit: adjacentSourceCommit,
        files: [{ path: "../outside", sha256: "a".repeat(64) }],
      }),
    );
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: unsafe, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-001",
    );
  } finally {
    await rm(unsafe, { recursive: true, force: true });
  }

  const linked = await adjacentFixture("frontend");
  try {
    await symlink(resolve(linked, ".."), join(linked, ".agents"));
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: linked, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-003",
    );
  } finally {
    await rm(linked, { recursive: true, force: true });
  }
});

test("upgrade provenance requires a recognized creation identity and a valid present upgrade identity", async () => {
  for (const mutate of [
    metadata => {
      metadata.createdBy = "create-vireo@99.99.99";
    },
    metadata => {
      metadata.lastUpgradedBy = "not-a-create-vireo-identity";
    },
  ]) {
    const root = await adjacentFixture("frontend");
    try {
      const metadataPath = join(root, ".vireo/project.json");
      const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
      mutate(metadata);
      await writeFile(metadataPath, JSON.stringify(metadata));
      await assert.rejects(
        upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease }),
        error => error.code === "VIR-UPG-002",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("interrupted 0.7.0 upgrade journals are non-writing in preview and recover before apply", async () => {
  const root = await adjacentFixture("frontend");
  try {
    await writeFile(join(root, "README.md"), "partially-written\n");
    await writeFile(
      join(root, ".vireo/upgrade-journal.json"),
      `${JSON.stringify({ schemaVersion: 1, changes: [{ path: "README.md", previousBase64: Buffer.from("original\n").toString("base64") }] })}\n`,
    );
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-009",
    );
    assert.equal(await readFile(join(root, "README.md"), "utf8"), "partially-written\n");
    await upgradeVireoProject({
      projectDirectory: root,
      targetRelease: adjacentTargetRelease,
      dryRun: false,
      acceptApplicationOwned: true,
    });
    assert.equal(await readFile(join(root, "README.md"), "utf8"), "original\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("current and legacy ejection evidence is reported and preserved across the adjacent upgrade", async () => {
  const root = await adjacentFixture("frontend");
  try {
    await writeFile(
      join(root, ".vireo/ejected-capabilities.json"),
      `${JSON.stringify({ schemaVersion: 1, capabilities: ["current-capability"] })}\n`,
    );
    await writeFile(join(root, "application-owned.txt"), "// @vireo-ejected\nlegacy customization\n");
    const before = await vireoProjectStatus(root);
    assert.deepEqual(before.capabilities, [
      { name: "current-capability", state: "ejected" },
      { name: "legacy:application-owned.txt", state: "ejected" },
    ]);
    await upgradeVireoProject({
      projectDirectory: root,
      targetRelease: adjacentTargetRelease,
      dryRun: false,
      acceptApplicationOwned: true,
    });
    assert.equal(
      await readFile(join(root, "application-owned.txt"), "utf8"),
      "// @vireo-ejected\nlegacy customization\n",
    );
    const after = await vireoProjectStatus(root);
    assert.deepEqual(after.capabilities, before.capabilities);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("0.8.2 to 0.8.3 refreshes only declarations and provenance for both profiles", async () => {
  const sourceRelease = "0.8.2";
  const targetRelease = "0.8.3";
  const edge = `${sourceRelease}->${targetRelease}`;
  const { candidatePolicy, finalizedPolicy } = releaseLifecyclePolicies(adjacentPolicy, sourceRelease, targetRelease);
  const source = candidatePolicy.releaseGraph.releases.find(release => release.release === sourceRelease);
  const target = candidatePolicy.releaseGraph.releases.find(release => release.release === targetRelease);
  assert.ok(source && target, "the 0.8.2 source and 0.8.3 candidate must be declared");
  const packageCompatibilityBaseline = candidatePolicy.releaseGraph.baselines[edge]["full-stack"][0];
  const packageCompatibilityContractBaseline = candidatePolicy.releaseGraph.baselines[edge]["full-stack"][1];
  const packageCompatibilitySource = await readFile(
    new URL("../fixtures/project-upgrades/vireo-package-compatibility.0.8.2.mjs", import.meta.url),
    "utf8",
  );
  const packageCompatibilityContractSource = await readFile(
    new URL("../fixtures/project-upgrades/vireo-package-compatibility.0.8.2.json", import.meta.url),
    "utf8",
  );
  assert.equal(sha256(packageCompatibilitySource), packageCompatibilityBaseline.sourceSha256);
  assert.equal(sha256(packageCompatibilityContractSource), packageCompatibilityContractBaseline.sourceSha256);

  for (const profile of ["full-stack", "frontend"]) {
    const root = await mkdtemp(join(tmpdir(), `vireo-${profile}-082-`));
    try {
      const frontendOnly = profile === "frontend";
      await mkdir(join(root, ".vireo"), { recursive: true });
      if (!frontendOnly) await mkdir(join(root, "frontend"), { recursive: true });
      if (!frontendOnly) await mkdir(join(root, "scripts"), { recursive: true });
      if (!frontendOnly) await mkdir(join(root, "contracts"), { recursive: true });
      const sourceDependencies = { ...source.frontendDependencies, react: "^19.0.0" };
      const rootManifest = {
        name: `vireo-${profile}-upgrade`,
        scripts: {
          vireo: source.rootVireoScript,
          ...(frontendOnly ? { "doctor:json": source.managedRootScripts["doctor:json"] } : {}),
        },
        ...(frontendOnly ? { dependencies: sourceDependencies } : {}),
      };
      await writeFile(join(root, "package.json"), `${JSON.stringify(rootManifest, null, 2)}\n`);
      const lockPath = join(root, frontendOnly ? "package-lock.json" : "frontend/package-lock.json");
      if (!frontendOnly)
        await writeFile(
          join(root, "frontend/package.json"),
          `${JSON.stringify({ dependencies: sourceDependencies }, null, 2)}\n`,
        );
      await writeFile(
        lockPath,
        `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies: sourceDependencies } } }, null, 2)}\n`,
      );
      if (!frontendOnly)
        await writeFile(join(root, "gradle.properties"), `starterVersion=${source.starterJvmVersion}\n`);
      if (!frontendOnly) await writeFile(join(root, packageCompatibilityBaseline.path), packageCompatibilitySource);
      if (!frontendOnly)
        await writeFile(join(root, packageCompatibilityContractBaseline.path), packageCompatibilityContractSource);
      await writeFile(join(root, "application-owned.txt"), "retain this product decision\n");
      await writeFile(
        join(root, ".vireo/project.json"),
        `${JSON.stringify({ schemaVersion: 1, profile, projectName: `vireo-${profile}-upgrade`, ...(frontendOnly ? {} : { javaPackage: "dev.example.upgrade", database: "h2" }), templateCommit: source.templateCommit, templateVersion: sourceRelease, templateTag: `starter-template@${sourceRelease}`, createdBy: `create-vireo@${sourceRelease}`, lastUpgradedBy: `create-vireo@${sourceRelease}` }, null, 2)}\n`,
      );
      const managedPaths = frontendOnly
        ? ["package.json"]
        : [
            "package.json",
            "frontend/package.json",
            "gradle.properties",
            packageCompatibilityBaseline.path,
            packageCompatibilityContractBaseline.path,
          ];
      await writeFile(
        join(root, ".vireo/managed-files.json"),
        `${JSON.stringify({ schemaVersion: 1, templateCommit: source.templateCommit, files: await Promise.all(managedPaths.map(async path => ({ path, sha256: sha256(await readFile(join(root, path))) }))) }, null, 2)}\n`,
      );

      const beforeCandidate = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, candidatePolicy),
        error => error.code === "VIR-UPG-008",
      );
      assertSameSnapshot(beforeCandidate, await treeBytes(root));

      const lockBefore = await readFile(lockPath, "utf8");
      const preview = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
      assert.ok(preview.files.some(file => file.path === "package.json" && file.status === "update"));
      assert.ok(preview.files.every(file => !file.path.endsWith("package-lock.json")));
      if (!frontendOnly) {
        assert.ok(
          preview.files.some(file => file.path === packageCompatibilityBaseline.path && file.status === "update"),
        );
        assert.ok(
          preview.files.some(
            file => file.path === packageCompatibilityContractBaseline.path && file.status === "update",
          ),
        );
        await writeFile(join(root, packageCompatibilityBaseline.path), "customized compatibility evaluator\n");
        await assert.rejects(
          upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy),
          error => error.code === "VIR-UPG-003",
        );
        await writeFile(join(root, packageCompatibilityBaseline.path), packageCompatibilitySource);
      } else {
        assert.ok(preview.files.every(file => file.path !== packageCompatibilityBaseline.path));
      }
      assert.match(
        preview.checks.find(check => check.id === "lockfile").detail,
        frontendOnly
          ? /corepack npm install --package-lock-only before verification/u
          : /corepack npm install --package-lock-only --prefix frontend before verification/u,
      );
      assert.equal(
        preview.manualActions[0].verificationCommands[0],
        frontendOnly
          ? "corepack npm install --package-lock-only"
          : "corepack npm install --package-lock-only --prefix frontend",
      );

      await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease, dryRun: false, acceptApplicationOwned: true },
        finalizedPolicy,
      );
      const upgradedFrontend = JSON.parse(
        await readFile(join(root, frontendOnly ? "package.json" : "frontend/package.json"), "utf8"),
      );
      assert.equal(upgradedFrontend.dependencies["@vireocodedev/ui"], "^0.3.1");
      assert.equal(upgradedFrontend.dependencies["@vireocodedev/history"], "^0.2.2");
      assert.equal(await readFile(lockPath, "utf8"), lockBefore, "lock records remain application-owned");
      assert.equal(JSON.parse(lockBefore).packages[""].dependencies["@vireocodedev/ui"], "^0.3.0");
      assert.equal(await readFile(join(root, "application-owned.txt"), "utf8"), "retain this product decision\n");
      if (!frontendOnly)
        assert.equal(
          sha256(await readFile(join(root, packageCompatibilityBaseline.path))),
          packageCompatibilityBaseline.targetSha256,
        );
      if (!frontendOnly)
        assert.equal(
          sha256(await readFile(join(root, packageCompatibilityContractBaseline.path))),
          packageCompatibilityContractBaseline.targetSha256,
        );

      const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
      assert.equal(metadata.templateCommit, target.templateCommit);
      assert.equal(metadata.templateVersion, targetRelease);
      assert.equal(metadata.templateTag, "starter-template@0.8.3");
      assert.equal(metadata.lastUpgradedBy, "create-vireo@0.8.3");
      const receiptPath = join(root, ".vireo/upgrade-0.8.2-to-0.8.3.json");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      assert.equal(receipt.targetTemplateCommit, target.templateCommit);
      assert.deepEqual(receipt.applicationOwnedActions, preview.manualActions);
      const managed = JSON.parse(await readFile(join(root, ".vireo/managed-files.json"), "utf8"));
      assert.equal(managed.templateCommit, target.templateCommit);
      for (const file of managed.files)
        assert.equal(sha256(await readFile(join(root, file.path))), file.sha256, `managed digest ${file.path}`);

      const receiptBeforeRepeat = await readFile(receiptPath, "utf8");
      const repeated = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
      assert.ok(repeated.files.every(file => file.status === "unchanged"));
      assert.equal(await readFile(receiptPath, "utf8"), receiptBeforeRepeat);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.8.3 to 0.8.4 manages Lighthouse policy for both profiles without lockfile churn", async () => {
  const sourceRelease = "0.8.3";
  const targetRelease = "0.8.4";
  const edge = `${sourceRelease}->${targetRelease}`;
  const { candidatePolicy, finalizedPolicy } = releaseLifecyclePolicies(adjacentPolicy, sourceRelease, targetRelease);
  const source = candidatePolicy.releaseGraph.releases.find(release => release.release === sourceRelease);
  const target = candidatePolicy.releaseGraph.releases.find(release => release.release === targetRelease);
  assert.ok(source && target, "the 0.8.3 source and 0.8.4 candidate must be declared");

  for (const profile of ["full-stack", "frontend"]) {
    const root = await mkdtemp(join(tmpdir(), `vireo-${profile}-083-performance-`));
    try {
      const frontendOnly = profile === "frontend";
      const baselines = candidatePolicy.releaseGraph.baselines[edge][profile];
      const update = baselines.find(file => file.operation === "update" && file.path.endsWith("lighthouse-budget.mjs"));
      assert.ok(update?.sourceContent, `${profile} has a source Lighthouse budget baseline`);
      await mkdir(join(root, ".vireo"), { recursive: true });
      if (!frontendOnly) {
        await mkdir(join(root, "frontend/scripts"), { recursive: true });
        await mkdir(join(root, "contracts"), { recursive: true });
      } else await mkdir(join(root, "scripts"), { recursive: true });
      const dependencies = { ...source.frontendDependencies, react: "^19.0.0" };
      const frontendScripts = frontendOnly
        ? {
            vireo: source.rootVireoScript,
            "doctor:json": source.managedRootScripts["doctor:json"],
          }
        : source.managedFrontendScripts["full-stack"];
      await writeFile(
        join(root, "package.json"),
        `${JSON.stringify(
          {
            name: `vireo-${profile}-upgrade`,
            scripts: frontendOnly ? frontendScripts : { vireo: source.rootVireoScript },
            ...(frontendOnly ? { dependencies } : {}),
          },
          null,
          2,
        )}\n`,
      );
      if (!frontendOnly)
        await writeFile(
          join(root, "frontend/package.json"),
          `${JSON.stringify({ scripts: frontendScripts, dependencies }, null, 2)}\n`,
        );
      const lockPath = join(root, frontendOnly ? "package-lock.json" : "frontend/package-lock.json");
      await writeFile(
        lockPath,
        `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
      );
      if (!frontendOnly)
        await writeFile(join(root, "gradle.properties"), `starterVersion=${source.starterJvmVersion}\n`);
      for (const baseline of baselines.filter(file => file.operation === "update")) {
        await mkdir(join(root, dirname(baseline.path)), { recursive: true });
        await writeFile(join(root, baseline.path), baseline.sourceContent);
      }
      await writeFile(join(root, "product-note.txt"), "do not modify\n");
      await writeFile(
        join(root, ".vireo/project.json"),
        `${JSON.stringify(
          {
            schemaVersion: 1,
            profile,
            projectName: `vireo-${profile}-upgrade`,
            ...(frontendOnly ? {} : { javaPackage: "dev.example.upgrade", database: "h2" }),
            templateCommit: source.templateCommit,
            templateVersion: sourceRelease,
            templateTag: `starter-template@${sourceRelease}`,
            createdBy: `create-vireo@${sourceRelease}`,
            lastUpgradedBy: `create-vireo@${sourceRelease}`,
          },
          null,
          2,
        )}\n`,
      );
      const managedPaths = [
        "package.json",
        ...(frontendOnly ? [] : ["frontend/package.json", "gradle.properties"]),
        ...baselines.filter(file => file.operation === "update").map(file => file.path),
      ];
      await writeFile(
        join(root, ".vireo/managed-files.json"),
        `${JSON.stringify(
          {
            schemaVersion: 1,
            templateCommit: source.templateCommit,
            files: await Promise.all(
              managedPaths.map(async path => ({ path, sha256: sha256(await readFile(join(root, path))) })),
            ),
          },
          null,
          2,
        )}\n`,
      );

      const beforeCandidate = await treeBytes(root);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, candidatePolicy),
        error => error.code === "VIR-UPG-008",
      );
      assertSameSnapshot(beforeCandidate, await treeBytes(root));

      const lockBefore = await readFile(lockPath, "utf8");
      const preview = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
      assert.equal(preview.checks.find(check => check.id === "lockfile")?.status, "pass");
      assert.match(preview.checks.find(check => check.id === "lockfile")?.detail, /lockfile is preserved/u);
      assert.ok(preview.files.some(file => file.path.endsWith("lighthouse-policy.mjs") && file.status === "create"));
      assert.ok(
        preview.files.some(file => file.path.endsWith("vitest.storybook.config.ts") && file.status === "update"),
        "Storybook optimizer compatibility baseline is managed",
      );
      assert.equal(
        preview.manualActions[0].verificationCommands[0],
        frontendOnly
          ? "corepack npm run performance:policy:test"
          : "corepack npm --prefix frontend run performance:policy:test",
      );
      assert.equal(
        preview.manualActions[0].verificationCommands[1],
        frontendOnly ? "corepack npm run performance:audit" : "corepack npm --prefix frontend run performance:audit",
      );
      const manifestPath = join(root, frontendOnly ? "package.json" : "frontend/package.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      manifest.scripts["performance:policy:test"] = "customized";
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy),
        error => error.code === "VIR-UPG-003",
      );
      if (frontendOnly) delete manifest.scripts["performance:policy:test"];
      else manifest.scripts["performance:policy:test"] = undefined;
      if (manifest.scripts["performance:policy:test"] === undefined) delete manifest.scripts["performance:policy:test"];
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

      const storybookBaseline = baselines.find(file => file.path.endsWith("vitest.storybook.config.ts"));
      assert.ok(storybookBaseline?.sourceContent, `${profile} has an exact Storybook source baseline`);
      await writeFile(join(root, storybookBaseline.path), `${storybookBaseline.sourceContent}// customized\n`);
      await assert.rejects(
        upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy),
        error => error.code === "VIR-UPG-003",
      );
      await writeFile(join(root, storybookBaseline.path), storybookBaseline.sourceContent);

      await upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease, dryRun: false, acceptApplicationOwned: true },
        finalizedPolicy,
      );
      assert.equal(await readFile(lockPath, "utf8"), lockBefore, "lockfiles remain byte-identical");
      assert.equal(await readFile(join(root, "product-note.txt"), "utf8"), "do not modify\n");
      const upgraded = JSON.parse(await readFile(manifestPath, "utf8"));
      assert.equal(
        upgraded.scripts["performance:policy:test"],
        target.managedFrontendScripts[profile]["performance:policy:test"],
      );
      assert.equal(upgraded.scripts["performance:audit"], target.managedFrontendScripts[profile]["performance:audit"]);
      assert.match(
        await readFile(join(root, storybookBaseline.path), "utf8"),
        /optimizeDeps: \{ include: \["@testing-library\/dom"\] \}/u,
      );
      for (const baseline of baselines) {
        const contents = await readFile(join(root, baseline.path), "utf8");
        assert.equal(sha256(contents), baseline.targetSha256, `${profile} baseline ${baseline.path}`);
      }
      for (const path of frontendOnly
        ? ["tests/demo/flagship-demo.spec.ts", "tests/e2e/overview.spec.ts"]
        : ["frontend/tests/demo/flagship-demo.spec.ts", "frontend/tests/e2e/overview.spec.ts"]) {
        await assert.rejects(readFile(join(root, path)), /ENOENT/u, `${profile} does not add optional browser tests`);
      }
      const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
      assert.equal(metadata.templateCommit, target.templateCommit);
      assert.equal(metadata.lastUpgrade.lockfileRefresh, "not-required");
      const receipt = JSON.parse(await readFile(join(root, ".vireo/upgrade-0.8.3-to-0.8.4.json"), "utf8"));
      assert.equal(receipt.lockfileRefresh, "not-required");
      const repeated = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
      assert.ok(repeated.files.every(file => file.status === "unchanged"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.8.1 frontend Doctor upgrade is exact, refuses customization, preserves application bytes, and is idempotent", async () => {
  const sourceRelease = "0.8.1";
  const targetRelease = "0.8.2";
  const edge = `${sourceRelease}->${targetRelease}`;
  const source = adjacentPolicy.releaseGraph.releases.find(release => release.release === sourceRelease);
  const target = adjacentPolicy.releaseGraph.releases.find(release => release.release === targetRelease);
  const sourceDoctor = adjacentPolicy.releaseGraph.baselines["0.6.0->0.7.0"].frontend[0].targetContent;
  const targetDoctor = adjacentPolicy.releaseGraph.baselines[edge].frontend[0];
  const { candidatePolicy, finalizedPolicy } = releaseLifecyclePolicies(adjacentPolicy, sourceRelease, targetRelease);
  const root = await mkdtemp(join(tmpdir(), "vireo-081-frontend-"));
  try {
    await mkdir(join(root, ".vireo"), { recursive: true });
    await mkdir(join(root, "scripts"), { recursive: true });
    const dependencies = { ...source.frontendDependencies, react: "^19.0.0" };
    await writeFile(
      join(root, "package.json"),
      `${JSON.stringify({ name: "doctor-upgrade", scripts: { vireo: source.rootVireoScript, doctor: "node scripts/vireo-frontend-doctor.mjs" }, dependencies }, null, 2)}\n`,
    );
    await writeFile(
      join(root, "package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    await writeFile(join(root, "scripts/vireo-frontend-doctor.mjs"), sourceDoctor);
    await writeFile(join(root, "application-owned.txt"), "retain this product decision\n");
    await writeFile(
      join(root, ".vireo/project.json"),
      `${JSON.stringify({ schemaVersion: 1, profile: "frontend", projectName: "doctor-upgrade", templateCommit: source.templateCommit, templateVersion: source.release, templateTag: `starter-template@${source.release}`, createdBy: "create-vireo@0.8.0", lastUpgradedBy: `create-vireo@${source.release}` }, null, 2)}\n`,
    );
    await writeFile(
      join(root, ".vireo/managed-files.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          templateCommit: source.templateCommit,
          files: [
            { path: "package.json", sha256: sha256(await readFile(join(root, "package.json"))) },
            { path: "scripts/vireo-frontend-doctor.mjs", sha256: sha256(sourceDoctor) },
          ],
        },
        null,
        2,
      )}\n`,
    );
    const originalApplicationBytes = await readFile(join(root, "application-owned.txt"));
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, candidatePolicy),
      error => error.code === "VIR-UPG-008",
    );
    const preview = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
    assert.ok(
      preview.files.some(file => file.path === "scripts/vireo-frontend-doctor.mjs" && file.status === "update"),
    );
    await writeFile(join(root, "scripts/vireo-frontend-doctor.mjs"), "customized\n");
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy),
      error => error.code === "VIR-UPG-003",
    );
    await writeFile(join(root, "scripts/vireo-frontend-doctor.mjs"), sourceDoctor);
    const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    manifest.scripts["doctor:json"] = "custom doctor";
    await writeFile(join(root, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    const managedPath = join(root, ".vireo/managed-files.json");
    const sourceManaged = JSON.parse(await readFile(managedPath, "utf8"));
    sourceManaged.files.find(file => file.path === "package.json").sha256 = sha256(
      await readFile(join(root, "package.json")),
    );
    await writeFile(managedPath, `${JSON.stringify(sourceManaged, null, 2)}\n`);
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy),
      error => error.code === "VIR-UPG-003" && /package\.json scripts\.doctor:json/u.test(error.message),
    );
    delete manifest.scripts["doctor:json"];
    await writeFile(join(root, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    sourceManaged.files.find(file => file.path === "package.json").sha256 = sha256(
      await readFile(join(root, "package.json")),
    );
    await writeFile(managedPath, `${JSON.stringify(sourceManaged, null, 2)}\n`);
    await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease, dryRun: false, acceptApplicationOwned: true },
      finalizedPolicy,
    );
    assert.equal(await readFile(join(root, "application-owned.txt"), "utf8"), originalApplicationBytes.toString());
    assert.equal(sha256(await readFile(join(root, "scripts/vireo-frontend-doctor.mjs"))), targetDoctor.targetSha256);
    const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.createdBy, "create-vireo@0.8.0");
    assert.equal(metadata.lastUpgradedBy, "create-vireo@0.8.2");
    assert.equal(metadata.templateCommit, target.templateCommit);
    assert.equal(metadata.templateVersion, "0.8.2");
    assert.equal(metadata.templateTag, "starter-template@0.8.2");
    assert.deepEqual(metadata.lastUpgrade, {
      schemaVersion: 2,
      from: "0.8.1",
      to: "0.8.2",
      sourceTemplateCommit: source.templateCommit,
      targetTemplateCommit: target.templateCommit,
      sourceTemplateVersion: "0.8.1",
      targetTemplateVersion: "0.8.2",
      sourceTemplateTag: "starter-template@0.8.1",
      targetTemplateTag: "starter-template@0.8.2",
      lockfileRefresh: "required",
    });
    const managed = JSON.parse(await readFile(join(root, ".vireo/managed-files.json"), "utf8"));
    for (const file of managed.files)
      assert.equal(sha256(await readFile(join(root, file.path))), file.sha256, `managed digest ${file.path}`);
    const receiptPath = join(root, ".vireo", "upgrade-0.8.1-to-0.8.2.json");
    const receiptBeforeRepeat = await readFile(receiptPath, "utf8");
    assert.deepEqual(JSON.parse(receiptBeforeRepeat).managedSurfaces, [
      "package.json#scripts.vireo",
      "frontend/package.json#dependencies",
      "gradle.properties#starterVersion",
      ".vireo/project.json#templateCommit,templateVersion,templateTag,lastUpgradedBy,lastUpgrade",
      ".vireo/managed-files.json",
      "package.json#scripts.doctor:json",
      "scripts/vireo-frontend-doctor.mjs",
    ]);
    const repeated = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, finalizedPolicy);
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
    assert.equal(await readFile(receiptPath, "utf8"), receiptBeforeRepeat);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("finalized 0.8.1 full-stack Doctor migration updates realistic managed provenance exactly", async () => {
  const sourceRelease = "0.8.1";
  const targetRelease = "0.8.2";
  const { finalizedPolicy: policy } = releaseLifecyclePolicies(adjacentPolicy, sourceRelease, targetRelease);
  const source = policy.releaseGraph.releases.find(release => release.release === sourceRelease);
  const target = policy.releaseGraph.releases.find(release => release.release === targetRelease);
  const baselines = policy.releaseGraph.baselines[`${sourceRelease}->${targetRelease}`]["full-stack"];
  const sourceDoctor = "export const profile = 'source';\n";
  const targetDoctor = "export const profile = 'target';\n";
  const doctorTest = "export {};\n";
  baselines.splice(
    0,
    baselines.length,
    {
      path: "scripts/vireo-doctor.mjs",
      operation: "update",
      sourceSha256: sha256(sourceDoctor),
      targetSha256: sha256(targetDoctor),
      transforms: [{ from: "'source'", to: "'target'" }],
    },
    {
      path: "scripts/vireo-doctor.test.mjs",
      operation: "add",
      targetSha256: sha256(doctorTest),
      targetContent: doctorTest,
    },
  );
  const root = await mkdtemp(join(tmpdir(), "vireo-081-full-stack-"));
  try {
    await mkdir(join(root, ".vireo"), { recursive: true });
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "frontend"), { recursive: true });
    const dependencies = { ...source.frontendDependencies, react: "^19.0.0" };
    const rootManifest = {
      name: "full-stack-doctor-upgrade",
      scripts: { vireo: source.rootVireoScript, "doctor:json": "node scripts/vireo-doctor.mjs --json" },
    };
    await writeFile(join(root, "package.json"), `${JSON.stringify(rootManifest, null, 2)}\n`);
    await writeFile(join(root, "frontend/package.json"), `${JSON.stringify({ dependencies }, null, 2)}\n`);
    await writeFile(
      join(root, "frontend/package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    await writeFile(join(root, "gradle.properties"), `starterVersion=${source.starterJvmVersion}\n`);
    await writeFile(join(root, "scripts/vireo-doctor.mjs"), sourceDoctor);
    await writeFile(join(root, "application-owned.txt"), "preserve these bytes\n");
    await writeFile(
      join(root, ".vireo/project.json"),
      `${JSON.stringify({ schemaVersion: 1, profile: "full-stack", projectName: "full-stack-doctor-upgrade", javaPackage: "dev.example.doctor", database: "h2", templateCommit: source.templateCommit, templateVersion: source.release, templateTag: `starter-template@${source.release}`, createdBy: "create-vireo@0.8.0", lastUpgradedBy: `create-vireo@${source.release}` }, null, 2)}\n`,
    );
    const managedFiles = ["package.json", "frontend/package.json", "gradle.properties", "scripts/vireo-doctor.mjs"].map(
      async path => ({ path, sha256: sha256(await readFile(join(root, path))) }),
    );
    await writeFile(
      join(root, ".vireo/managed-files.json"),
      `${JSON.stringify({ schemaVersion: 1, templateCommit: source.templateCommit, files: await Promise.all(managedFiles) }, null, 2)}\n`,
    );
    await writeFile(join(root, "scripts/vireo-doctor.mjs"), "customized\n");
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, policy),
      error => error.code === "VIR-UPG-003",
    );
    await writeFile(join(root, "scripts/vireo-doctor.mjs"), sourceDoctor);
    await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease, dryRun: false, acceptApplicationOwned: true },
      policy,
    );
    assert.equal(await readFile(join(root, "scripts/vireo-doctor.mjs"), "utf8"), targetDoctor);
    assert.equal(await readFile(join(root, "scripts/vireo-doctor.test.mjs"), "utf8"), doctorTest);
    assert.equal(await readFile(join(root, "application-owned.txt"), "utf8"), "preserve these bytes\n");
    const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.createdBy, "create-vireo@0.8.0");
    assert.equal(metadata.lastUpgradedBy, "create-vireo@0.8.2");
    const managed = JSON.parse(await readFile(join(root, ".vireo/managed-files.json"), "utf8"));
    for (const file of managed.files)
      assert.equal(sha256(await readFile(join(root, file.path))), file.sha256, `managed digest ${file.path}`);
    const receiptPath = join(root, ".vireo", "upgrade-0.8.1-to-0.8.2.json");
    const receiptBeforeRepeat = await readFile(receiptPath, "utf8");
    assert.deepEqual(JSON.parse(receiptBeforeRepeat).managedSurfaces, [
      "package.json#scripts.vireo",
      "frontend/package.json#dependencies",
      "gradle.properties#starterVersion",
      ".vireo/project.json#templateCommit,templateVersion,templateTag,lastUpgradedBy,lastUpgrade",
      ".vireo/managed-files.json",
      "scripts/vireo-doctor.mjs",
      "scripts/vireo-doctor.test.mjs",
    ]);
    const repeated = await upgradeVireoProjectForTest({ projectDirectory: root, targetRelease }, policy);
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
    assert.equal(await readFile(receiptPath, "utf8"), receiptBeforeRepeat);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("synthetic adjacent add/delete transforms are visible, atomic, idempotent, and journal-recoverable", async () => {
  const root = await adjacentFixture("frontend");
  const policy = structuredClone(adjacentPolicy);
  const addContent = "new managed baseline\n";
  const emptyContent = "";
  const deleteContent = "obsolete managed baseline\n";
  policy.releaseGraph.baselines[adjacentEdge].frontend.push(
    { path: "managed/added.txt", operation: "add", targetSha256: sha256(addContent), targetContent: addContent },
    { path: "managed/empty.txt", operation: "add", targetSha256: sha256(emptyContent), targetContent: emptyContent },
    {
      path: "managed/deleted.txt",
      operation: "delete",
      sourceSha256: sha256(deleteContent),
      sourceContent: deleteContent,
    },
  );
  try {
    await mkdir(join(root, "managed"), { recursive: true });
    await writeFile(join(root, "managed/deleted.txt"), deleteContent);
    const before = await vireoProjectStatusForTest(root, policy);
    assert.deepEqual(
      before.managedFiles.filter(file => file.path.startsWith("managed/")).map(file => [file.path, file.state]),
      [
        ["managed/added.txt", "add"],
        ["managed/empty.txt", "add"],
        ["managed/deleted.txt", "delete"],
      ],
    );
    const preview = await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: adjacentTargetRelease },
      policy,
    );
    assert.deepEqual(
      preview.files.filter(file => file.path.startsWith("managed/")).map(file => [file.path, file.status]),
      [
        ["managed/added.txt", "create"],
        ["managed/empty.txt", "create"],
        ["managed/deleted.txt", "delete"],
      ],
    );
    await assert.rejects(
      upgradeVireoProjectForTest(
        { projectDirectory: root, targetRelease: adjacentTargetRelease, dryRun: false },
        policy,
      ),
      error => error.code === "VIR-UPG-007",
    );
    await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: adjacentTargetRelease, dryRun: false, acceptApplicationOwned: true },
      policy,
    );
    assert.equal(await readFile(join(root, "managed/added.txt"), "utf8"), addContent);
    assert.equal(await readFile(join(root, "managed/empty.txt"), "utf8"), emptyContent);
    await assert.rejects(readFile(join(root, "managed/deleted.txt"), "utf8"), /ENOENT/u);
    const managed = JSON.parse(await readFile(join(root, ".vireo/managed-files.json"), "utf8"));
    assert.ok(managed.files.some(file => file.path === "managed/added.txt"));
    assert.ok(!managed.files.some(file => file.path === "managed/deleted.txt"));
    const repeated = await upgradeVireoProjectForTest(
      { projectDirectory: root, targetRelease: adjacentTargetRelease },
      policy,
    );
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }

  const recovered = await adjacentFixture("frontend");
  try {
    await mkdir(join(recovered, "managed"), { recursive: true });
    await writeFile(join(recovered, "managed/added.txt"), addContent);
    await writeFile(
      join(recovered, ".vireo/upgrade-journal.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        changes: [
          { path: "managed/added.txt", previousBase64: null },
          { path: "managed/deleted.txt", previousBase64: Buffer.from(deleteContent).toString("base64") },
        ],
      })}\n`,
    );
    await assert.rejects(
      upgradeVireoProjectForTest({ projectDirectory: recovered, targetRelease: adjacentTargetRelease }, policy),
      error => error.code === "VIR-UPG-009",
    );
    await upgradeVireoProjectForTest(
      {
        projectDirectory: recovered,
        targetRelease: adjacentTargetRelease,
        dryRun: false,
        acceptApplicationOwned: true,
      },
      policy,
    );
    assert.equal(await readFile(join(recovered, "managed/added.txt"), "utf8"), addContent);
    await assert.rejects(readFile(join(recovered, "managed/deleted.txt"), "utf8"), /ENOENT/u);
  } finally {
    await rm(recovered, { recursive: true, force: true });
  }
});
