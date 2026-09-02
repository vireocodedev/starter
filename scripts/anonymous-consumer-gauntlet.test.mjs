import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publicReleaseIdentity, readJson } from "./lib/anonymous-consumer-environment.mjs";
import {
  buildExecutionPlan,
  executePlanForTest,
  installedVireoPackageNames,
  parseBoundedJsonOutput,
  preflightFailureFinding,
  validateCreateDryRunJson,
  validateDoctorJson,
  validateManagedProvenance,
  validatePolicy,
  validateReleaseIdentityJson,
  validateRegistryMetadataJson,
} from "./anonymous-consumer-gauntlet.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const policy = readJson(join(root, "contracts", "anonymous-consumer-gauntlet-policy.json"));
const release = publicReleaseIdentity(readJson(join(root, "contracts", "ecosystem-release-contract.json")));

test("gauntlet policy covers every required scenario with exact public identity", () => {
  assert.deepEqual(validatePolicy(policy, release), []);
  assert.equal(policy.scenarios.length, policy.requiredScenarios.length);
  assert.ok(policy.scenarios.every(scenario => Array.isArray(scenario.recipe) && scenario.recipe.length > 0));
  assert.equal(
    new Set(policy.scenarios.map(scenario => JSON.stringify(scenario.recipe))).size,
    policy.scenarios.length,
  );
});

test("public gauntlets derive the unique adjacent edge ending at the exact published release", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const matching = upgradePolicy.requiredEdges.filter(edge => edge.to === release.createVireoVersion);
  assert.equal(matching.length, 1);
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  const upgrades = plan
    .find(scenario => scenario.id === "adjacent-public-upgrades")
    .operations.filter(operation => operation.kind === "assert-upgraded-consumer");
  assert.ok(upgrades.every(operation => operation.source.createVireoVersion === matching[0].from));
  assert.ok(upgrades.every(operation => operation.target.createVireoVersion === release.createVireoVersion));
  const candidatePolicy = structuredClone(upgradePolicy);
  candidatePolicy.candidateRelease = "unpublished-candidate";
  const candidatePlan = buildExecutionPlan({
    policy,
    release,
    upgradePolicy: candidatePolicy,
    consumerRoot: "/tmp/vireo-anonymous-plan",
  });
  assert.deepEqual(
    candidatePlan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.kind === "assert-upgraded-consumer")
      .map(operation => [operation.source.createVireoVersion, operation.target.createVireoVersion]),
    upgrades.map(operation => [operation.source.createVireoVersion, operation.target.createVireoVersion]),
  );
});

test("deterministic plan gives a fake executor every required recipe and refusal", () => {
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const plan = buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot: "/tmp/vireo-anonymous-plan" });
  assert.deepEqual(
    plan.map(scenario => scenario.id),
    policy.requiredScenarios,
  );
  assert.ok(plan.every(scenario => scenario.operations.length > 0));
  assert.ok(plan.flatMap(scenario => scenario.operations).some(operation => operation.expectedExit === 1));
  assert.ok(
    plan
      .find(scenario => scenario.id === "cli-adversity")
      .operations.some(operation => operation.id === "template-download-retry"),
  );
  const operations = plan.flatMap(scenario => scenario.operations);
  const registryOperations = plan
    .find(scenario => scenario.id === "public-artifacts")
    .operations.filter(operation => operation.id.startsWith("registry-"));
  assert.equal(registryOperations.length, release.npm.length);
  assert.deepEqual(
    registryOperations.map(operation => operation.arguments),
    release.npm.map(({ name, version }) => ["npm", "view", `${name}@${version}`, "name", "version", "--json"]),
  );
  assert.equal(operations.filter(operation => operation.id === "postgresql-production-compose").length, 1);
  assert.equal(
    operations.filter(operation =>
      operation.arguments.some(argument => String(argument).endsWith("collect-public-release-evidence.mjs")),
    ).length,
    1,
  );
  assert.ok(
    operations
      .find(operation =>
        operation.arguments.some(argument => String(argument).endsWith("collect-public-release-evidence.mjs")),
      )
      .arguments.includes("--output-relative-paths"),
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.id.includes("managed-refusal-mutation")).length,
    2,
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(
        operation => operation.arguments.includes("generate") && operation.arguments.includes("entity"),
      ).length,
    2,
  );
  const upgrades = plan
    .find(scenario => scenario.id === "adjacent-public-upgrades")
    .operations.filter(operation => operation.kind === "assert-upgraded-consumer");
  assert.equal(upgrades.length, 2);
  const upgradeEdge = readJson(join(root, "contracts", "project-upgrade-policy.json")).requiredEdges.find(
    edge => edge.to === release.createVireoVersion,
  );
  assert.ok(upgrades.every(operation => operation.source.createVireoVersion === upgradeEdge.from));
  assert.ok(upgrades.every(operation => operation.target.createVireoVersion === release.createVireoVersion));
  assert.equal(
    upgrades.filter(operation => operation.target.createVireoVersion === release.createVireoVersion).length,
    upgrades.length,
  );
  assert.equal(
    plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.filter(operation => operation.id.endsWith("-doctor-json")).length,
    2,
  );
  assert.ok(
    !plan
      .find(scenario => scenario.id === "adjacent-public-upgrades")
      .operations.some(operation => operation.kind === "assert-project-identity"),
  );
  const adversity = plan.find(scenario => scenario.id === "cli-adversity").operations.map(operation => operation.id);
  assert.ok(adversity.includes("retry-project-setup"));
  assert.ok(adversity.includes("retry-project-verify"));
  const lifecycle = plan
    .find(scenario => scenario.id === "capability-lifecycle")
    .operations.map(operation => operation.id);
  assert.ok(lifecycle.includes("capability-customized-snapshot"));
  assert.ok(lifecycle.includes("capability-refusal-preserves-customization"));
  const removal = plan
    .find(scenario => scenario.id === "sample-removal-and-ejection")
    .operations.map(operation => operation.id);
  assert.ok(removal.includes("sample-removal-first-apply-snapshot"));
  assert.ok(removal.includes("sample-removal-repeat-preserves-tree"));
});

