import { execFile } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  anonymousEnvironment,
  assertAnonymousInstallation,
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
    const child = execFile(command.executable, command.arguments, { ...options, encoding: "utf8", maxBuffer: 1024 * 1024 }, error => {
      if (error) reject(error);
      else resolvePromise();
    });
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
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
      return release.npm.map(({ name, version }) => ({ executable: "corepack", arguments: ["npm", "view", `${name}@${version}`, "--json"] }));
    case "cli-adversity":
      return [
        { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", "--help"] },
        { executable: "corepack", arguments: ["npm", "exec", "--yes", `--package=create-vireo@${release.createVireoVersion}`, "--", "create-vireo", join(consumerRoot, "dry-run"), "--dry-run", "--json", "--yes", "--no-git"] },
      ];
    case "frontend-creation": return [create(frontend, "frontend"), { executable: "corepack", arguments: ["npm", "run", "setup"] }, { executable: "corepack", arguments: ["npm", "run", "doctor"] }].map((command, index) => index === 0 ? command : { ...command, cwd: frontend });
    case "full-stack-h2-creation": return [create(h2, "full-stack", ["--java-package", "com.example.gauntlet", "--database", "h2"]), { executable: "corepack", arguments: ["npm", "run", "setup"], cwd: h2 }, { executable: "corepack", arguments: ["npm", "run", "doctor"], cwd: h2 }];
    case "release-identity-and-doctor": return [{ executable: "corepack", arguments: ["npm", "run", "doctor"], cwd: frontend }];
    case "capability-lifecycle": return [vireo(h2, "check"), vireo(h2, "generate", "entity", ".vireo/examples/purchase-order.entity.json", "--dry-run")];
    case "sample-removal-and-ejection": return [vireo(h2, "remove-example", "--status"), vireo(h2, "remove-example", "--dry-run")];
    case "postgresql-production": return [create(join(consumerRoot, "full-stack-postgresql"), "full-stack", ["--java-package", "com.example.postgresql", "--database", "postgresql"])];
    case "adjacent-public-upgrades": {
      const target = upgradePolicy.publicRelease;
      const edge = upgradePolicy.requiredEdges?.find(candidate => candidate.to === target);
      if (!edge || target !== release.createVireoVersion) {
        throw new Error("Project-upgrade policy must expose an adjacent public edge for the current public create-vireo release.");
      }
      return ["frontend", "full-stack"].flatMap(profile => {
        const directory = join(consumerRoot, `upgrade-${profile}`);
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
            arguments: ["npm", "exec", "--yes", `--package=create-vireo@${target}`, "--", "vireo", "upgrade", "--to", target, "--dry-run", "--project", directory],
          },
        ];
      });
    }
    case "npm-consumer-surface": return [{ executable: "node", arguments: [join(root, "scripts", "verify-npm-public-release.mjs"), join(evidenceDirectory, "npm-public-verification.json")] }];
    case "maven-consumer-surface": return [{ executable: "sh", arguments: [join(root, "jvm", "scripts", "verify-central-consumer.sh"), release.maven.version] }];
    case "storybook-and-production-builds":
    case "browser-and-pwa":
    case "container-and-network-boundaries":
      return [{ executable: "corepack", arguments: ["npm", "run", "verify"], cwd: h2 }];
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
  const evidence = { schemaVersion: policy.evidence.schemaVersion, release, isolation: policy.isolation, dryRun: dry, scenarios: [] };
  try {
    mkdirSync(join(runRoot, "consumer"), { recursive: true });
    for (const scenario of policy.scenarios) {
      const result = { id: scenario.id, summary: scenario.summary, status: "passed", commands: [] };
      try {
        for (const command of scenarioCommands({
          scenario,
          release,
          consumerRoot: join(runRoot, "consumer"),
          upgradePolicy,
        })) {
          assertNoMavenLocal(command, environment);
          result.commands.push(
            [command.executable, ...(command.arguments ?? [])].map(value =>
              typeof value === "string" ? value.replaceAll(runRoot, "$ANONYMOUS_CONSUMER_ROOT") : value,
            ),
          );
          if (!dry) await execute(command, { cwd: command.cwd ?? runRoot, env: environment });
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
        evidence.scenarios.push(result);
        throw error;
      }
      evidence.scenarios.push(result);
    }
  } finally {
    writeEvidenceAtomically(join(evidenceDirectory, "evidence.json"), evidence);
    rmSync(runRoot, { recursive: true, force: true });
  }
  console.log(`Anonymous consumer gauntlet passed for ${release.id}; evidence: ${join(evidenceDirectory, "evidence.json")}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runAnonymousConsumerGauntlet();
