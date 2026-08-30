import { randomBytes } from "node:crypto";
import { readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGeneratedEntities } from "./entity-generator.js";

type DependencyMap = Record<string, string>;
type ReleaseRequirements = {
  rootVireoScript: string;
  starterJvmVersion: string;
  frontendDependencies: DependencyMap;
};
type ApplicationOwnedActionPolicy = {
  id: string;
  paths: string[];
  requirement: string;
  verificationCommands: string[];
};
type SourceRelease = ReleaseRequirements & {
  release: string;
  templateCommit: string;
  applicationOwnedActions: ApplicationOwnedActionPolicy[];
};
type UpgradePolicy = {
  schemaVersion: number;
  targetRelease: string;
  targetTemplateCommit: string;
  target: ReleaseRequirements;
  supportedSources: SourceRelease[];
};
type ProjectMetadata = Record<string, unknown> & {
  templateCommit?: unknown;
  createdBy?: unknown;
  lastUpgradedBy?: unknown;
  lastUpgrade?: unknown;
};
type PackageManifest = Record<string, unknown> & {
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
};
type PackageLock = Record<string, unknown> & {
  packages?: Record<string, { dependencies?: Record<string, unknown> }>;
};

export type VireoUpgradeOptions = {
  projectDirectory: string;
  targetRelease: string;
  dryRun?: boolean;
  acceptApplicationOwned?: boolean;
};
export type VireoUpgradeCheck = {
  id: "source" | "dependencies" | "lockfile" | "migrations" | "generated-contracts" | "application-owned";
  status: "pass" | "manual";
  detail: string;
};
export type VireoUpgradeFile = {
  path: string;
  status: "create" | "update" | "unchanged";
};
export type VireoUpgradeManualAction = ApplicationOwnedActionPolicy & { status: "pending" };
export type VireoUpgradeResult = {
  sourceRelease: string;
  targetRelease: string;
  targetTemplateCommit: string;
  dryRun: boolean;
  checks: VireoUpgradeCheck[];
  files: VireoUpgradeFile[];
  manualActions: VireoUpgradeManualAction[];
};

export class VireoUpgradeError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "VireoUpgradeError";
  }
}

export function formatVireoUpgradeText(result: VireoUpgradeResult) {
  return [
    `${result.dryRun ? "Validated" : "Managed Vireo migration applied"} ${result.sourceRelease} -> ${result.targetRelease}.`,
    ...result.checks.map(check => `${check.status.toUpperCase().padEnd(6)} ${check.id}: ${check.detail}`),
    ...result.files.map(file => `${file.status.padEnd(10)} ${file.path}`),
    "Application-owned actions remain pending:",
    ...result.manualActions.flatMap(action => [
      `  [${action.status.toUpperCase()}] ${action.id}`,
      `    Requirement: ${action.requirement}`,
      `    Affected paths: ${action.paths.join(", ")}`,
      ...action.verificationCommands.map(command => `    Verify: ${command}`),
    ]),
    result.dryRun
      ? "No files were written; application-owned actions remain pending."
      : "Managed migration applied; application-owned actions remain pending before this upgrade is complete.",
  ];
}

const policyUrl = new URL("../schema/vireo-upgrade-policy.json", import.meta.url);
const managedSurfaces = [
  "package.json#scripts.vireo",
  "frontend/package.json#dependencies",
  'frontend/package-lock.json#packages[""].dependencies',
  "gradle.properties#starterVersion",
  ".vireo/project.json#templateCommit,lastUpgradedBy,lastUpgrade",
] as const;
const expectedApplicationOwnedActionIds = [
  "navigation-landmark-and-links",
  "responsive-table-live-announcements",
  "accessible-name-contracts",
  "surface-palette-ownership",
  "full-frontend-verification",
] as const;

