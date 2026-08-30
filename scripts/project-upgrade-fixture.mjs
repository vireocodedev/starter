import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkGeneratedEntities,
  createVireo,
  TEMPLATE_COMMIT,
  upgradeVireoProject,
} from "../packages/create-vireo/dist/index.js";
import { withLocalVireoCandidates } from "./lib/local-vireo-candidate-fixture.mjs";
import { assertGeneratedFixtureTemplatePinFromRepository } from "./lib/generated-fixture-template-pin.mjs";
import {
  mavenCandidateConsumerCommand,
  withLocalVireoMavenCandidates,
} from "./lib/local-vireo-maven-candidate-fixture.mjs";

const sourceRelease = "0.2.0";
const targetRelease = "0.3.0";
const pendingActionIds = [
  "navigation-landmark-and-links",
  "responsive-table-live-announcements",
  "accessible-name-contracts",
  "surface-palette-ownership",
  "full-frontend-verification",
];
const sourceTemplateCommit = "2520c99b1550246c3b0c5299b3cc6055dd10ead7";
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
await assertGeneratedFixtureTemplatePinFromRepository({ repositoryRoot, templateCommit: TEMPLATE_COMMIT });
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-upgrade-fixture-"));
const sourceTemplate = join(temporaryRoot, "source-template");
const projectRoot = join(temporaryRoot, "upgrade-app");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

async function generatedBytes(root, manifest) {
  const paths = new Set([
    `.vireo/generated/${manifest.plural}.json`,
    manifest.schemaPath,
    `.vireo/contracts/${manifest.plural}.contract.json`,
    ...manifest.files.map(file => file.path),
  ]);
  return new Map(await Promise.all([...paths].sort().map(async path => [path, await readFile(join(root, path))])));
}

function assertSameGeneratedBytes(before, after) {
  assert.equal(before.size, after.size, "Generated artifact set changed during project upgrade.");
  for (const [path, contents] of before)
    assert.deepEqual(after.get(path), contents, `Generated artifact changed during project upgrade: ${path}`);
}

function assertPendingActions(result) {
  assert.deepEqual(
    result.manualActions.map(action => action.id),
    pendingActionIds,
  );
  assert.ok(result.manualActions.every(action => action.status === "pending"));
  assert.deepEqual(
    result.manualActions.find(action => action.id === "full-frontend-verification").verificationCommands,
    [
      "corepack npm install --package-lock-only --prefix frontend",
      "corepack npm run setup",
      "cd frontend && corepack npm run typecheck",
      "./scripts/verify.sh",
    ],
  );
}

try {
  await mkdir(sourceTemplate);
  const archivePath = join(temporaryRoot, "source-template.tar.gz");
  const response = await fetch(
    `https://codeload.github.com/vireocodedev/starter-template/tar.gz/${sourceTemplateCommit}`,
    { headers: { "user-agent": "vireo-project-upgrade-fixture" } },
  );
  if (!response.ok) throw new Error(`Could not download source Template: HTTP ${response.status}`);
  await writeFile(archivePath, new Uint8Array(await response.arrayBuffer()));
  run(
    "tar",
    ["--extract", "--gzip", "--file", archivePath, "--directory", sourceTemplate, "--strip-components=1"],
    repositoryRoot,
  );

  await createVireo({
    directory: projectRoot,
    projectName: "upgrade-app",
    javaPackage: "dev.vireo.upgradeapp",
    database: "h2",
    git: false,
    templateDirectory: sourceTemplate,
  });
  const metadataPath = join(projectRoot, ".vireo/project.json");
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  metadata.templateCommit = sourceTemplateCommit;
  metadata.createdBy = `create-vireo@${sourceRelease}`;
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  const packagePath = join(projectRoot, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  packageJson.scripts.vireo = `npx --yes --package=create-vireo@${sourceRelease} vireo`;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const entityFixture = join(repositoryRoot, "packages/create-vireo/fixtures/purchase-order.0.2.0.entity.json");
  const entitySchema = join(projectRoot, ".vireo/purchase-order.entity.json");
  await cp(entityFixture, entitySchema);
  run(
    "corepack",
    [
      "npm",
      "exec",
      "--yes",
      `--package=create-vireo@${sourceRelease}`,
      "--",
      "vireo",
      "generate",
      "entity",
      entitySchema,
      "--project",
      projectRoot,
    ],
    repositoryRoot,
  );
  const generatedManifestPath = join(projectRoot, ".vireo/generated/purchase-orders.json");
  const generatedManifest = JSON.parse(await readFile(generatedManifestPath, "utf8"));
  if (generatedManifest.generatorVersion !== sourceRelease)
    throw new Error(`Published create-vireo ${sourceRelease} emitted ${generatedManifest.generatorVersion}.`);
  const beforeUpgradeChecks = await checkGeneratedEntities(projectRoot);
  if (beforeUpgradeChecks.length !== 1 || !beforeUpgradeChecks[0].ok)
    throw new Error(`Historical generated capability check failed: ${JSON.stringify(beforeUpgradeChecks)}`);
  const beforeUpgradeGeneratedBytes = await generatedBytes(projectRoot, generatedManifest);

  const dryRun = await upgradeVireoProject({ projectDirectory: projectRoot, targetRelease });
  if (!dryRun.dryRun || !dryRun.files.some(file => file.status !== "unchanged"))
    throw new Error("Release-pair dry run did not produce a non-writing migration plan.");
  assertPendingActions(dryRun);
  const applied = await upgradeVireoProject({
    projectDirectory: projectRoot,
    targetRelease,
    dryRun: false,
    acceptApplicationOwned: true,
  });
  assertPendingActions(applied);
  assertSameGeneratedBytes(beforeUpgradeGeneratedBytes, await generatedBytes(projectRoot, generatedManifest));
  const afterUpgradeChecks = await checkGeneratedEntities(projectRoot);
  if (afterUpgradeChecks.length !== 1 || !afterUpgradeChecks[0].ok)
    throw new Error(`Upgraded historical generated capability check failed: ${JSON.stringify(afterUpgradeChecks)}`);
  const repeated = await upgradeVireoProject({ projectDirectory: projectRoot, targetRelease });
  if (!repeated.files.every(file => file.status === "unchanged"))
    throw new Error("Applied project upgrade is not idempotent.");
  assertPendingActions(repeated);
  assertSameGeneratedBytes(beforeUpgradeGeneratedBytes, await generatedBytes(projectRoot, generatedManifest));
  const repeatedChecks = await checkGeneratedEntities(projectRoot);
  if (repeatedChecks.length !== 1 || !repeatedChecks[0].ok)
    throw new Error(
      `Repeated upgrade changed historical generated capability checks: ${JSON.stringify(repeatedChecks)}`,
    );

  await withLocalVireoCandidates(join(projectRoot, "frontend"), () => {
    run(
      "corepack",
      ["npm", "run", "test", "--", "tests/contract/generated/purchaseOrder.wire-contract.test.ts"],
      join(projectRoot, "frontend"),
    );
  });
  await withLocalVireoMavenCandidates(
    projectRoot,
    ({ initScript }) => {
      const consumer = mavenCandidateConsumerCommand({ initScript });
      run(consumer.command, consumer.args, projectRoot);
    },
    { expectedVersion: targetRelease },
  );
  console.log(
    `Project upgrade fixture passed: create-vireo ${sourceRelease} -> ${targetRelease}, generated wire contract, frontend, Flyway, and backend.`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
