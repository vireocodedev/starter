import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  anonymousEnvironment,
  assertAnonymousInstallation,
  assertExactPublicNpmConsumer,
  assertAnonymousVireoLock,
  assertNoMavenLocal,
  publicReleaseIdentity,
  readJson,
} from "./lib/anonymous-consumer-environment.mjs";
import { writeEvidenceAtomically } from "./lib/anonymous-consumer-evidence.mjs";
import { validateAnonymousPublicEvidence } from "./lib/anonymous-public-evidence.mjs";
import { validateFinalAnonymousEvidence } from "./lib/anonymous-consumer-final-evidence.mjs";
import { validateReleasePreflightIdentity, verifyPublicReleasePreflight } from "./lib/anonymous-consumer-release-preflight.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = join(root, "contracts", "anonymous-consumer-gauntlet-policy.json");
const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const dryRun = args.has("--dry-run");
const evidenceArgument = process.argv.indexOf("--evidence-dir");
const evidenceDirectory = evidenceArgument >= 0 ? resolve(process.argv[evidenceArgument + 1]) : join(root, ".anonymous-consumer-evidence");
const releaseIdArgument = process.argv.indexOf("--release-id");
const sourceCommitArgument = process.argv.indexOf("--source-commit");
const observedDigests = new Map();
const managedOriginals = new Map();

export function validatePolicy(policy, release) {
  const problems = [];
  if (policy.schemaVersion !== 1 || policy.contractId !== "vireo-anonymous-consumer-zero-to-production") {
    problems.push("anonymous consumer gauntlet policy has an unsupported identity");
  }
  if (policy.releaseSource !== "contracts/ecosystem-release-contract.json") {
    problems.push("anonymous consumer gauntlet must derive its identity from the ecosystem contract");
  }
  const scenarioIds = policy.scenarios?.map(scenario => scenario.id) ?? [];
  if (new Set(scenarioIds).size !== scenarioIds.length) problems.push("anonymous consumer scenario ids must be unique");
  const recipes = new Set();
  for (const scenario of policy.scenarios ?? []) {
    if (!Array.isArray(scenario.recipe) || scenario.recipe.length === 0 || new Set(scenario.recipe).size !== scenario.recipe.length)
      problems.push(`${scenario.id} must declare a distinct non-empty executable recipe`);
    const signature = JSON.stringify(scenario.recipe);
    if (recipes.has(signature)) problems.push(`${scenario.id} duplicates another scenario recipe`);
    recipes.add(signature);
  }
  for (const required of policy.requiredScenarios ?? []) {
    if (!scenarioIds.includes(required)) problems.push(`missing required anonymous consumer scenario ${required}`);
  }
  if (!policy.isolation?.scrubbedEnvironment || !policy.isolation?.isolatedNpmCache || !policy.isolation?.isolatedGradleUserHome) {
    problems.push("anonymous consumer policy must require scrubbed isolated environments");
  }
  if (!policy.isolation?.forbidMavenLocal || !policy.isolation?.forbidWorkspacePackages) {
    problems.push("anonymous consumer policy must forbid Maven Local and workspace packages");
  }
  if (JSON.stringify(policy.evidence?.requiredSections) !== JSON.stringify(["findings", "externalWarnings", "remainingHumanOnly"]))
    problems.push("anonymous consumer evidence must distinguish findings, external warnings, and human-only work");
  if (!release?.createVireoVersion || !release.template.commit) problems.push("current ecosystem release is incomplete");
  return problems;
}

/** Returns plain, validated data so unit tests can execute every scenario through a fake executor. */
export function buildExecutionPlan({ policy, release, upgradePolicy, consumerRoot }) {
  const problems = validatePolicy(policy, release);
  if (problems.length > 0) throw new Error(problems.join("\n"));
  return policy.scenarios.map(scenario => ({
    id: scenario.id,
    recipe: [...scenario.recipe],
    operations: scenarioCommands({ scenario, release, consumerRoot, upgradePolicy }).map((operation, index) => ({
      id: operation.id ?? `${scenario.id}-${index + 1}`,
      expectedExit: operation.expectedExit ?? 0,
      kind: operation.kind ?? "command",
      executable: operation.executable ?? null,
    })),
  }));
}