async function readJson<T>(path: string): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    throw new VireoUpgradeError(
      "VIR-UPG-001",
      `Cannot read required JSON ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function readPolicy(): Promise<UpgradePolicy> {
  const policy = await readJson<UpgradePolicy>(fileURLToPath(policyUrl));
  if (policy.schemaVersion !== 1) throw new VireoUpgradeError("VIR-UPG-001", "Unsupported upgrade-policy schema.");
  for (const source of policy.supportedSources) validateApplicationOwnedActions(source.applicationOwnedActions);
  return policy;
}

export function validateApplicationOwnedActions(actions: unknown): asserts actions is ApplicationOwnedActionPolicy[] {
  if (!Array.isArray(actions) || actions.length !== expectedApplicationOwnedActionIds.length)
    throw new VireoUpgradeError(
      "VIR-UPG-001",
      "Upgrade policy must declare every application-owned action exactly once.",
    );
  const seen = new Set<string>();
  for (const action of actions) {
    if (!action || typeof action !== "object")
      throw new VireoUpgradeError("VIR-UPG-001", "Upgrade policy application-owned actions must be objects.");
    const value = action as Partial<ApplicationOwnedActionPolicy>;
    if (
      typeof value.id !== "string" ||
      !expectedApplicationOwnedActionIds.includes(value.id as never) ||
      seen.has(value.id)
    )
      throw new VireoUpgradeError(
        "VIR-UPG-001",
        "Upgrade policy application-owned action IDs must be unique and supported.",
      );
    seen.add(value.id);
    if (
      !Array.isArray(value.paths) ||
      value.paths.length === 0 ||
      value.paths.some(path => typeof path !== "string" || path.trim() === "") ||
      typeof value.requirement !== "string" ||
      value.requirement.trim() === "" ||
      !Array.isArray(value.verificationCommands) ||
      value.verificationCommands.length === 0 ||
      value.verificationCommands.some(command => typeof command !== "string" || command.trim() === "")
    )
      throw new VireoUpgradeError(
        "VIR-UPG-001",
        "Upgrade policy application-owned action details must be non-empty strings.",
      );
  }
  for (const id of expectedApplicationOwnedActionIds) {
    if (!seen.has(id))
      throw new VireoUpgradeError("VIR-UPG-001", `Upgrade policy is missing application-owned action ${id}.`);
  }
}

function releaseFrom(value: unknown) {
  const match = typeof value === "string" ? /^create-vireo@(\d+\.\d+\.\d+)$/u.exec(value) : undefined;
  return match?.[1];
}

function assertEqual(actual: unknown, expected: unknown, surface: string, code = "VIR-UPG-003") {
  if (actual !== expected)
    throw new VireoUpgradeError(
      code,
      `${surface} is ${JSON.stringify(actual)}; the supported source requires ${JSON.stringify(expected)}. Resolve or document this application-owned difference before upgrading.`,
    );
}

async function migrationVersions(projectDirectory: string) {
  const directory = join(projectDirectory, "src/main/resources/db/migration");
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const versions = new Map<string, string>();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.startsWith("V")) continue;
    const match = /^V([0-9]+(?:[._][0-9]+)*)__.+\.sql$/u.exec(entry.name);
    if (!match)
      throw new VireoUpgradeError("VIR-UPG-005", `Versioned migration has an unsupported filename: ${entry.name}`);
    const version = match[1].replaceAll("_", ".");
    const duplicate = versions.get(version);
    if (duplicate)
      throw new VireoUpgradeError(
        "VIR-UPG-005",
        `Duplicate Flyway version ${version}: ${duplicate} and ${entry.name}.`,
      );
    versions.set(version, entry.name);
  }
  return [...versions.values()].sort();
}

async function writeAtomically(changes: Array<{ path: string; contents: string; previous?: string }>) {
  const suffix = randomBytes(6).toString("hex");
  const staged = changes.map(change => ({ ...change, temporary: `${change.path}.vireo-${suffix}.tmp` }));
  try {
    for (const change of staged) await writeFile(change.temporary, change.contents);
    for (const change of staged) await rename(change.temporary, change.path);
  } catch (error) {
    for (const change of staged) {
      await rm(change.temporary, { force: true });
      if (change.previous === undefined) await rm(change.path, { force: true });
      else await writeFile(change.path, change.previous);
    }
    throw error;
  }
}

export async function upgradeVireoProject(options: VireoUpgradeOptions): Promise<VireoUpgradeResult> {
  const projectDirectory = resolve(options.projectDirectory);
  const policy = await readPolicy();
  if (options.targetRelease !== policy.targetRelease)
    throw new VireoUpgradeError(
      "VIR-UPG-002",
      `This CLI supports target ${policy.targetRelease}; requested ${options.targetRelease}. Install the requested target CLI explicitly.`,
    );

  const metadataPath = join(projectDirectory, ".vireo/project.json");
  const rootManifestPath = join(projectDirectory, "package.json");
  const frontendManifestPath = join(projectDirectory, "frontend/package.json");
  const frontendLockPath = join(projectDirectory, "frontend/package-lock.json");
  const gradlePropertiesPath = join(projectDirectory, "gradle.properties");
  const [metadataText, rootManifestText, frontendManifestText, frontendLockText, gradleProperties] = await Promise.all([
    readFile(metadataPath, "utf8"),
    readFile(rootManifestPath, "utf8"),
    readFile(frontendManifestPath, "utf8"),
    readFile(frontendLockPath, "utf8"),
    readFile(gradlePropertiesPath, "utf8"),
  ]).catch(error => {
    throw new VireoUpgradeError(
      "VIR-UPG-001",
      `Project is missing required upgrade input: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
  const metadata = JSON.parse(metadataText) as ProjectMetadata;
  const rootManifest = JSON.parse(rootManifestText) as PackageManifest;
  const frontendManifest = JSON.parse(frontendManifestText) as PackageManifest;
  const frontendLock = JSON.parse(frontendLockText) as PackageLock;
  const recordedRelease = releaseFrom(metadata.lastUpgradedBy) ?? releaseFrom(metadata.createdBy);
  if (!recordedRelease)
    throw new VireoUpgradeError("VIR-UPG-002", ".vireo/project.json has no recognized create-vireo release.");
  const alreadyTarget = recordedRelease === policy.targetRelease;
  const source = policy.supportedSources.find(candidate => candidate.release === recordedRelease);
  if (!source && !alreadyTarget)
    throw new VireoUpgradeError(
      "VIR-UPG-002",
      `Release ${recordedRelease} is not a supported source for ${policy.targetRelease}.`,
    );
  const expected = alreadyTarget ? policy.target : source!;
  if (!alreadyTarget)
    assertEqual(metadata.templateCommit, source!.templateCommit, "source Template commit", "VIR-UPG-002");
  else assertEqual(metadata.templateCommit, policy.targetTemplateCommit, "target Template commit", "VIR-UPG-002");
  assertEqual(rootManifest.scripts?.vireo, expected.rootVireoScript, "package.json scripts.vireo");
  const starterVersion = /^starterVersion=(.+)$/mu.exec(gradleProperties)?.[1];
  assertEqual(starterVersion, expected.starterJvmVersion, "gradle.properties starterVersion");
  for (const [name, version] of Object.entries(expected.frontendDependencies)) {
    assertEqual(frontendManifest.dependencies?.[name], version, `frontend dependency ${name}`);
    assertEqual(
      frontendLock.packages?.[""]?.dependencies?.[name],
      version,
      `frontend lockfile declaration ${name}`,
      "VIR-UPG-004",
    );
  }

  const migrations = await migrationVersions(projectDirectory);
  const generated = await checkGeneratedEntities(projectDirectory);
  const generatedProblems = generated.flatMap(result => result.problems.map(problem => `${result.entity}: ${problem}`));
  if (generatedProblems.length > 0)
    throw new VireoUpgradeError("VIR-UPG-006", `Generated/wire-contract drift: ${generatedProblems.join("; ")}`);

  const targetRootManifest = structuredClone(rootManifest);
  targetRootManifest.scripts = {
    ...targetRootManifest.scripts,
    vireo: policy.target.rootVireoScript,
  };
  const targetFrontendManifest = structuredClone(frontendManifest);
  targetFrontendManifest.dependencies = {
    ...targetFrontendManifest.dependencies,
    ...policy.target.frontendDependencies,
  };
  const targetFrontendLock = structuredClone(frontendLock);
  targetFrontendLock.packages = {
    ...targetFrontendLock.packages,
    "": {
      ...targetFrontendLock.packages?.[""],
      dependencies: {
        ...targetFrontendLock.packages?.[""]?.dependencies,
        ...policy.target.frontendDependencies,
      },
    },
  };
  const targetGradleProperties = gradleProperties.replace(
    /^starterVersion=.+$/mu,
    `starterVersion=${policy.target.starterJvmVersion}`,
  );
  const targetMetadata = structuredClone(metadata);
  targetMetadata.templateCommit = policy.targetTemplateCommit;
  targetMetadata.lastUpgradedBy = `create-vireo@${policy.targetRelease}`;
  if (!alreadyTarget)
    targetMetadata.lastUpgrade = {
      schemaVersion: 1,
      from: recordedRelease,
      to: policy.targetRelease,
      sourceTemplateCommit: metadata.templateCommit,
      targetTemplateCommit: policy.targetTemplateCommit,
      applicationOwnedTemplateChanges: "manual-review-required",
    };
  const previousUpgrade =
    metadata.lastUpgrade && typeof metadata.lastUpgrade === "object"
      ? (metadata.lastUpgrade as Record<string, unknown>)
      : undefined;
  const originalSourceRelease = alreadyTarget ? previousUpgrade?.from : recordedRelease;
  if (typeof originalSourceRelease !== "string")
    throw new VireoUpgradeError("VIR-UPG-002", "Target-version metadata is missing its source release record.");
  const originalSourceTemplateCommit =
    alreadyTarget && typeof previousUpgrade?.sourceTemplateCommit === "string"
      ? previousUpgrade.sourceTemplateCommit
      : metadata.templateCommit;
  if (typeof originalSourceTemplateCommit !== "string")
    throw new VireoUpgradeError("VIR-UPG-002", "Target-version metadata is missing its source Template commit record.");
  const originalSource = policy.supportedSources.find(candidate => candidate.release === originalSourceRelease);
  if (!originalSource)
    throw new VireoUpgradeError(
      "VIR-UPG-002",
      `Release ${originalSourceRelease} has no application-owned action policy for ${policy.targetRelease}.`,
    );
  const manualActions = originalSource.applicationOwnedActions.map(action => ({
    ...action,
    status: "pending" as const,
  }));
  const recordPath = join(
    projectDirectory,
    ".vireo",
    `upgrade-${originalSourceRelease}-to-${policy.targetRelease}.json`,
  );
  const record = {
    schemaVersion: 1,
    from: originalSourceRelease,
    to: policy.targetRelease,
    sourceTemplateCommit: originalSourceTemplateCommit,
    targetTemplateCommit: policy.targetTemplateCommit,
    managedSurfaces,
    applicationOwnedTemplateChanges: "manual-review-required",
    applicationOwnedActions: manualActions,
  };
  const recordContents = `${JSON.stringify(record, null, 2)}\n`;
  let priorRecord: string | undefined;
  try {
    priorRecord = await readFile(recordPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (priorRecord !== undefined && priorRecord !== recordContents)
    throw new VireoUpgradeError(
      "VIR-UPG-003",
      `Existing upgrade record does not match the supported release pair: ${recordPath}`,
    );
  const changes: Array<{ path: string; contents: string; previous?: string }> = [
    {
      path: rootManifestPath,
      contents: `${JSON.stringify(targetRootManifest, null, 2)}\n`,
      previous: rootManifestText,
    },
    {
      path: frontendManifestPath,
      contents: `${JSON.stringify(targetFrontendManifest, null, 2)}\n`,
      previous: frontendManifestText,
    },
    {
      path: frontendLockPath,
      contents: `${JSON.stringify(targetFrontendLock, null, 2)}\n`,
      previous: frontendLockText,
    },
    { path: gradlePropertiesPath, contents: targetGradleProperties, previous: gradleProperties },
    { path: metadataPath, contents: `${JSON.stringify(targetMetadata, null, 2)}\n`, previous: metadataText },
    { path: recordPath, contents: recordContents, previous: priorRecord },
  ];
  const files: VireoUpgradeFile[] = await Promise.all(
    changes.map(async change => {
      let current: string | undefined;
      try {
        current = await readFile(change.path, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      return {
        path: change.path.slice(projectDirectory.length + 1),
        status: current === change.contents ? "unchanged" : current === undefined ? "create" : "update",
      };
    }),
  );
  const checks: VireoUpgradeCheck[] = [
    { id: "source", status: "pass", detail: `${recordedRelease} is admitted for target ${policy.targetRelease}.` },
    {
      id: "dependencies",
      status: "pass",
      detail: "Vireo npm declarations and JVM BOM version match the release pair.",
    },
    { id: "lockfile", status: "pass", detail: "Frontend lockfile root declarations match package.json." },
    {
      id: "migrations",
      status: "pass",
      detail: `${migrations.length} application Flyway migration version(s) are unique.`,
    },
    {
      id: "generated-contracts",
      status: "pass",
      detail: `${generated.length} managed generated capability contract(s) have no drift.`,
    },
    {
      id: "application-owned",
      status: "manual",
      detail: `${manualActions.length} application-owned action(s) remain pending for Template ${policy.targetTemplateCommit}.`,
    },
  ];
  const dryRun = options.dryRun ?? true;
  if (!dryRun) {
    if (!options.acceptApplicationOwned)
      throw new VireoUpgradeError(
        "VIR-UPG-007",
        "Apply requires --accept-application-owned after reviewing the target Template diff and rollback plan.",
      );
    await writeAtomically(changes.filter((_, index) => files[index].status !== "unchanged"));
  }
  return {
    sourceRelease: originalSourceRelease,
    targetRelease: policy.targetRelease,
    targetTemplateCommit: policy.targetTemplateCommit,
    dryRun,
    checks,
    files,
    manualActions,
  };
}
