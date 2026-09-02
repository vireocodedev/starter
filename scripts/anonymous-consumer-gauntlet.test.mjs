import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publicReleaseIdentity, readJson } from "./lib/anonymous-consumer-environment.mjs";
import { buildExecutionPlan, executePlanForTest, installedVireoPackageNames, validateManagedProvenance, validatePolicy } from "./anonymous-consumer-gauntlet.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const policy = readJson(join(root, "contracts", "anonymous-consumer-gauntlet-policy.json"));
const release = publicReleaseIdentity(readJson(join(root, "contracts", "ecosystem-release-contract.json")));

test("gauntlet policy covers every required scenario with exact public identity", () => {
  assert.deepEqual(validatePolicy(policy, release), []);
  assert.equal(policy.scenarios.length, policy.requiredScenarios.length);
  assert.ok(policy.scenarios.every(scenario => Array.isArray(scenario.recipe) && scenario.recipe.length > 0));
  assert.equal(new Set(policy.scenarios.map(scenario => JSON.stringify(scenario.recipe))).size, policy.scenarios.length);
});

test("deterministic plan gives a fake executor every required recipe and refusal", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  assert.deepEqual(plan.map(scenario => scenario.id), policy.requiredScenarios);
  assert.ok(plan.every(scenario => scenario.operations.length > 0));
  assert.ok(plan.flatMap(scenario => scenario.operations).some(operation => operation.expectedExit === 1));
  assert.ok(plan.find(scenario => scenario.id === "cli-adversity").operations.some(operation => operation.id === "template-download-retry"));
  const operations = plan.flatMap(scenario => scenario.operations);
  assert.equal(operations.filter(operation => operation.id === "postgresql-production-compose").length, 1);
  assert.equal(operations.filter(operation => operation.arguments.some(argument => String(argument).endsWith("collect-public-release-evidence.mjs"))).length, 1);
  assert.equal(plan.find(scenario => scenario.id === "adjacent-public-upgrades").operations.filter(operation => operation.id.includes("managed-refusal-mutation")).length, 2);
  assert.equal(plan.find(scenario => scenario.id === "adjacent-public-upgrades").operations.filter(operation => operation.arguments.includes("generate") && operation.arguments.includes("entity")).length, 2);
});

test("fake executor preserves planned, expected-refusal, timeout, and failure evidence", async () => {
  const plan = [{ id: "fixture", recipe: ["fixture"], operations: [{ id: "pass", expectedExit: 0 }, { id: "refusal", expectedExit: 1 }] }];
  const passed = await executePlanForTest(plan, async operation => ({ exitCode: operation.expectedExit, timedOut: false, signal: null }));
  assert.equal(passed.status, "passed");
  const planned = await executePlanForTest(plan, async () => { throw new Error("dry run executed"); }, { dryRun: true });
  assert.equal(planned.status, "planned");
  const failed = await executePlanForTest(plan, async operation => operation.id === "pass" ? { exitCode: 0, timedOut: true, signal: "SIGTERM" } : { exitCode: 1 });
  assert.equal(failed.status, "failed");
  assert.equal(failed.scenarios[0].commands[0].status, "failed");
});

test("managed provenance rejects traversal and digest drift", () => {
  const directory = mkdtempSync(join(tmpdir(), "vireo-managed-"));
  writeFileSync(join(directory, "file.txt"), "actual");
  const manifest = { schemaVersion: 1, templateCommit: "a".repeat(40), files: [{ path: "../escape", sha256: "b".repeat(64) }, { path: "file.txt", sha256: "b".repeat(64) }] };
  assert.match(validateManagedProvenance({ root: directory, manifest }).join("\n"), /unsafe|drift/u);
});

test("upgraded consumers validate only their installed exact Vireo subset", () => {
  const release = { npm: [{ name: "@vireocodedev/ui", version: "1.2.3" }] };
  const lock = { packages: { "node_modules/@vireocodedev/ui": { version: "1.2.3", resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui.tgz", integrity: "sha512-x" } } };
  assert.deepEqual(installedVireoPackageNames({ lock, release }), ["@vireocodedev/ui"]);
  lock.packages["node_modules/@vireocodedev/ui"].version = "9.9.9";
  assert.throws(() => installedVireoPackageNames({ lock, release }));
});

test("gauntlet policy wiring remains public and scheduled", () => {
  const workflow = readFileSync(join(root, ".github/workflows/anonymous-consumer-gauntlet.yml"), "utf8");
  assert.match(workflow, /schedule:/u);
  assert.match(workflow, /consumer:gauntlet/u);
  assert.match(workflow, /permissions: \{\}/u);
  assert.match(workflow, /upload-artifact/u);
  assert.match(workflow, /playwright install --with-deps chromium/u);
  assert.match(workflow, /docker version/u);
  assert.match(workflow, /workflow_run\.head_sha/u);
  assert.match(workflow, /--release-id/u);
  assert.match(workflow, /--source-commit/u);
  assert.match(workflow, /git rev-parse HEAD/u);
  assert.match(workflow, /source_commit must be an exact 40-hex/u);
  assert.match(workflow, /head_repository\.full_name == github\.repository/u);
});
