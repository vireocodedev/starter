import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateReleaseSbomPolicy } from "./lib/release-sbom-evidence.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = path => JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));

export function validateTemplateCoordinates(actual, expected, label = "Template") {
  const problems = [];
  for (const field of ["repository", "version", "tag", "commit", "releaseUrl"]) {
    if (actual?.[field] !== expected?.[field]) {
      problems.push(
        `${label} ${field}: expected ${JSON.stringify(expected?.[field])}, found ${JSON.stringify(actual?.[field])}`,
      );
    }
  }
  return problems;
}

export function validatePublicWorkspaceLockEntries(packageLock, publicWorkspacePackages) {
  const problems = [];
  if (!packageLock?.packages || typeof packageLock.packages !== "object") {
    return ["Root package-lock.json must declare workspace package entries"];
  }
  for (const { directory, name, version } of publicWorkspacePackages) {
    const entry = packageLock.packages[`packages/${directory}`];
    if (!entry || typeof entry !== "object") {
      problems.push(`Root package-lock.json is missing public workspace entry packages/${directory} (${name})`);
    } else if (entry.version !== version) {
      problems.push(
        `Root package-lock.json workspace entry ${name} must be ${version}; found ${String(entry.version)}`,
      );
    }
  }
  return problems;
}

export function validateEcosystemContract(contract = readJson("contracts/ecosystem-release-contract.json")) {
  const problems = [];

  const requireEqual = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      problems.push(`${label}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
    }
  };

  requireEqual("schemaVersion", contract.schemaVersion, 1);
  if (!/^\d{4}-\d{2}-\d{2}\.\d+$/u.test(contract.contractVersion ?? "")) {
    problems.push("contractVersion must be a dated monotonic identifier");
  }
  requireEqual("maturity", contract.maturity, "public-alpha");
  requireEqual("product id", contract.product?.id, "vireo-framework");
  for (const field of ["sourceRepository", "documentation", "support", "security"]) {
    if (!contract.product?.[field]?.startsWith("https://")) problems.push(`product.${field} must be an HTTPS URL`);
  }

  for (const [name, path] of Object.entries(contract.policySources ?? {})) {
    if (!existsSync(join(repositoryRoot, path))) problems.push(`policySources.${name} references missing ${path}`);
  }

  const publicWorkspacePackages = readdirSync(join(repositoryRoot, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(repositoryRoot, "packages", entry.name, "package.json")))
    .map(entry => ({ directory: entry.name, manifest: readJson(`packages/${entry.name}/package.json`) }))
    .filter(({ manifest }) => manifest.private !== true)
    .map(({ directory, manifest }) => ({ directory, name: manifest.name, version: manifest.version }));
  const packageRecords = publicWorkspacePackages.map(({ name, version }) => ({ name, version }));
  const packageLock = readJson("package-lock.json");
  problems.push(...validatePublicWorkspaceLockEntries(packageLock, publicWorkspacePackages));
  const declaredNpm = (contract.current?.npm ?? []).map(({ name, version }) => ({ name, version }));
  requireEqual("current npm artifacts", declaredNpm, packageRecords);
  if (new Set(declaredNpm.map(entry => entry.name)).size !== declaredNpm.length) {
    problems.push("current npm artifacts contain duplicate names");
  }

  const gradleProperties = readFileSync(join(repositoryRoot, "jvm/gradle.properties"), "utf8");
  const gradleVersion = gradleProperties.match(/^version=(.+)$/mu)?.[1];
  const gradleGroup = gradleProperties.match(/^group=(.+)$/mu)?.[1];
  requireEqual("Maven group", contract.current?.maven?.group, gradleGroup);
  requireEqual("Maven version", contract.current?.maven?.version, gradleVersion);

  const publishedModules = readdirSync(join(repositoryRoot, "jvm"), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^vireo-(?:bom|core|auth|query|offline|history)$/u.test(entry.name))
    .map(entry => entry.name)
    .sort();
  requireEqual("published Maven modules", [...(contract.current?.maven?.modules ?? [])].sort(), publishedModules);

  const createSource = readFileSync(join(repositoryRoot, "packages/create-vireo/src/index.ts"), "utf8");
  const templateCommit = createSource.match(/TEMPLATE_COMMIT = "([a-f0-9]{40})"/u)?.[1];
  const createVireoVersion = createSource.match(/CREATE_VIREO_PACKAGE_VERSION = "([^"]+)"/u)?.[1];
  const createVireoManifest = packageRecords.find(manifest => manifest.name === "create-vireo");
  const templateTag = createVireoVersion ? `starter-template@${createVireoVersion}` : undefined;
  const templateReleaseUrl = templateTag
    ? `https://github.com/vireocodedev/starter-template/releases/tag/${encodeURIComponent(templateTag)}`
    : undefined;
  requireEqual("Template commit", contract.current?.template?.commit, templateCommit);
  requireEqual("create-vireo source version", createVireoVersion, createVireoManifest?.version);
  requireEqual("Template version", contract.current?.template?.version, createVireoVersion);
  requireEqual("Template tag", contract.current?.template?.tag, templateTag);
  requireEqual("Template release URL", contract.current?.template?.releaseUrl, templateReleaseUrl);
  if (!/^starter-template@\d+\.\d+\.\d+$/u.test(contract.current?.template?.tag ?? "")) {
    problems.push("Template tag must use starter-template@<semver>");
  }

  const compatibilitySet = contract.compatibility?.sets?.find(
    candidate => candidate.id === contract.compatibility?.defaultSet,
  );
  if (!compatibilitySet) problems.push("compatibility.defaultSet must identify one declared set");
  else {
    requireEqual("compatibility release", compatibilitySet.release, contract.current.id);
    requireEqual(
      "compatibility npm set",
      compatibilitySet.npm,
      Object.fromEntries(declaredNpm.map(entry => [entry.name, entry.version])),
    );
    requireEqual(
      "compatibility Maven BOM",
      compatibilitySet.mavenBom,
      `${contract.current.maven.group}:vireo-bom:${contract.current.maven.version}`,
    );
    requireEqual("compatibility Template version", compatibilitySet.templateVersion, contract.current.template.version);
    requireEqual("compatibility Template tag", compatibilitySet.templateTag, contract.current.template.tag);
    requireEqual("compatibility Template", compatibilitySet.templateCommit, contract.current.template.commit);
    requireEqual(
      "compatibility Template release URL",
      compatibilitySet.templateReleaseUrl,
      contract.current.template.releaseUrl,
    );
  }

  const documentation = readJson(contract.policySources.documentationReleases);
  const documentedCurrent = documentation.releases?.find(release => release.id === documentation.currentRelease);
  requireEqual("documentation release id", documentation.currentRelease, contract.current.id);
  requireEqual(
    "documentation npm artifacts",
    documentedCurrent?.npm,
    declaredNpm.map(entry => ({ package: entry.name, version: entry.version })),
  );
  requireEqual("documentation Maven release", documentedCurrent?.jvm, contract.current.maven);
  problems.push(
    ...validateTemplateCoordinates(
      documentedCurrent?.template,
      {
        repository: contract.current.template.repository,
        version: contract.current.template.version,
        tag: contract.current.template.tag,
        commit: contract.current.template.commit,
        releaseUrl: contract.current.template.releaseUrl,
      },
      "documentation Template",
    ),
  );
  requireEqual(
    "documentation Template release URL",
    documentedCurrent?.releaseLinks?.template,
    contract.current.template.releaseUrl,
  );

  const attestation = readJson(contract.policySources.publicArtifacts);
  problems.push(...validateReleaseSbomPolicy(attestation));
  requireEqual(
    "attested npm names",
    attestation.npm?.packages?.map(entry => entry.name),
    declaredNpm.map(entry => entry.name),
  );
  requireEqual(
    "attested Maven modules",
    attestation.maven?.modules?.map(entry => entry.name).sort(),
    [...contract.current.maven.modules].sort(),
  );
  requireEqual("attested Maven group", attestation.maven?.group, contract.current.maven.group);

  const platform = readJson(contract.policySources.platformSupport);
  requireEqual(
    "Spring Boot toolchain",
    gradleProperties.match(/^springBootVersion=(.+)$/mu)?.[1],
    platform.toolchains?.springBoot,
  );
  const rootManifest = readJson("package.json");
  requireEqual("Node range", rootManifest.engines?.node, platform.toolchains?.node?.range);
  requireEqual("npm version", rootManifest.engines?.npm, platform.toolchains?.npm?.exact);

  for (const [gateName, gate] of Object.entries(contract.gates ?? {})) {
    if (!gate.command || !gate.scope) problems.push(`gate ${gateName} must declare command and scope`);
    if (!gate.execution?.executable || !Array.isArray(gate.execution?.arguments)) {
      problems.push(`gate ${gateName} must declare a shell-free execution`);
    }
    if (!Array.isArray(gate.requiredTools) || gate.requiredTools.length === 0) {
      problems.push(`gate ${gateName} must declare required tools`);
    }
    if (!Array.isArray(gate.evidenceSubjects) || gate.evidenceSubjects.length === 0) {
      problems.push(`gate ${gateName} must declare evidence subjects`);
    }
    for (const lane of gate.hosted ?? []) {
      const workflowPath = join(repositoryRoot, ".github/workflows", lane.workflow);
      if (!existsSync(workflowPath)) {
        problems.push(`gate ${gateName} references missing workflow ${lane.workflow}`);
        continue;
      }
      const workflow = readFileSync(workflowPath, "utf8");
      const escapedJob = lane.job.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      if (!new RegExp(`^ {2}${escapedJob}:\\s*$`, "mu").test(workflow)) {
        problems.push(`gate ${gateName} references missing job ${lane.job} in ${lane.workflow}`);
      }
      if (lane.command && !workflow.includes(lane.command)) {
        problems.push(`gate ${gateName} references missing command ${lane.command} in ${lane.workflow}`);
      }
    }
  }

  if (!contract.supportLines?.some(line => line.status === "active" && line.release === contract.current.id)) {
    problems.push("one active support line must point at the current release");
  }
  if (contract.evidence?.publicBetaStatus !== "hold") {
    problems.push("public beta must remain HOLD until the external evidence contract passes");
  }

  return {
    problems,
    summary: `Ecosystem release contract passed: ${declaredNpm.length} npm artifacts, ${publishedModules.length} Maven artifacts, Template ${String(templateCommit ?? "missing").slice(0, 12)}, and ${Object.keys(contract.gates ?? {}).length} gates.`,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contractPath = process.argv[2];
  if (process.argv.length > 3) {
    console.error("Usage: node scripts/ecosystem-contract-policy.mjs [contract.json]");
    process.exit(2);
  }
  const contract = contractPath ? JSON.parse(readFileSync(resolve(contractPath), "utf8")) : undefined;
  const result = validateEcosystemContract(contract);
  if (result.problems.length > 0) {
    console.error("Ecosystem release contract failed:");
    for (const problem of result.problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(result.summary);
}