export async function executePlanForTest(plan, executor, { dryRun = false } = {}) {
  const evidence = { status: dryRun ? "planned" : "running", scenarios: [] };
  for (const scenario of plan) {
    const record = { id: scenario.id, status: dryRun ? "planned" : "running", commands: [] };
    evidence.scenarios.push(record);
    for (const operation of scenario.operations) {
      const command = { ...operation, status: dryRun ? "planned" : "running" };
      record.commands.push(command);
      if (!dryRun) {
        const result = await executor(operation);
        if (result.timedOut || result.signal || result.exitCode !== operation.expectedExit) {
          Object.assign(command, result, { status: "failed" });
          record.status = evidence.status = "failed";
          return evidence;
        }
        Object.assign(command, result, { status: "passed" });
      }
    }
    record.status = dryRun ? "planned" : "passed";
  }
  evidence.status = dryRun ? "planned" : "passed";
  return evidence;
}

function execute(command, options) {
  return new Promise((resolvePromise, reject) => {
    const startedAt = new Date().toISOString();
    const started = performance.now();
    const stdout = createHash("sha256");
    const stderr = createHash("sha256");
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let excerpt = "";
    let finished = false;
    const child = spawn(command.executable, command.arguments, { ...options, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
    let timedOut = false;
    const stop = signal => {
      if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signal);
      else child.kill(signal);
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      stop("SIGTERM");
      setTimeout(() => stop("SIGKILL"), 5_000).unref();
    }, command.timeoutMs ?? 20 * 60_000);
    child.stdout.on("data", chunk => {
      stdout.update(chunk);
      stdoutBytes += chunk.length;
      if (excerpt.length < 4096) excerpt += chunk.toString("utf8", 0, Math.min(chunk.length, 4096 - excerpt.length));
    });
    child.stderr.on("data", chunk => {
      stderr.update(chunk);
      stderrBytes += chunk.length;
      if (excerpt.length < 4096) excerpt += chunk.toString("utf8", 0, Math.min(chunk.length, 4096 - excerpt.length));
    });
    child.on("error", () => finish(1));
    child.on("close", (code, signal) => finish(code ?? 1, signal));
    function finish(exitCode, signal) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      const result = {
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
        exitCode,
        signal: signal ?? null,
        timedOut,
        expectedExit: command.expectedExit,
        cwdClass: command.cwdClass ?? "consumer",
        argumentCategories: command.argumentCategories ?? [],
        stdout: { bytes: stdoutBytes, sha256: stdout.digest("hex") },
        stderr: { bytes: stderrBytes, sha256: stderr.digest("hex") },
      };
      const assertionPassed = !command.assertOutput || command.assertOutput.test(excerpt);
      if (exitCode === command.expectedExit && !timedOut && !signal && assertionPassed) resolvePromise(result);
      else reject(Object.assign(new Error(`${command.id} expected exit ${command.expectedExit}, received ${exitCode}.`), { result }));
    }
  });
}

function command(id, executable, arguments_, options = {}) {
  return { id, executable, arguments: arguments_, expectedExit: 0, cwdClass: "consumer", ...options };
}

