import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { generateEntity, upgradeVireoProject, VireoUpgradeError } from "../dist/index.js";

const sourceCommit = "2520c99b1550246c3b0c5299b3cc6055dd10ead7";
const dependencies = {
  "@vireocodedev/history": "^0.2.1",
  "@vireocodedev/infrastructure": "^0.2.1",
  "@vireocodedev/localization": "^0.2.1",
  "@vireocodedev/query": "^0.2.1",
  "@vireocodedev/shell": "^0.2.1",
  "@vireocodedev/ui": "^0.2.1",
};

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
    `${JSON.stringify({ scripts: { vireo: "npx --yes --package=create-vireo@0.2.0 vireo" } }, null, 2)}\n`,
  );
  await writeFile(join(root, "frontend/package.json"), `${JSON.stringify({ dependencies }, null, 2)}\n`);
  await writeFile(
    join(root, "frontend/package-lock.json"),
    `${JSON.stringify({ lockfileVersion: 3, packages: { "": { dependencies } } }, null, 2)}\n`,
  );
  await writeFile(join(root, "gradle.properties"), "starterVersion=0.2.0\n");
  await writeFile(join(root, "src/main/resources/db/migration/V1__baseline.sql"), "SELECT 1;\n");
  return root;
}

test("0.2.0 to 0.3.0 is dry-run-first, explicit, and idempotent", async () => {
  const root = await fixture();
  try {
    const before = await readFile(join(root, "package.json"), "utf8");
    const dryRun = await upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" });
    assert.equal(dryRun.dryRun, true);
    assert.equal(dryRun.checks.find(check => check.id === "application-owned").status, "manual");
    assert.equal(await readFile(join(root, "package.json"), "utf8"), before);

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
    assert.match(await readFile(join(root, "package.json"), "utf8"), /create-vireo@0\.3\.0/u);
    const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.createdBy, "create-vireo@0.2.0");
    assert.equal(metadata.lastUpgradedBy, "create-vireo@0.3.0");
    const repeated = await upgradeVireoProject({ projectDirectory: root, targetRelease: "0.3.0" });
    assert.ok(repeated.files.every(file => file.status === "unchanged"));
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
