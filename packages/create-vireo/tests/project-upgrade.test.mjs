import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import {
  checkGeneratedEntities,
  generateEntity,
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
      ".vireo/project.json#templateCommit,lastUpgradedBy,lastUpgrade",
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

const adjacentSourceRelease = "0.6.0";
const adjacentTargetRelease = "0.7.0";
const adjacentSourceCommit = "5b123e60bd1ce733ae70711796552a17aaa60fe3";
const adjacentPolicy = JSON.parse(
  await readFile(new URL("../schema/vireo-upgrade-policy.json", import.meta.url), "utf8"),
);
const adjacentSource = adjacentPolicy.releaseGraph.releases.find(release => release.release === adjacentSourceRelease);
const adjacentTarget = adjacentPolicy.releaseGraph.releases.find(release => release.release === adjacentTargetRelease);

async function adjacentFixture(profile) {
  const root = await mkdtemp(join(tmpdir(), `vireo-${profile}-0.6-`));
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
    const doctor = adjacentPolicy.releaseGraph.baselines["0.6.0->0.7.0"].frontend[0];
    await writeFile(join(root, doctor.path), doctor.sourceContent);
  } else {
    await writeFile(join(root, "frontend/package.json"), `${JSON.stringify({ dependencies }, null, 2)}\n`);
    await writeFile(
      join(root, "frontend/package-lock.json"),
      `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
    );
    await writeFile(join(root, "gradle.properties"), `starterVersion=${adjacentSource.starterJvmVersion}\n`);
    for (const baseline of adjacentPolicy.releaseGraph.baselines["0.6.0->0.7.0"]["full-stack"]) {
      await mkdir(dirname(join(root, baseline.path)), { recursive: true });
      await writeFile(join(root, baseline.path), baseline.sourceContent);
    }
  }
  await writeFile(join(root, "application-owned.txt"), "keep this application customization\n");
  await writeFile(
    join(root, ".vireo/project.json"),
    `${JSON.stringify({ schemaVersion: 1, profile, projectName: "upgrade-fixture", ...(frontend ? {} : { javaPackage: "dev.example.upgradefixture", database: "h2" }), templateCommit: adjacentSourceCommit, createdBy: "create-vireo@0.6.0" }, null, 2)}\n`,
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

test("0.6.0 projects expose a non-writing adjacent 0.7.0 status and dry run for both profiles", async () => {
  for (const profile of ["full-stack", "frontend"]) {
    const root = await adjacentFixture(profile);
    try {
      const before = await treeBytes(root);
      const status = await vireoProjectStatus(root);
      assert.equal(status.recordedRelease, adjacentSourceRelease);
      assert.equal(status.nextHop, adjacentTargetRelease);
      assert.ok(status.managedFiles.some(file => file.state === "update"));
      assert.match(formatVireoStatusText(status).join("\n"), /next hop: 0\.7\.0/u);
      const preview = await upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease });
      assert.equal(preview.dryRun, true);
      assert.ok(preview.files.some(file => file.status === "update"));
      assert.match(
        preview.checks.find(check => check.id === "lockfile").detail,
        profile === "frontend"
          ? /corepack npm install --package-lock-only before verification/u
          : /corepack npm install --package-lock-only --prefix frontend before verification/u,
      );
      assertSameSnapshot(before, await treeBytes(root));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.6.0 to 0.7.0 applies managed transforms once and preserves application-owned bytes", async () => {
  for (const profile of ["full-stack", "frontend"]) {
    const root = await adjacentFixture(profile);
    try {
      const applied = await upgradeVireoProject({
        projectDirectory: root,
        targetRelease: adjacentTargetRelease,
        dryRun: false,
        acceptApplicationOwned: true,
      });
      assert.ok(applied.files.some(file => file.status === "update"));
      assert.equal(
        await readFile(join(root, "application-owned.txt"), "utf8"),
        "keep this application customization\n",
      );
      const baseline = adjacentPolicy.releaseGraph.baselines["0.6.0->0.7.0"][profile][0];
      assert.equal(await readFile(join(root, baseline.path), "utf8"), baseline.targetContent);
      const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
      assert.equal(metadata.lastUpgradedBy, "create-vireo@0.7.0");
      assert.equal(metadata.templateCommit, adjacentTarget.templateCommit);
      const repeated = await upgradeVireoProject({ projectDirectory: root, targetRelease: adjacentTargetRelease });
      assert.ok(repeated.files.every(file => file.status === "unchanged"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("0.6.0 adjacent upgrades reject unknown commits, managed drift, unsafe paths, symlinks, and dry journal recovery", async () => {
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
    await writeFile(join(root, "scripts/vireo-frontend-doctor.mjs"), "customized\n");
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
    await rm(join(linked, "scripts"), { recursive: true, force: true });
    await symlink(resolve(linked, ".."), join(linked, "scripts"));
    await assert.rejects(
      upgradeVireoProject({ projectDirectory: linked, targetRelease: adjacentTargetRelease }),
      error => error.code === "VIR-UPG-003",
    );
  } finally {
    await rm(linked, { recursive: true, force: true });
  }
});

test("interrupted 0.6.0 upgrade journals are non-writing in preview and recover before apply", async () => {
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

test("synthetic adjacent add/delete transforms are visible, atomic, idempotent, and journal-recoverable", async () => {
  const root = await adjacentFixture("frontend");
  const policy = structuredClone(adjacentPolicy);
  const addContent = "new managed baseline\n";
  const emptyContent = "";
  const deleteContent = "obsolete managed baseline\n";
  policy.releaseGraph.baselines["0.6.0->0.7.0"].frontend.push(
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