async function executeOperation(operation, { environment, runRoot }) {
  if (!operation.kind) {
    return execute(operation, { cwd: operation.cwd ?? runRoot, env: { ...environment, ...operation.env } });
  }
  const startedAt = new Date().toISOString();
  const started = performance.now();
  if (operation.kind === "exact-public-npm-consumer") {
    mkdirSync(operation.path, { recursive: true });
    const release = operation.release;
    writeFileSync(
      join(operation.path, "package.json"),
      `${JSON.stringify({ name: "anonymous-public-vireo-consumer", private: true, dependencies: Object.fromEntries(release.npm.map(entry => [entry.name, entry.version])) }, null, 2)}\n`,
    );
    const result = await execute(
      command("exact-public-npm-install", "corepack", ["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund", "--strict-peer-deps"], { cwd: operation.path, cwdClass: "anonymous-npm" }),
      { cwd: operation.path, env: environment },
    );
    assertExactPublicNpmConsumer({ consumerRoot: operation.path, release, registry: environment.npm_config_registry });
    return result;
  }
  if (operation.kind === "write") writeFileSync(operation.path, operation.contents, { mode: 0o600 });
  else if (operation.kind === "assert-file") {
    if (!existsSync(operation.path)) throw new Error(`${operation.id} expected a retained file.`);
    if (operation.contents !== undefined && readFileSync(operation.path, "utf8") !== operation.contents)
      throw new Error(`${operation.id} detected an overwritten sentinel.`);
  } else if (operation.kind === "assert-absent") {
    if (existsSync(operation.path)) throw new Error(`${operation.id} expected cleanup to remove the target.`);
  } else if (operation.kind === "mutate-generated") {
    const manifest = JSON.parse(readFileSync(join(operation.path, ".vireo", "generated", "purchase-orders.json"), "utf8"));
    const target = join(operation.path, manifest.files?.[0]?.path ?? "");
    if (!manifest.files?.[0]?.path || !existsSync(target)) throw new Error("Generated capability has no mutable managed output.");
    writeFileSync(target, `${readFileSync(target, "utf8")}\n// anonymous-consumer customization\n`);
  } else if (operation.kind === "record-generated-digest" || operation.kind === "assert-generated-digest") {
    const manifest = JSON.parse(readFileSync(join(operation.path, ".vireo", "generated", "purchase-orders.json"), "utf8"));
    const digest = createHash("sha256").update(manifest.files.map(file => readFileSync(join(operation.path, file.path))).join("")) .digest("hex");
    if (operation.kind === "record-generated-digest") observedDigests.set(operation.path, digest);
    else if (observedDigests.get(operation.path) !== digest) throw new Error("Generated capability rerun changed managed bytes.");
  } else if (operation.kind === "assert-removal-receipt") {
    const receipt = join(operation.path, ".vireo", "remove-example.json");
    if (!existsSync(receipt)) throw new Error("Sample removal did not write its receipt.");
    const text = JSON.stringify(JSON.parse(readFileSync(receipt, "utf8")));
    if (/Item|item/i.test(text) === false) throw new Error("Sample removal receipt is not attributable to the Template sample.");
  } else if (operation.kind === "mutate-managed-file" || operation.kind === "restore-managed-file") {
    const managed = JSON.parse(readFileSync(join(operation.path, ".vireo", "managed-files.json"), "utf8"));
    const relativePath = managed.files?.[0]?.path;
    const target = join(operation.path, relativePath ?? "");
    if (!relativePath || !existsSync(target)) throw new Error("Project has no mutable managed file.");
    if (operation.kind === "mutate-managed-file") {
      managedOriginals.set(operation.path, { target, contents: readFileSync(target, "utf8") });
      writeFileSync(target, `${readFileSync(target, "utf8")}\n// anonymous upgrade drift\n`);
    } else {
      const original = managedOriginals.get(operation.path);
      if (!original) throw new Error("Managed-file restoration has no recorded original.");
      writeFileSync(original.target, original.contents);
    }
  } else if (operation.kind === "assert-deployment-contract") {
    const script = readFileSync(join(operation.path, "scripts", "verify-deployment.sh"), "utf8");
    for (const assertion of ["security", "header", "proxy", "/api", "postgres", "migration"]) {
      if (!script.toLowerCase().includes(assertion))
        throw new Error(`Generated deployment verifier does not prove ${assertion}.`);
    }
  } else if (operation.kind === "assert-script") {
    const scripts = JSON.parse(readFileSync(join(operation.path, "package.json"), "utf8")).scripts ?? {};
    if (typeof scripts[operation.script] !== "string") throw new Error(`${operation.id} requires generated script ${operation.script}.`);
  } else if (operation.kind === "assert-project-identity") {
    const project = JSON.parse(readFileSync(join(operation.path, ".vireo", "project.json"), "utf8"));
    if (
      project.createdBy !== `create-vireo@${operation.release.createVireoVersion}` ||
      project.templateCommit !== operation.release.template.commit ||
      project.templateVersion !== operation.release.template.version ||
      project.templateTag !== operation.release.template.tag ||
      project.profile !== operation.profile ||
      (operation.database !== undefined && project.database !== operation.database)
    ) throw new Error(`${operation.id} found incoherent generated release identity/provenance.`);
    if (!existsSync(join(operation.path, ".vireo", "managed-files.json")))
      throw new Error(`${operation.id} is missing managed-file provenance.`);
  } else if (operation.kind === "assert-public-evidence") {
    const problems = validateAnonymousPublicEvidence({ manifest: JSON.parse(readFileSync(operation.path, "utf8")), release: operation.release });
    if (problems.length > 0) throw new Error(problems.join("\n"));
  } else if (operation.kind === "assert-ejected-marker") {
    const visit = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() && entry.name !== "node_modules" ? visit(path) : entry.isFile() ? [path] : [];
    });
    if (!visit(operation.path).some(path => readFileSync(path, "utf8").includes("@vireo-ejected")))
      throw new Error("Ejection did not retain application code with an ejected marker.");
  } else throw new Error(`Unsupported anonymous gauntlet operation ${operation.kind}.`);
  return {
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - started),
    exitCode: 0,
    expectedExit: 0,
    cwdClass: "consumer",
    argumentCategories: [operation.kind],
    stdout: { bytes: 0, sha256: createHash("sha256").digest("hex") },
    stderr: { bytes: 0, sha256: createHash("sha256").digest("hex") },
  };
}