test("JSON command assertions accept only bounded exact ready reports", () => {
  const dryRunDirectory = "/tmp/anonymous/dry-run";
  const dryRun = {
    directory: dryRunDirectory,
    projectName: "dry-run",
    profile: "frontend",
    packageManager: "npm",
    templateCommit: release.template.commit,
    dryRun: true,
  };
  assert.equal(
    validateCreateDryRunJson(parseBoundedJsonOutput(JSON.stringify(dryRun)), {
      directory: dryRunDirectory,
      profile: "frontend",
      release,
    }).type,
    "create-vireo-dry-run",
  );
  assert.throws(() => parseBoundedJsonOutput("notice\n{}"), /complete JSON/u);
  assert.throws(() => parseBoundedJsonOutput("{"), /complete JSON/u);
  assert.throws(() => parseBoundedJsonOutput("x".repeat(9), { maximumBytes: 8 }), /exceeds/u);
  assert.throws(
    () =>
      validateCreateDryRunJson(
        { ...dryRun, database: "h2" },
        { directory: dryRunDirectory, profile: "frontend", release },
      ),
    /full-stack-only/u,
  );
  const doctor = {
    schemaVersion: 1,
    ok: true,
    project: "frontend",
    profile: "frontend",
    database: undefined,
    databaseMode: "frontend",
    results: [{ code: "VIR-ENV-001", status: "pass", summary: "Node 24" }],
  };
  assert.equal(
    validateDoctorJson(doctor, {
      project: "frontend",
      profile: "frontend",
      database: undefined,
      databaseMode: "frontend",
    }).type,
    "doctor",
  );
  assert.throws(
    () =>
      validateDoctorJson(
        { ...doctor, ok: false },
        { project: "frontend", profile: "frontend", database: undefined, databaseMode: "frontend" },
      ),
    /expected ready/u,
  );
  assert.equal(validateReleaseIdentityJson({ phase: "release", ok: true, problems: [] }).type, "release-identity");
  assert.throws(() => validateReleaseIdentityJson({ phase: "creation", ok: true, problems: [] }), /exact ready/u);
});

test("npm registry metadata accepts only an exact direct object or singleton result", () => {
  const expected = { name: "@vireocodedev/ui", version: "0.3.1" };
  assert.deepEqual(validateRegistryMetadataJson(expected, expected), {
    type: "registry-metadata",
    coordinate: "@vireocodedev/ui@0.3.1",
  });
  assert.deepEqual(validateRegistryMetadataJson([expected], expected), {
    type: "registry-metadata",
    coordinate: "@vireocodedev/ui@0.3.1",
  });
  for (const malformed of [[], [expected, expected], [[expected]], [null], null, "metadata", 0, false]) {
    assert.throws(() => validateRegistryMetadataJson(malformed, expected));
  }
  assert.throws(() => validateRegistryMetadataJson({ name: expected.name }, expected), /exact public/u);
  assert.throws(() => validateRegistryMetadataJson({ version: expected.version }, expected), /exact public/u);
  assert.throws(() => validateRegistryMetadataJson({ ...expected, version: "0.3.2" }, expected), /exact public/u);
  assert.throws(
    () => validateRegistryMetadataJson([{ ...expected, name: "@vireocodedev/query" }], expected),
    /exact public/u,
  );
});

test("preflight failures have a stable machine-actionable finding", () => {
  assert.deepEqual(preflightFailureFinding(), {
    id: "VIR-GAUNTLET-PREFLIGHT",
    owner: "framework",
    severity: "error",
    remediation: "Repair the exact public release identity or its provider-backed publication evidence.",
    evidenceReferences: ["preflight"],
  });
});

