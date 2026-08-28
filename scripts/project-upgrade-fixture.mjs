import { execFileSync } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createVireo, generateEntity, upgradeVireoProject } from "../packages/create-vireo/dist/index.js";

const sourceRelease = "0.2.0";
const targetRelease = "0.3.0";
const sourceTemplateCommit = "2520c99b1550246c3b0c5299b3cc6055dd10ead7";
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-upgrade-fixture-"));
const sourceTemplate = join(temporaryRoot, "source-template");
const projectRoot = join(temporaryRoot, "upgrade-app");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
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

  const entityFixture = join(repositoryRoot, "packages/create-vireo/fixtures/purchase-order.entity.json");
  const entitySchema = join(projectRoot, ".vireo/purchase-order.entity.json");
  await cp(entityFixture, entitySchema);
  await generateEntity({ projectDirectory: projectRoot, schemaPath: entitySchema });

  const dryRun = await upgradeVireoProject({ projectDirectory: projectRoot, targetRelease });
  if (!dryRun.dryRun || !dryRun.files.some(file => file.status !== "unchanged"))
    throw new Error("Release-pair dry run did not produce a non-writing migration plan.");
  await upgradeVireoProject({
    projectDirectory: projectRoot,
    targetRelease,
    dryRun: false,
    acceptApplicationOwned: true,
  });
  const repeated = await upgradeVireoProject({ projectDirectory: projectRoot, targetRelease });
  if (!repeated.files.every(file => file.status === "unchanged"))
    throw new Error("Applied project upgrade is not idempotent.");

  run("corepack", ["npm", "ci"], join(projectRoot, "frontend"));
  run("corepack", ["npm", "run", "typecheck"], join(projectRoot, "frontend"));
  run(
    "corepack",
    ["npm", "run", "test", "--", "tests/contract/generated/purchaseOrder.wire-contract.test.ts"],
    join(projectRoot, "frontend"),
  );
  run("./gradlew", ["test", "--tests", "*PurchaseOrderApiIntegrationTest", "--console=plain"], projectRoot);
  console.log(
    `Project upgrade fixture passed: create-vireo ${sourceRelease} -> ${targetRelease}, generated wire contract, frontend, Flyway, and backend.`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
