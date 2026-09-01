import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkGeneratedEntities,
  createVireo,
  TEMPLATE_COMMIT,
  upgradeVireoProject,
  vireoProjectStatus,
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
const publicFrontendDoctorFixture = await readFile(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/vireo-frontend-doctor.0.6.0.mjs"),
  "utf8",
);
const publicGithubActionsPolicyFixture = await readFile(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/github-actions-policy.0.6.0.json"),
  "utf8",
);
await assertGeneratedFixtureTemplatePinFromRepository({ repositoryRoot, templateCommit: TEMPLATE_COMMIT });
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-upgrade-fixture-"));
const sourceTemplate = join(temporaryRoot, "source-template");
const projectRoot = join(temporaryRoot, "upgrade-app");

function run(command, args, cwd, { env = process.env } = {}) {
  execFileSync(command, args, { cwd, env, stdio: "inherit" });
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

function packedVireo(args, cwd) {
  run("node", [join(repositoryRoot, "packages/create-vireo/dist/vireo-cli.js"), ...args], cwd);
}

async function ejectedBytes(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const retained = new Map();
  for (const entry of entries) {
    if (["node_modules", ".git"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const [name, bytes] of await ejectedBytes(root, path)) retained.set(name, bytes);
    } else if (entry.isFile()) {
      const bytes = await readFile(path);
      if (bytes.toString("utf8").includes("@vireo-ejected")) retained.set(path.slice(root.length + 1), bytes);
    }
  }
  return retained;
}

async function adjacentUpgradeFixture(profile) {
  const root = join(temporaryRoot, `public-0-6-${profile}`);
  let verificationCommit;
  const createArguments = [
    "npm",
    "exec",
    "--yes",
    "--package=create-vireo@0.6.0",
    "--",
    "create-vireo",
    root,
    "--profile",
    profile,
    "--no-git",
    "--yes",
  ];
  if (profile === "full-stack") createArguments.push("--java-package", "dev.vireo.upgradefixture", "--database", "h2");
  run("corepack", createArguments, repositoryRoot);
  if (profile === "frontend") {
    assert.equal(
      await readFile(join(root, "scripts/vireo-frontend-doctor.mjs"), "utf8"),
      publicFrontendDoctorFixture,
      "The public create-vireo@0.6.0 frontend projection no longer matches its frozen Doctor render.",
    );
  } else {
    assert.equal(
      await readFile(join(root, "contracts/github-actions-policy.json"), "utf8"),
      publicGithubActionsPolicyFixture,
      "The public create-vireo@0.6.0 full-stack projection no longer matches its frozen Actions policy.",
    );
  }

  const appOwnedPath = join(root, "README.md");
  const appOwnedBefore = `${await readFile(appOwnedPath, "utf8")}\nApplication-owned upgrade fixture note.\n`;
  await writeFile(appOwnedPath, appOwnedBefore);
  let retainedEjectedBytes;
  let openApiCompatibilityBefore;
  if (profile === "full-stack") {
    const entitySchema = join(root, ".vireo", "purchase-order.entity.json");
    await cp(join(repositoryRoot, "packages/create-vireo/fixtures/purchase-order.entity.json"), entitySchema);
    run(
      "corepack",
      [
        "npm",
        "exec",
        "--yes",
        "--package=create-vireo@0.6.0",
        "--",
        "vireo",
        "generate",
        "entity",
        entitySchema,
        "--project",
        root,
      ],
      repositoryRoot,
    );
    run(
      "corepack",
      [
        "npm",
        "exec",
        "--yes",
        "--package=create-vireo@0.6.0",
        "--",
        "vireo",
        "eject",
        "purchase-orders",
        "--project",
        root,
      ],
      repositoryRoot,
    );
    const storyPath = join(root, "frontend/src/generated/purchase-orders/storybook/AppPagePurchaseOrders.stories.tsx");
    const publicStory = await readFile(storyPath, "utf8");
    const customizedStory = publicStory
      .replace(
        'import { AppPagePurchaseOrders } from "../pages/AppPagePurchaseOrders";',
        'import { configurePurchaseOrderApi } from "../api/purchaseOrder.api";\nimport { AppPagePurchaseOrders } from "../pages/AppPagePurchaseOrders";',
      )
      .replace(
        "export const Default: Story = {};",
        `export const Default: Story = {
  beforeEach: () => {
    configurePurchaseOrderApi({
      search: async () => ({ content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 }),
      create: async value => value,
      update: async (_id, value) => value,
      delete: async () => undefined,
    });
  },
};`,
      );
    assert.notEqual(customizedStory, publicStory, "Public 0.6 generated story shape changed unexpectedly.");
    await writeFile(storyPath, customizedStory);
    const openApiCompatibilityPath = join(
      root,
      "src/test/java/dev/vireo/upgradefixture/OpenApiCompatibilityIntegrationTest.java",
    );
    const publicOpenApiCompatibility = await readFile(openApiCompatibilityPath, "utf8");
    openApiCompatibilityBefore = publicOpenApiCompatibility
      .replace(
        'assertThat(normalizeOperations(actual)).isEqualTo(readStringMap(expected.path("operations")));',
        'assertThat(normalizeOperations(actual)).containsAllEntriesOf(readStringMap(expected.path("operations")));',
      )
      .replace(
        '.isEqualTo(readStrings(expected.path("schemaNames")));',
        '.containsAll(readStrings(expected.path("schemaNames")));',
      );
    assert.notEqual(
      openApiCompatibilityBefore,
      publicOpenApiCompatibility,
      "Public 0.6 OpenAPI compatibility test shape changed unexpectedly.",
    );
    await writeFile(openApiCompatibilityPath, openApiCompatibilityBefore);
    run(
      "corepack",
      [
        "npm",
        "exec",
        "--",
        "prettier",
        "--write",
        join(root, "frontend/src/generated/vireo.capabilities.ts"),
        storyPath,
      ],
      repositoryRoot,
    );
    retainedEjectedBytes = await ejectedBytes(root);
    await assert.rejects(
      readFile(join(root, ".vireo/ejected-capabilities.json")),
      error => error.code === "ENOENT",
      "Public 0.6 unexpectedly wrote the 0.7 ejection ledger.",
    );
    assert.ok(retainedEjectedBytes.size > 0, "Public 0.6 ejection retained no marked application-owned files.");
  }
  const dryRunPaths =
    profile === "frontend"
      ? ["package.json", "package-lock.json", ".vireo/project.json", "scripts/vireo-frontend-doctor.mjs"]
      : [
          "package.json",
          "frontend/package.json",
          "frontend/package-lock.json",
          "gradle.properties",
          ".vireo/project.json",
          "contracts/github-actions-policy.json",
          "scripts/vireo-doctor.mjs",
        ];
  const beforeDryRun = new Map(
    await Promise.all(dryRunPaths.map(async path => [path, await readFile(join(root, path))])),
  );
  packedVireo(["status", "--project", root, "--json"], repositoryRoot);
  packedVireo(["upgrade", "--to", "0.7.0", "--dry-run", "--project", root, "--json"], repositoryRoot);
  for (const [path, bytes] of beforeDryRun)
    assert.deepEqual(await readFile(join(root, path)), bytes, `${profile} dry run wrote ${path}`);
  packedVireo(["upgrade", "--to", "0.7.0", "--apply", "--accept-application-owned", "--project", root], repositoryRoot);
  if (profile === "frontend") run("corepack", ["npm", "install", "--package-lock-only"], root);
  else run("corepack", ["npm", "install", "--package-lock-only", "--prefix", "frontend"], root);
  assert.equal(await readFile(appOwnedPath, "utf8"), appOwnedBefore, `${profile} application-owned bytes changed`);
  if (profile === "full-stack") {
    assert.deepEqual(await ejectedBytes(root), retainedEjectedBytes);
    assert.equal(
      await readFile(
        join(root, "src/test/java/dev/vireo/upgradefixture/OpenApiCompatibilityIntegrationTest.java"),
        "utf8",
      ),
      openApiCompatibilityBefore,
      "The adjacent upgrade changed the application-owned OpenAPI compatibility policy.",
    );
    await assert.rejects(
      readFile(join(root, ".vireo/ejected-capabilities.json")),
      error => error.code === "ENOENT",
      "The adjacent upgrade must not fabricate a current ejection ledger for legacy evidence.",
    );
    assert.ok(
      (await vireoProjectStatus(root)).capabilities.some(capability => capability.state === "ejected"),
      "The upgraded project status did not discover preserved legacy ejection evidence.",
    );
  }
  packedVireo(["status", "--project", root, "--json"], repositoryRoot);
  packedVireo(["upgrade", "--to", "0.7.0", "--dry-run", "--project", root, "--json"], repositoryRoot);

  run("corepack", ["npm", "run", "setup"], root);
  run("corepack", ["npm", "run", "doctor"], root);
  packedVireo(["check", "--project", root], repositoryRoot);
  if (profile === "full-stack") {
    run("git", ["init", "--quiet"], root);
    run("git", ["add", "--all"], root);
    run(
      "git",
      [
        "-c",
        "user.name=Vireo Upgrade Fixture",
        "-c",
        "user.email=upgrade-fixture@vireocode.invalid",
        "commit",
        "--quiet",
        "-m",
        "fixture: record upgraded public project",
      ],
      root,
    );
    verificationCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  }
  run("corepack", ["npm", "run", "verify"], root, {
    env: verificationCommit ? { ...process.env, GITHUB_SHA: verificationCommit } : process.env,
  });
  console.log(`Public create-vireo 0.6.0 ${profile} fixture upgraded by packed 0.7 candidate.`);
}

try {
  await mkdir(sourceTemplate);
  const archivePath = join(temporaryRoot, "source-template.tar.gz");
  const response = await fetch(
    `https://codeload.github.com/vireocodedev/vireo-template/tar.gz/${sourceTemplateCommit}`,
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
  // This fixture deliberately materializes the pre-provenance 0.2 source;
  // current creation writes managed provenance for 0.6+ projects.
  await rm(join(projectRoot, ".vireo", "managed-files.json"), { force: true });

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
  // Historical 0.2 -> 0.3 evidence above remains deliberately separate from
  // the public adjacent-release acceptance below.
  await adjacentUpgradeFixture("frontend");
  await adjacentUpgradeFixture("full-stack");
  console.log(
    `Project upgrade fixture passed: create-vireo ${sourceRelease} -> ${targetRelease}, generated wire contract, frontend, Flyway, and backend.`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