function scenarioCommands({ scenario, release, consumerRoot, upgradePolicy }) {
  const create = (directory, profile, extra = []) => ({
    executable: "corepack",
    arguments: [
      "npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", directory,
      "--yes", "--no-git", "--profile", profile, "--display-name", "Anonymous Gauntlet", "--owner-name", "Vireo CI",
      "--repository-url", "https://example.invalid/anonymous-consumer", "--support-url", "https://example.invalid/support",
      "--security-contact", "security@example.invalid", ...extra,
    ],
  });
  const vireo = (directory, ...arguments_) => ({
    executable: "corepack",
    arguments: ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "vireo", ...arguments_, "--project", directory],
  });
  const frontend = join(consumerRoot, "frontend");
  const h2 = join(consumerRoot, "full-stack-h2");
  const capability = join(consumerRoot, "capability-h2");
  const removal = join(consumerRoot, "sample-removal-h2");
  const ejection = join(consumerRoot, "ejection-h2");
  switch (scenario.id) {
    case "public-artifacts":
      return [
        ...release.npm.map(({ name, version }) =>
        command(`registry-${name}`, "corepack", ["npm", "view", `${name}@${version}`, "--json"], {
          assertOutput: new RegExp(`"name"\\s*:\\s*"${name.replace("@", "@")}"[\\s\\S]*"version"\\s*:\\s*"${version}"`, "u"),
        }),
      ),
        command("exact-public-npm-verifier", "node", [join(root, "scripts", "verify-npm-public-release.mjs"), join(evidenceDirectory, "exact-npm-public.json")], { cwdClass: "framework-verifier", timeoutMs: 45 * 60_000 }),
        command("public-evidence-collector", "node", [join(root, "scripts", "collect-public-release-evidence.mjs"), join(evidenceDirectory, "public-release-evidence")], { cwdClass: "framework-verifier", timeoutMs: 45 * 60_000 }),
        { kind: "assert-public-evidence", id: "exact-public-evidence-contract", path: join(evidenceDirectory, "public-release-evidence", "public-release-manifest.json"), release },
      ];
    case "cli-adversity": {
      const occupied = join(consumerRoot, "occupied-target");
      const failed = join(consumerRoot, "failed-download");
      const fetchBlocker = join(consumerRoot, "block-template-download.cjs");
      return [
        command("cli-help", "corepack", ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", "--help"], { assertOutput: /Create a Vireo application/u }),
        command("cli-json-dry-run", "corepack", ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", join(consumerRoot, "dry-run"), "--dry-run", "--json", "--yes", "--no-git"], { assertOutput: /"dryRun"\s*:\s*true/u }),
        { ...create(join(consumerRoot, "invalid-name"), "frontend", ["--name", "Invalid_Name"]), id: "invalid-project-name", expectedExit: 1, assertOutput: /projectName|kebab/u },
        { ...create(join(consumerRoot, "invalid-java"), "full-stack", ["--java-package", "not-a-java-package"]), id: "invalid-java-package", expectedExit: 1, assertOutput: /javaPackage|Java package/u },
        { ...create(join(consumerRoot, "invalid-repository"), "frontend", ["--repository-url", "ftp://example.invalid"]), id: "invalid-repository-url", expectedExit: 1, assertOutput: /repositoryUrl|repository URL/u },
        { ...create(join(consumerRoot, "invalid-support"), "frontend", ["--support-url", "javascript:alert(1)"]), id: "invalid-support-url", expectedExit: 1, assertOutput: /supportUrl|support URL/u },
        { kind: "write", id: "occupied-sentinel", path: occupied, contents: "do not overwrite\n" },
        { ...create(occupied, "frontend"), id: "occupied-target-refusal", expectedExit: 1, assertOutput: /already exists|target/u },
        { kind: "assert-file", id: "occupied-sentinel-retained", path: occupied, contents: "do not overwrite\n" },
        { kind: "write", id: "template-download-blocker", path: fetchBlocker, contents: "globalThis.fetch = async () => { throw new Error('intentional anonymous gauntlet download failure'); };\n" },
        { ...create(failed, "frontend"), id: "template-download-failure", expectedExit: 1, env: { NODE_OPTIONS: `--require=${fetchBlocker}` }, assertOutput: /download failure|template/i },
        { kind: "assert-absent", id: "failed-download-cleanup", path: failed },
        { ...create(failed, "frontend"), id: "template-download-retry", expectedExit: 0 },
        { kind: "assert-file", id: "retry-project-provenance", path: join(failed, ".vireo", "project.json") },
      ];
    }
    case "frontend-creation": return [
      create(frontend, "frontend"),
      { kind: "assert-project-identity", id: "frontend-exact-provenance", path: frontend, release, profile: "frontend" },
      command("frontend-setup", "corepack", ["npm", "run", "setup"], { cwd: frontend }),
      command("frontend-doctor-json", "corepack", ["npm", "run", "doctor", "--", "--json"], { cwd: frontend }),
      command("frontend-release-identity", "corepack", ["npm", "run", "identity:check:release", "--", "--json"], { cwd: frontend }),
      command("frontend-verify", "corepack", ["npm", "run", "verify"], { cwd: frontend, timeoutMs: 30 * 60_000 }),
      command("frontend-production-build", "corepack", ["npm", "run", "build"], { cwd: frontend }),
    ];
    case "full-stack-h2-creation": return [
      create(h2, "full-stack", ["--java-package", "com.example.gauntlet", "--database", "h2"]),
      { kind: "assert-project-identity", id: "h2-exact-provenance", path: h2, release, profile: "full-stack", database: "h2" },
      command("h2-setup", "corepack", ["npm", "run", "setup"], { cwd: h2 }),
      command("h2-doctor-json", "corepack", ["npm", "run", "doctor", "--", "--json"], { cwd: h2 }),
      command("h2-release-identity", "corepack", ["npm", "run", "identity:check:release", "--", "--json"], { cwd: h2 }),
      command("h2-verify", "corepack", ["npm", "run", "verify"], { cwd: h2, timeoutMs: 45 * 60_000 }),
      command("h2-frontend-production-build", "corepack", ["npm", "run", "build", "--prefix", "frontend"], { cwd: h2 }),
      command("h2-boot-jar", "./gradlew", ["bootJar", "--no-daemon", "--no-build-cache"], { cwd: h2, timeoutMs: 30 * 60_000 }),
    ];
    case "release-identity-and-doctor": return [
      command("frontend-doctor-json", "corepack", ["npm", "run", "doctor", "--", "--json"], { cwd: frontend }),
      command("frontend-identity-release-json", "corepack", ["npm", "run", "identity:check:release", "--", "--json"], { cwd: frontend }),
      { kind: "assert-file", id: "frontend-project-provenance", path: join(frontend, ".vireo", "project.json") },
      { kind: "assert-file", id: "full-stack-project-provenance", path: join(h2, ".vireo", "project.json") },
    ];
    case "capability-lifecycle": return [
      create(capability, "full-stack", ["--java-package", "com.example.capability", "--database", "h2"]),
      command("capability-setup", "corepack", ["npm", "run", "setup"], { cwd: capability }),
      vireo(capability, "generate", "entity", ".vireo/examples/purchase-order.entity.json"),
      { kind: "record-generated-digest", id: "capability-first-digest", path: capability },
      vireo(capability, "check", "--json"),
      vireo(capability, "generate", "entity", ".vireo/examples/purchase-order.entity.json"),
      { kind: "assert-generated-digest", id: "capability-idempotent-digest", path: capability },
      { kind: "mutate-generated", id: "customize-generated-output", path: capability },
      { ...vireo(capability, "generate", "entity", ".vireo/examples/purchase-order.entity.json"), id: "customization-refusal", expectedExit: 1, assertOutput: /VIR-GEN-004|customized/u },
    ];
    case "sample-removal-and-ejection": return [
      create(removal, "full-stack", ["--java-package", "com.example.removal", "--database", "h2"]),
      command("removal-setup", "corepack", ["npm", "run", "setup"], { cwd: removal }),
      vireo(removal, "remove-example", "--status"), vireo(removal, "remove-example", "--dry-run"), vireo(removal, "remove-example", "--apply"),
      { kind: "assert-removal-receipt", id: "sample-removal-receipt", path: removal },
      vireo(removal, "remove-example", "--status"), vireo(removal, "remove-example", "--apply"), command("removal-verify", "corepack", ["npm", "run", "verify"], { cwd: removal, timeoutMs: 45 * 60_000 }),
      create(ejection, "full-stack", ["--java-package", "com.example.ejection", "--database", "h2"]),
      command("ejection-setup", "corepack", ["npm", "run", "setup"], { cwd: ejection }),
      vireo(ejection, "generate", "entity", ".vireo/examples/purchase-order.entity.json"), vireo(ejection, "eject", "purchase-orders"),
      { kind: "assert-absent", id: "ejected-management-removed", path: join(ejection, ".vireo", "generated", "purchase-orders.json") },
      { kind: "assert-file", id: "ejected-capability-provenance", path: join(ejection, ".vireo", "ejected-capabilities.json") },
      { kind: "assert-ejected-marker", id: "ejected-application-code-retained", path: ejection },
      { kind: "assert-file", id: "managed-provenance-retained", path: join(ejection, ".vireo", "managed-files.json") },
      command("ejection-verify", "corepack", ["npm", "run", "verify"], { cwd: ejection, timeoutMs: 45 * 60_000 }),
    ];
    case "postgresql-production": {
      const postgresql = join(consumerRoot, "full-stack-postgresql");
      return [
        create(postgresql, "full-stack", ["--java-package", "com.example.postgresql", "--database", "postgresql"]),
        { kind: "assert-project-identity", id: "postgresql-exact-provenance", path: postgresql, release, profile: "full-stack", database: "postgresql" },
        command("postgresql-setup", "corepack", ["npm", "run", "setup"], { cwd: postgresql }),
        command("postgresql-production-compose", "sh", ["scripts/verify-deployment.sh"], { cwd: postgresql, timeoutMs: 45 * 60_000 }),
        { kind: "assert-deployment-contract", id: "postgresql-deployment-boundaries", path: postgresql },
      ];
    }
    case "adjacent-public-upgrades": {
      const supportedTargets = Object.entries(upgradePolicy.releaseCoordinates ?? {})
        .filter(([, coordinate]) => coordinate.status === "supported")
        .map(([version]) => version);
      const targets = supportedTargets.length > 0 ? supportedTargets : [upgradePolicy.publicRelease];
      const edges = targets.flatMap(target => (upgradePolicy.requiredEdges ?? []).filter(edge => edge.to === target));
      if (
        edges.length === 0 ||
        upgradePolicy.publicRelease !== release.createVireoVersion ||
        !targets.includes(release.createVireoVersion) ||
        ![...edges.map(edge => edge.from), upgradePolicy.publicRelease].includes(upgradePolicy.maintenance?.priorCurrentUpgradeSource) ||
        edges.some(edge => upgradePolicy.releaseCoordinates?.[edge.to]?.status === "candidate")
      ) {
        throw new Error("Project-upgrade policy must expose an adjacent public edge for the current public create-vireo release.");
      }
      return edges.flatMap(edge => ["frontend", "full-stack"].flatMap(profile => {
        const directory = join(consumerRoot, `upgrade-${edge.from}-to-${edge.to}-${profile}`);
        const creation = {
          executable: "corepack",
          arguments: [
            "npm", "exec", "--yes", `--package=create-vireo@${edge.from}`, "--", "create-vireo", directory,
            "--yes", "--no-git", "--profile", profile,
          ],
        };
        if (profile === "full-stack") creation.arguments.push("--java-package", "com.example.upgrade", "--database", "h2");
        return [
          creation,
          { executable: "corepack", arguments: ["npm", "run", "setup"], cwd: directory, timeoutMs: 20 * 60_000 },
          { kind: "mutate-managed-file", id: `upgrade-${edge.from}-${edge.to}-${profile}-managed-refusal-mutation`, path: directory },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--dry-run", "--project", directory], expectedExit: 1, assertOutput: /managed|drift|customized/i },
          { kind: "restore-managed-file", id: `upgrade-${edge.from}-${edge.to}-${profile}-restore-managed-file`, path: directory },
          {
            executable: "corepack",
            arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--dry-run", "--project", directory],
          },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--apply", "--accept-application-owned", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--apply", "--project", directory], expectedExit: 1 },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--dry-run", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "status", "--json", "--project", directory] },
          { kind: "assert-file", id: `upgrade-${edge.from}-${edge.to}-${profile}-provenance`, path: join(directory, ".vireo", "project.json") },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "check", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "run", "verify"], cwd: directory, timeoutMs: 45 * 60_000 },
        ];
      }));
    }
    case "npm-consumer-surface": return [
      { kind: "exact-public-npm-consumer", id: "exact-public-npm-install", path: join(consumerRoot, "public-npm") },
      ...release.npm.map(({ name, version }) => command(`npm-pack-${name}`, "corepack", ["npm", "pack", `${name}@${version}`, "--json"], { assertOutput: /"filename"/u })),
      command("public-release-evidence", "node", [join(root, "scripts", "collect-public-release-evidence.mjs"), join(evidenceDirectory, "public-release-evidence")], { cwdClass: "framework-verifier", timeoutMs: 30 * 60_000 }),
    ];
    case "maven-consumer-surface": return [
      command("maven-central-consumer", "sh", [join(root, "jvm", "scripts", "verify-central-consumer.sh"), release.maven.version], { cwdClass: "framework-verifier", timeoutMs: 45 * 60_000 }),
      command("maven-detached-signatures", "node", [join(root, "scripts", "verify-public-maven-signatures.mjs"), release.maven.version, join(evidenceDirectory, "maven-signatures.json")], { cwdClass: "framework-verifier", timeoutMs: 30 * 60_000 }),
      { kind: "assert-public-evidence", id: "maven-public-evidence-contract", path: join(evidenceDirectory, "public-release-evidence", "public-release-manifest.json"), release },
    ];
    case "storybook-and-production-builds": return [
      command("storybook-interaction", "corepack", ["npm", "run", "test:storybook"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
      command("storybook-static", "corepack", ["npm", "run", "build-storybook"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
      command("full-stack-frontend-production", "corepack", ["npm", "run", "build", "--prefix", "frontend"], { cwd: h2 }),
      command("full-stack-boot-jar", "./gradlew", ["bootJar", "--no-daemon", "--no-build-cache"], { cwd: h2, timeoutMs: 30 * 60_000 }),
    ];
    case "browser-and-pwa": return [
      { kind: "assert-script", id: "h2-browser-smoke-script", path: join(h2, "frontend"), script: "test:e2e" },
      command("browser-smoke", "corepack", ["npm", "run", "test:e2e"], { cwd: join(h2, "frontend"), timeoutMs: 20 * 60_000 }),
      { kind: "assert-script", id: "frontend-pwa-lifecycle-script", path: frontend, script: "test:pwa" },
      command("pwa-two-build-lifecycle", "corepack", ["npm", "run", "test:pwa"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
    ];
    case "container-and-network-boundaries": return [
      { kind: "assert-deployment-contract", id: "container-security-proxy-database-contract", path: join(consumerRoot, "full-stack-postgresql") },
    ];
    default: throw new Error(`No implementation recipe for ${scenario.id}.`);
  }
}

export async function runAnonymousConsumerGauntlet({ check = checkOnly, dry = dryRun } = {}) {
  const policy = readJson(policyPath);
  const release = publicReleaseIdentity(readJson(join(root, policy.releaseSource)));
  const preflightProblems = validateReleasePreflightIdentity({
    release,
    requestedReleaseId: releaseIdArgument >= 0 ? process.argv[releaseIdArgument + 1] : process.env.VIREO_GAUNTLET_RELEASE_ID,
    requestedSourceCommit: sourceCommitArgument >= 0 ? process.argv[sourceCommitArgument + 1] : process.env.VIREO_GAUNTLET_SOURCE_COMMIT,
    verifierSourceCommit: process.env.GITHUB_SHA ?? process.env.VIREO_GAUNTLET_SOURCE_COMMIT,
  });
  if (preflightProblems.length > 0) throw new Error(preflightProblems.join("\n"));
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const problems = validatePolicy(policy, release);
  if (problems.length > 0)
    throw new Error(`Anonymous consumer gauntlet policy failed:\n${problems.map(problem => `- ${problem}`).join("\n")}`);
  if (check) {
    buildExecutionPlan({ policy, release, upgradePolicy: readJson(join(root, "contracts", "project-upgrade-policy.json")), consumerRoot: "/tmp/vireo-anonymous-plan" });
    console.log(`Anonymous consumer gauntlet policy passed for ${release.id}: ${policy.scenarios.length} sequential scenarios.`);
    return;
  }

  const runRoot = mkdtempSync(join(tmpdir(), "vireo-anonymous-consumer-"));
  const environment = anonymousEnvironment({
    root: runRoot,
    registry: policy.registry,
    playwrightBrowsersPath: process.env.VIREO_GAUNTLET_PLAYWRIGHT_BROWSERS_PATH,
  });
  const evidence = {
    schemaVersion: policy.evidence.schemaVersion,
    release,
    isolation: policy.isolation,
    dryRun: dry,
    status: dry ? "planned" : "running",
    findings: [],
    externalWarnings: [],
    remainingHumanOnly: [
      { category: "physical-device", owner: "consumer", reason: "Brand and physical-device PWA installation evidence remains a product decision.", evidenceReferences: [] },
      { category: "adoption", owner: "product", reason: "Public-beta adoption evidence requires real consumer teams and cannot be manufactured by CI.", evidenceReferences: [] },
    ],
    verifierSourceCommit: process.env.GITHUB_SHA ?? process.env.VIREO_GAUNTLET_SOURCE_COMMIT ?? "local-dry-run",
    requestedReleaseId: release.id,
    workflow: { repository: process.env.GITHUB_REPOSITORY ?? "local", run: process.env.GITHUB_RUN_ID ?? "local", attempt: process.env.GITHUB_RUN_ATTEMPT ?? "1", event: process.env.GITHUB_EVENT_NAME ?? "local" },
    scenarios: [],
  };
  if (!dry) evidence.externalWarnings.push(...(await verifyPublicReleasePreflight({ release })).warnings);
  const checkpoint = () => writeEvidenceAtomically(join(evidenceDirectory, "evidence.json"), evidence);
  try {
    mkdirSync(join(runRoot, "consumer"), { recursive: true });
    for (const scenario of policy.scenarios) {
      const result = { id: scenario.id, recipe: scenario.recipe, status: dry ? "planned" : "running", commands: [] };
      evidence.scenarios.push(result);
      checkpoint();
      try {
        let commandIndex = 0;
        for (const rawCommand of scenarioCommands({
          scenario,
          release,
          consumerRoot: join(runRoot, "consumer"),
          upgradePolicy,
        })) {
          commandIndex += 1;
          const command = {
            expectedExit: 0,
            cwdClass: "consumer",
            id: `${scenario.id}-${commandIndex}`,
            release,
            ...rawCommand,
          };
          if (!command.kind) assertNoMavenLocal(command, environment);
          const record = {
            id: command.id,
            kind: command.kind ?? "command",
            status: dry ? "planned" : "running",
            executable: command.executable,
            arguments: (command.arguments ?? []).map(value =>
              typeof value === "string"
                ? value.replaceAll(runRoot, "$ANONYMOUS_CONSUMER_ROOT").replaceAll(root, "$VIREO_REPOSITORY")
                : value,
            ),
          };
          result.commands.push(record);
          checkpoint();
          if (!dry) {
            try {
              Object.assign(record, await executeOperation(command, { environment, runRoot }), { status: "passed" });
            } catch (error) {
              Object.assign(record, error?.result ?? {}, { status: "failed", error: error instanceof Error ? error.message : String(error) });
              checkpoint();
              throw error;
            }
          }
          checkpoint();
        }
        if (!dry && ["frontend-creation", "full-stack-h2-creation"].includes(scenario.id)) {
          const projectRoot = join(
            runRoot,
            "consumer",
            scenario.id === "frontend-creation" ? "frontend" : "full-stack-h2",
            ...(scenario.id === "frontend-creation" ? [] : ["frontend"]),
          );
          assertAnonymousInstallation({ consumerRoot: projectRoot, packageNames: ["@vireocodedev/ui"], registry: policy.registry });
          assertAnonymousVireoLock({ consumerRoot: projectRoot, release, registry: policy.registry });
        }
      } catch (error) {
        result.status = "failed";
        result.error = error instanceof Error ? error.message : String(error);
        evidence.status = "failed";
        checkpoint();
        throw error;
      }
      result.status = dry ? "planned" : "passed";
      checkpoint();
    }
  } finally {
    if (evidence.status === "running") evidence.status = dry ? "planned" : "passed";
    checkpoint();
    rmSync(runRoot, { recursive: true, force: true });
  }
  if (!dry) {
    const finalProblems = validateFinalAnonymousEvidence(evidence, release);
    if (finalProblems.length > 0) throw new Error(finalProblems.join("\n"));
  }
  console.log(
    dry
      ? `Anonymous consumer gauntlet plan generated for ${release.id}; evidence: ${join(evidenceDirectory, "evidence.json")}`
      : `Anonymous consumer gauntlet passed for ${release.id}; evidence: ${join(evidenceDirectory, "evidence.json")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runAnonymousConsumerGauntlet();
