import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = join(root, "contracts", "anonymous-consumer-gauntlet-policy.json");
const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const dryRun = args.has("--dry-run");
const evidenceArgument = process.argv.indexOf("--evidence-dir");
const evidenceDirectory = evidenceArgument >= 0 ? resolve(process.argv[evidenceArgument + 1]) : join(root, ".anonymous-consumer-evidence");

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
  if (!release?.createVireoVersion || !release.template.commit) problems.push("current ecosystem release is incomplete");
  return problems;
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
    const child = spawn(command.executable, command.arguments, { ...options, stdio: ["ignore", "pipe", "pipe"] });
    const timeout = setTimeout(() => child.kill("SIGTERM"), command.timeoutMs ?? 20 * 60_000);
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
    child.on("close", code => finish(code ?? 1));
    function finish(exitCode) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      const result = {
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
        exitCode,
        expectedExit: command.expectedExit,
        cwdClass: command.cwdClass ?? "consumer",
        argumentCategories: command.argumentCategories ?? [],
        stdout: { bytes: stdoutBytes, sha256: stdout.digest("hex") },
        stderr: { bytes: stderrBytes, sha256: stderr.digest("hex") },
      };
      if (exitCode === command.expectedExit && (!command.assertOutput || command.assertOutput.test(excerpt))) resolvePromise(result);
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
  } else if (operation.kind === "assert-deployment-contract") {
    const script = readFileSync(join(operation.path, "scripts", "verify-deployment.sh"), "utf8");
    for (const assertion of ["security", "header", "proxy", "/api", "postgres", "migration"]) {
      if (!script.toLowerCase().includes(assertion))
        throw new Error(`Generated deployment verifier does not prove ${assertion}.`);
    }
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
  switch (scenario.id) {
    case "public-artifacts":
      return release.npm.map(({ name, version }) =>
        command(`registry-${name}`, "corepack", ["npm", "view", `${name}@${version}`, "--json"], {
          assertOutput: new RegExp(`"name"\\s*:\\s*"${name.replace("@", "@")}"[\\s\\S]*"version"\\s*:\\s*"${version}"`, "u"),
        }),
      );
    case "cli-adversity": {
      const occupied = join(consumerRoot, "occupied-target");
      const failed = join(consumerRoot, "failed-download");
      const recovered = join(consumerRoot, "recovered-download");
      const fetchBlocker = join(consumerRoot, "block-template-download.cjs");
      return [
        command("cli-help", "corepack", ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", "--help"], { assertOutput: /Create a Vireo application/u }),
        command("cli-json-dry-run", "corepack", ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", join(consumerRoot, "dry-run"), "--dry-run", "--json", "--yes", "--no-git"], { assertOutput: /"dryRun"\s*:\s*true/u }),
        { ...create(join(consumerRoot, "invalid-name"), "frontend", ["--name", "Invalid_Name"]), id: "invalid-project-name", expectedExit: 1 },
        { ...create(join(consumerRoot, "invalid-java"), "full-stack", ["--java-package", "not-a-java-package"]), id: "invalid-java-package", expectedExit: 1 },
        { ...create(join(consumerRoot, "invalid-repository"), "frontend", ["--repository-url", "ftp://example.invalid"]), id: "invalid-repository-url", expectedExit: 1 },
        { ...create(join(consumerRoot, "invalid-support"), "frontend", ["--support-url", "javascript:alert(1)"]), id: "invalid-support-url", expectedExit: 1 },
        { kind: "write", id: "occupied-sentinel", path: occupied, contents: "do not overwrite\n" },
        { ...create(occupied, "frontend"), id: "occupied-target-refusal", expectedExit: 1 },
        { kind: "assert-file", id: "occupied-sentinel-retained", path: occupied, contents: "do not overwrite\n" },
        { kind: "write", id: "template-download-blocker", path: fetchBlocker, contents: "globalThis.fetch = async () => { throw new Error('intentional anonymous gauntlet download failure'); };\n" },
        { ...create(failed, "frontend"), id: "template-download-failure", expectedExit: 1, env: { NODE_OPTIONS: `--require=${fetchBlocker}` } },
        { kind: "assert-absent", id: "failed-download-cleanup", path: failed },
        { ...create(recovered, "frontend"), id: "template-download-retry", expectedExit: 0 },
        { kind: "assert-file", id: "retry-project-provenance", path: join(recovered, ".vireo", "project.json") },
      ];
    }
    case "frontend-creation": return [
      create(frontend, "frontend"),
      command("frontend-setup", "corepack", ["npm", "run", "setup"], { cwd: frontend }),
      command("frontend-doctor-json", "corepack", ["npm", "run", "doctor", "--", "--json"], { cwd: frontend }),
      command("frontend-release-identity", "corepack", ["npm", "run", "identity:check:release", "--", "--json"], { cwd: frontend }),
      command("frontend-verify", "corepack", ["npm", "run", "verify"], { cwd: frontend, timeoutMs: 30 * 60_000 }),
      command("frontend-production-build", "corepack", ["npm", "run", "build"], { cwd: frontend }),
    ];
    case "full-stack-h2-creation": return [
      create(h2, "full-stack", ["--java-package", "com.example.gauntlet", "--database", "h2"]),
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
      vireo(h2, "generate", "entity", ".vireo/examples/purchase-order.entity.json"),
      vireo(h2, "check", "--json"),
      vireo(h2, "generate", "entity", ".vireo/examples/purchase-order.entity.json"),
      { kind: "mutate-generated", id: "customize-generated-output", path: h2 },
      { ...vireo(h2, "generate", "entity", ".vireo/examples/purchase-order.entity.json"), id: "customization-refusal", expectedExit: 1 },
    ];
    case "sample-removal-and-ejection": return [
      vireo(h2, "remove-example", "--status"), vireo(h2, "remove-example", "--dry-run"), vireo(h2, "remove-example", "--apply"),
      vireo(h2, "remove-example", "--status"), vireo(h2, "eject", "purchase-orders", "--dry-run"),
      { kind: "assert-file", id: "managed-provenance-retained", path: join(h2, ".vireo", "managed-files.json") },
    ];
    case "postgresql-production": {
      const postgresql = join(consumerRoot, "full-stack-postgresql");
      return [
        create(postgresql, "full-stack", ["--java-package", "com.example.postgresql", "--database", "postgresql"]),
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
      if (edges.length === 0 || !targets.includes(release.createVireoVersion)) {
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
          {
            executable: "corepack",
            arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--dry-run", "--project", directory],
          },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--apply", "--accept-application-owned", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--apply", "--project", directory], expectedExit: 1 },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "upgrade", "--to", edge.to, "--dry-run", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${edge.to}`, "--", "vireo", "status", "--json", "--project", directory] },
          { executable: "corepack", arguments: ["npm", "run", "verify"], cwd: directory, timeoutMs: 45 * 60_000 },
        ];
      }));
    }
    case "npm-consumer-surface": return [
      { kind: "exact-public-npm-consumer", id: "exact-public-npm-install", path: join(consumerRoot, "public-npm") },
      command("npm-pack", "corepack", ["npm", "pack", `create-vireo@${release.createVireoVersion}`, "--json"]),
      command("public-release-evidence", "node", [join(root, "scripts", "collect-public-release-evidence.mjs"), join(evidenceDirectory, "public-release-evidence")], { cwdClass: "framework-verifier", timeoutMs: 30 * 60_000 }),
    ];
    case "maven-consumer-surface": return [command("maven-central-consumer", "sh", [join(root, "jvm", "scripts", "verify-central-consumer.sh"), release.maven.version], { cwdClass: "framework-verifier", timeoutMs: 45 * 60_000 })];
    case "storybook-and-production-builds": return [
      command("storybook-interaction", "corepack", ["npm", "run", "test:storybook"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
      command("storybook-static", "corepack", ["npm", "run", "build-storybook"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
      command("full-stack-frontend-production", "corepack", ["npm", "run", "build", "--prefix", "frontend"], { cwd: h2 }),
      command("full-stack-boot-jar", "./gradlew", ["bootJar", "--no-daemon", "--no-build-cache"], { cwd: h2, timeoutMs: 30 * 60_000 }),
    ];
    case "browser-and-pwa": return [
      command("browser-smoke", "corepack", ["npm", "run", "test:e2e"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
      command("pwa-two-build-lifecycle", "corepack", ["npm", "run", "test:pwa"], { cwd: frontend, timeoutMs: 20 * 60_000 }),
    ];
    case "container-and-network-boundaries": return [
      command("container-boundary-verifier", "sh", ["scripts/verify-deployment.sh"], { cwd: join(consumerRoot, "full-stack-postgresql"), timeoutMs: 45 * 60_000 }),
      { kind: "assert-deployment-contract", id: "container-security-proxy-database-contract", path: join(consumerRoot, "full-stack-postgresql") },
    ];
    default: throw new Error(`No implementation recipe for ${scenario.id}.`);
  }
}

export async function runAnonymousConsumerGauntlet({ check = checkOnly, dry = dryRun } = {}) {
  const policy = readJson(policyPath);
  const release = publicReleaseIdentity(readJson(join(root, policy.releaseSource)));
  const upgradePolicy = readJson(join(root, "contracts", "project-upgrade-policy.json"));
  const problems = validatePolicy(policy, release);
  if (problems.length > 0)
    throw new Error(`Anonymous consumer gauntlet policy failed:\n${problems.map(problem => `- ${problem}`).join("\n")}`);
  if (check) {
    console.log(`Anonymous consumer gauntlet policy passed for ${release.id}: ${policy.scenarios.length} sequential scenarios.`);
    return;
  }

  const runRoot = mkdtempSync(join(tmpdir(), "vireo-anonymous-consumer-"));
  const environment = anonymousEnvironment({ root: runRoot, registry: policy.registry });
  const evidence = {
    schemaVersion: policy.evidence.schemaVersion,
    release,
    isolation: policy.isolation,
    dryRun: dry,
    status: dry ? "planned" : "running",
    scenarios: [],
  };
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
          if (!dry) Object.assign(record, await executeOperation(command, { environment, runRoot }), { status: "passed" });
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
  console.log(
    dry
      ? `Anonymous consumer gauntlet plan generated for ${release.id}; evidence: ${join(evidenceDirectory, "evidence.json")}`
      : `Anonymous consumer gauntlet passed for ${release.id}; evidence: ${join(evidenceDirectory, "evidence.json")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runAnonymousConsumerGauntlet();