test("malformed release input writes preflight evidence before any scenario can run", t => {
  const evidenceDirectory = mkdtempSync(join(tmpdir(), "vireo-malformed-release-preflight-"));
  t.after(() => rmSync(evidenceDirectory, { recursive: true, force: true }));
  const result = spawnSync(
    process.execPath,
    ["scripts/anonymous-consumer-gauntlet.mjs", "--evidence-dir", evidenceDirectory],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        VIREO_GAUNTLET_RELEASE_ID: "npm-0.8.2_jvm-0.3.1-extra",
        VIREO_GAUNTLET_SOURCE_COMMIT: "a".repeat(40),
      },
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requested release id is not an exact npm-x\.y\.z_jvm-x\.y\.z release id/u);
  const evidence = JSON.parse(readFileSync(join(evidenceDirectory, "evidence.json"), "utf8"));
  assert.equal(evidence.status, "failed");
  assert.deepEqual(evidence.findings, [preflightFailureFinding()]);
  assert.deepEqual(evidence.scenarios, []);
  assert.equal(evidence.releaseTagCommit, undefined);
});

test("fake executor preserves planned, expected-refusal, timeout, and failure evidence", async () => {
  const plan = [
    {
      id: "fixture",
      recipe: ["fixture"],
      operations: [
        { id: "pass", expectedExit: 0 },
        { id: "refusal", expectedExit: 1 },
      ],
    },
  ];
  const passed = await executePlanForTest(plan, async operation => ({
    exitCode: operation.expectedExit,
    timedOut: false,
    signal: null,
  }));
  assert.equal(passed.status, "passed");
  const planned = await executePlanForTest(
    plan,
    async () => {
      throw new Error("dry run executed");
    },
    { dryRun: true },
  );
  assert.equal(planned.status, "planned");
  const failed = await executePlanForTest(plan, async operation =>
    operation.id === "pass" ? { exitCode: 0, timedOut: true, signal: "SIGTERM" } : { exitCode: 1 },
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.scenarios[0].commands[0].status, "failed");
});

test("managed provenance rejects traversal and digest drift", () => {
  const directory = mkdtempSync(join(tmpdir(), "vireo-managed-"));
  writeFileSync(join(directory, "file.txt"), "actual");
  const manifest = {
    schemaVersion: 1,
    templateCommit: "a".repeat(40),
    files: [
      { path: "../escape", sha256: "b".repeat(64) },
      { path: "file.txt", sha256: "b".repeat(64) },
    ],
  };
  assert.match(validateManagedProvenance({ root: directory, manifest }).join("\n"), /unsafe|drift/u);
  assert.match(
    validateManagedProvenance({
      root: directory,
      manifest: { ...manifest, templateCommit: "a".repeat(40), files: [] },
      templateCommit: "b".repeat(40),
    }).join("\n"),
    /does not match/u,
  );
});

test("upgraded consumers validate only their installed exact Vireo subset", () => {
  const release = { npm: [{ name: "@vireocodedev/ui", version: "1.2.3" }] };
  const lock = {
    packages: {
      "node_modules/@vireocodedev/ui": {
        version: "1.2.3",
        resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui.tgz",
        integrity: "sha512-x",
      },
      "node_modules/example/node_modules/@vireocodedev/ui": {
        version: "1.2.3",
        resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui.tgz",
        integrity: "sha512-nested",
      },
    },
  };
  assert.deepEqual(installedVireoPackageNames({ lock, release }), ["@vireocodedev/ui"]);
  lock.packages["node_modules/@vireocodedev/ui"].version = "9.9.9";
  assert.throws(() => installedVireoPackageNames({ lock, release }));
  lock.packages["node_modules/@vireocodedev/ui"].version = "1.2.3";
  lock.packages["node_modules/example/node_modules/@vireocodedev/ui"].link = true;
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
  assert.match(workflow, /VIREO_GAUNTLET_RELEASE_ID: \$\{\{ inputs\.release_id \}\}/u);
  assert.match(workflow, /VIREO_GAUNTLET_SOURCE_COMMIT: \$\{\{ needs\.trusted-source\.outputs\.source_commit \}\}/u);
  assert.match(workflow, /git rev-parse HEAD/u);
  assert.match(workflow, /source_commit must be an exact 40-hex/u);
  assert.match(workflow, /workflow_dispatch is restricted to refs\/heads\/main/u);
  assert.match(workflow, /merge-base --is-ancestor "\$candidate" origin\/main/u);
  assert.match(workflow, /Revalidate trusted main ancestry before verifier execution/u);
  assert.match(workflow, /--evidence-dir "\$RUNNER_TEMP\/anonymous-consumer-evidence"/u);
  assert.doesNotMatch(workflow, /REQUESTED_RELEASE_ID|release_id=|--release-id|--source-commit/u);
  assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/anonymous-consumer-evidence/u);
  assert.doesNotMatch(workflow.match(/^\s*run:[\s\S]*?(?=^\s*-\s|^\s*\w)/gmu)?.join("\n") ?? "", /inputs\./u);
  assert.match(workflow, /head_repository\.full_name == github\.repository/u);
});
