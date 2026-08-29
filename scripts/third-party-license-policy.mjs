import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildJvmInventory, buildNpmInventory, evaluateLicenseInventory } from "./lib/third-party-license-policy.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArguments(arguments_) {
  const options = { ecosystem: "all" };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--ecosystem" && ["npm", "jvm", "all"].includes(arguments_[index + 1])) {
      options.ecosystem = arguments_[index + 1];
      index += 1;
    } else if (argument === "--jvm-sbom" && arguments_[index + 1]) {
      options.jvmSbom = resolve(repositoryRoot, arguments_[index + 1]);
      index += 1;
    } else if (argument === "--output" && arguments_[index + 1]) {
      options.output = resolve(repositoryRoot, arguments_[index + 1]);
      index += 1;
    } else {
      throw new Error(
        "Usage: node scripts/third-party-license-policy.mjs [--ecosystem npm|jvm|all] [--jvm-sbom path] [--output path]",
      );
    }
  }
  return options;
}

function npmRoots(contract) {
  const expected = new Set(contract.current.npm.map(artifact => artifact.name));
  const roots = readdirSync(join(repositoryRoot, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      path: `packages/${entry.name}`,
      manifest: JSON.parse(readFileSync(join(repositoryRoot, "packages", entry.name, "package.json"), "utf8")),
    }))
    .filter(({ manifest }) => manifest.private !== true && expected.has(manifest.name))
    .map(({ path, manifest }) => ({ name: manifest.name, path }));
  if (roots.length !== expected.size) throw new Error("Could not map every released npm artifact to its workspace");
  return roots;
}

export function runLicensePolicy({ ecosystem = "all", jvmSbom, output } = {}) {
  const policy = JSON.parse(readFileSync(join(repositoryRoot, "contracts", "third-party-license-policy.json"), "utf8"));
  const contract = JSON.parse(
    readFileSync(join(repositoryRoot, "contracts", "ecosystem-release-contract.json"), "utf8"),
  );
  const entries = [];
  const inventoryProblems = [];

  if (ecosystem === "npm" || ecosystem === "all") {
    const npmInventory = buildNpmInventory({
      lock: JSON.parse(readFileSync(join(repositoryRoot, "package-lock.json"), "utf8")),
      roots: npmRoots(contract),
    });
    entries.push(...npmInventory.entries);
    inventoryProblems.push(...npmInventory.problems);
  }

  if (ecosystem === "jvm" || ecosystem === "all") {
    let sbomPath = jvmSbom;
    if (!sbomPath) {
      execFileSync(
        join(repositoryRoot, "jvm", "gradlew"),
        ["-p", join(repositoryRoot, "jvm"), "cyclonedxBom", "--no-build-cache", "--quiet"],
        { cwd: repositoryRoot, stdio: "inherit" },
      );
      sbomPath = join(repositoryRoot, "jvm", "build", "reports", "cyclonedx", "bom.json");
    }
    const jvmInventory = buildJvmInventory({
      sbom: JSON.parse(readFileSync(sbomPath, "utf8")),
      roots: contract.current.maven.modules,
      group: contract.current.maven.group,
    });
    entries.push(...jvmInventory.entries);
    inventoryProblems.push(...jvmInventory.problems);
  }

  const result = evaluateLicenseInventory({ entries, problems: inventoryProblems }, policy);
  const report = {
    schemaVersion: 1,
    policy: "contracts/third-party-license-policy.json",
    ecosystems: ecosystem === "all" ? ["npm", "jvm"] : [ecosystem],
    generatedAt: new Date().toISOString(),
    summary: {
      dependencies: result.entries.length,
      direct: result.entries.filter(entry => entry.direct).length,
      transitive: result.entries.filter(entry => !entry.direct).length,
      allowed: result.entries.filter(entry => entry.classification === "allowed").length,
      reviewExceptions: result.entries.filter(entry => entry.classification === "review-exception").length,
    },
    entries: result.entries,
  };
  if (output) {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (result.problems.length > 0) {
    throw new Error(`Third-party license policy failed:\n- ${result.problems.join("\n- ")}`);
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = runLicensePolicy(parseArguments(process.argv.slice(2)));
    console.log(
      `Third-party license policy passed for ${report.summary.dependencies} ${report.ecosystems.join("+")} dependencies ` +
        `(${report.summary.direct} direct, ${report.summary.transitive} transitive, ` +
        `${report.summary.reviewExceptions} reviewed exceptions).`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
