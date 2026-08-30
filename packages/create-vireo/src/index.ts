import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { chmod, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { gunzipSync } from "node:zlib";
import { format, resolveConfig } from "prettier";
import { writeExampleManifest } from "./remove-example.js";

export {
  checkGeneratedEntities,
  ejectEntity,
  generateEntity,
  readProjectMetadata,
  sha256,
  stableJson,
  VIREO_GENERATOR_VERSION,
  VireoGeneratorError,
  type EntityGenerationFileResult,
  type EntityGenerationManifest,
  type GenerateEntityOptions,
  type GenerateEntityResult,
  type GeneratedContractCheck,
} from "./entity-generator.js";
export {
  EntitySchemaError,
  parseEntitySchema,
  readEntitySchema,
  VIREO_ENTITY_SCHEMA_VERSION,
  type EntityFieldSchema,
  type EntityFieldType,
  type EntityRelationshipSchema,
  type VireoEntitySchema,
} from "./entity-schema.js";
export {
  createWireContract,
  entityNames,
  type EntityNames,
  type VireoGenerationTarget,
  type WireContract,
} from "./entity-renderer.js";
export {
  upgradeVireoProject,
  VireoUpgradeError,
  type VireoUpgradeCheck,
  type VireoUpgradeFile,
  type VireoUpgradeOptions,
  type VireoUpgradeResult,
} from "./project-upgrade.js";
export {
  findExampleReferences,
  removeExample,
  type RemoveExampleFile,
  type RemoveExampleResult,
} from "./remove-example.js";

export const TEMPLATE_COMMIT = "11e1795a798d5dbaee9344b8ff207d5b0ea59657";
export const TEMPLATE_ARCHIVE_URL = `https://codeload.github.com/vireocodedev/starter-template/tar.gz/${TEMPLATE_COMMIT}`;

export type VireoDatabase = "postgresql" | "h2";
export type VireoPackageManager = "npm";
export type VireoProfile = "full-stack" | "frontend";
export type CreateVireoOptions = {
  directory: string;
  profile?: VireoProfile;
  projectName?: string;
  javaPackage?: string;
  database?: VireoDatabase;
  packageManager?: VireoPackageManager;
  git?: boolean;
  dryRun?: boolean;
  templateDirectory?: string;
};
export type CreateVireoResult = {
  directory: string;
  projectName: string;
  profile: VireoProfile;
  javaPackage?: string;
  database?: VireoDatabase;
  packageManager: VireoPackageManager;
  gitInitialized: boolean;
  templateCommit: string;
  dryRun: boolean;
};

function assertProjectName(name: string) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(name))
    throw new Error("Project name must be lowercase kebab-case (for example `my-app`).");
}

function assertJavaPackage(value: string) {
  if (!/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/u.test(value))
    throw new Error("Java package must contain at least two lowercase dot-separated identifiers.");
}

function javaSuffix(name: string) {
  return name
    .split("-")
    .map(part => part.replace(/[^a-z0-9_]/gu, ""))
    .join("");
}

function displayName(name: string) {
  return name
    .split("-")
    .map(part => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function safeArchivePath(value: string) {
  const normalized = value.replaceAll("\\", "/");
  if (!normalized || isAbsolute(normalized) || normalized.split("/").includes(".."))
    throw new Error(`Unsafe Template archive path: ${value}`);
  return normalized;
}

async function extractTarGzip(archive: Uint8Array, destination: string) {
  const tar = gunzipSync(archive);
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const field = (start: number, length: number) =>
      header
        .subarray(start, start + length)
        .toString("utf8")
        .replace(/\0.*$/su, "");
    const name = safeArchivePath(`${field(345, 155) ? `${field(345, 155)}/` : ""}${field(0, 100)}`);
    const stripped = name.split("/").slice(1).join("/");
    const size = Number.parseInt(field(124, 12).trim() || "0", 8);
    const mode = Number.parseInt(field(100, 8).trim() || "644", 8);
    const type = field(156, 1) || "0";
    offset += 512;
    if (stripped) {
      const target = resolve(destination, stripped);
      if (relative(destination, target).startsWith(`..${sep}`))
        throw new Error(`Template archive escaped its destination: ${name}`);
      if (type === "5") await mkdir(target, { recursive: true });
      else if (type === "0") {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, tar.subarray(offset, offset + size));
        await chmod(target, mode & 0o777);
      } else if (type === "1" || type === "2")
        throw new Error(`Template archive contains an unsupported link: ${name}`);
    }
    offset += Math.ceil(size / 512) * 512;
  }
}

async function downloadTemplate(destination: string) {
  const response = await fetch(TEMPLATE_ARCHIVE_URL, { headers: { "user-agent": "create-vireo" } });
  if (!response.ok) throw new Error(`Could not download the pinned Vireo Template (HTTP ${response.status}).`);
  await extractTarGzip(new Uint8Array(await response.arrayBuffer()), destination);
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async entry => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : [path];
      }),
    )
  ).flat();
}

async function replaceTextFiles(root: string, replacements: Array<[string, string]>) {
  for (const file of await walk(root)) {
    const contents = await readFile(file);
    if (contents.includes(0)) continue;
    let text = contents.toString("utf8");
    for (const [before, after] of replacements) text = text.replaceAll(before, after);
    await writeFile(file, text);
  }
}

async function replaceTextFile(path: string, replacements: Array<[string, string]>) {
  let text = await readFile(path, "utf8");
  for (const [before, after] of replacements) text = text.replaceAll(before, after);
  await writeFile(path, text);
}

async function renameJavaPackage(root: string, javaPackage: string) {
  for (const sourceSet of ["main", "test"]) {
    const source = join(root, "src", sourceSet, "java", "com", "vireocode", "startertemplate");
    try {
      if (!(await stat(source)).isDirectory()) continue;
    } catch {
      continue;
    }
    const destination = join(root, "src", sourceSet, "java", ...javaPackage.split("."));
    await mkdir(dirname(destination), { recursive: true });
    await rename(source, destination);
  }
}

const FRONTEND_VERIFY_SCRIPT = `#!/usr/bin/env bash

set -euo pipefail

steps=(
  "Published package boundary|corepack npm run starter:boundary:check"
  "Architecture|corepack npm run architecture:check"
  "Formatting|corepack npm run format:check"
  "Lint|corepack npm run lint"
  "Types|corepack npm run typecheck"
  "Tests|corepack npm run test"
  "Application build|corepack npm run build"
)

for step in "\${steps[@]}"; do
  label=\${step%%|*}
  command=\${step#*|}
  printf '%s...\\n' "$label"
  bash -lc "$command"
done

printf 'Frontend-only verification passed: %d/%d steps.\\n' "\${#steps[@]}" "\${#steps[@]}"
`;

const FRONTEND_DOCTOR_SCRIPT = `import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const results = [];
const add = (code, status, summary, remedy) =>
  results.push({ code, status, summary, ...(remedy ? { remedy } : {}) });

const nodeMajor = Number(process.versions.node.split(".")[0]);
add(
  "VIR-ENV-001",
  nodeMajor === 24 ? "pass" : "fail",
  \`Node \${process.versions.node}\`,
  "Install Node 24.15 or newer, but below 25.",
);

const osRelease = existsSync("/etc/os-release") ? readFileSync("/etc/os-release", "utf8") : "";
const kernelRelease = existsSync("/proc/sys/kernel/osrelease")
  ? readFileSync("/proc/sys/kernel/osrelease", "utf8")
  : "";
const ubuntu2404 = /^ID=ubuntu$/mu.test(osRelease) && /^VERSION_ID="?24\\.04"?$/mu.test(osRelease);
const wsl = /microsoft/iu.test(kernelRelease);
const commandIsGnu = executable => {
  const completed = spawnSync(executable, ["--version"], { encoding: "utf8" });
  return completed.status === 0 && /GNU/iu.test(\`\${completed.stdout ?? ""}\\n\${completed.stderr ?? ""}\`);
};
const supportedHost = process.platform === "linux" && process.arch === "x64" && ubuntu2404 && !wsl;
const verificationTools = commandIsGnu("/usr/bin/time") && commandIsGnu("date");
add(
  "VIR-VERIFY-001",
  supportedHost && verificationTools ? "pass" : supportedHost ? "fail" : "warn",
  supportedHost && verificationTools
    ? "Authoritative verification host: Ubuntu 24.04 x86-64 with GNU time/date"
    : supportedHost
      ? "Ubuntu 24.04 x86-64 is missing GNU time or GNU date"
      : (wsl ? "Windows/WSL2" : process.platform + "/" + process.arch) +
        " is outside the supported local verification host",
  supportedHost
    ? "Install GNU time and coreutils before running corepack npm run verify."
    : "Use Ubuntu 24.04 x86-64 for release evidence; this host remains untested until an automated support lane exists.",
);

let metadata;
try {
  metadata = JSON.parse(readFileSync(resolve(root, ".vireo/project.json"), "utf8"));
  add(
    "VIR-PROJECT-001",
    metadata.profile === "frontend" ? "pass" : "fail",
    \`Vireo profile: \${metadata.profile ?? "missing"}\`,
    "Restore frontend profile metadata.",
  );
} catch {
  add("VIR-PROJECT-001", "fail", "Project metadata is missing or invalid", "Restore .vireo/project.json.");
}

add(
  "VIR-DEPS-001",
  existsSync(resolve(root, "node_modules")) ? "pass" : "fail",
  "Frontend dependency installation",
  "Run corepack npm run setup.",
);
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const vireoVersions = Object.entries(packageJson.dependencies ?? {})
  .filter(([name]) => name.startsWith("@vireocodedev/"))
  .map(([, version]) => version);
add(
  "VIR-DEPS-002",
  vireoVersions.length > 0 && new Set(vireoVersions).size <= 2 ? "pass" : "fail",
  "Vireo package compatibility",
  "Use the versions generated by the pinned Template.",
);

const environment = existsSync(resolve(root, ".env.development"))
  ? readFileSync(resolve(root, ".env.development"), "utf8")
  : "";
add(
  "VIR-API-001",
  /VITE_API_MODE=(?:mock|http)/u.test(environment) ? "pass" : "warn",
  "Frontend API mode is explicit",
  "Declare VITE_API_MODE=mock or http.",
);

const portAvailable = await new Promise(resolveCheck => {
  const socket = createConnection({ host: "127.0.0.1", port: 3000 });
  socket.unref();
  socket.setTimeout(500);
  socket.once("connect", () => {
    socket.destroy();
    resolveCheck(false);
  });
  socket.once("error", () => resolveCheck(true));
  socket.once("timeout", () => {
    socket.destroy();
    resolveCheck(true);
  });
});
add(
  "VIR-PORT-002",
  portAvailable ? "pass" : "fail",
  "Frontend port 3000 availability",
  "Stop the process using port 3000.",
);

for (const result of results)
  console.log(
    \`\${result.status === "pass" ? "✓" : result.status === "warn" ? "!" : "✗"} \${result.code} \${result.summary}\`,
  );
const ok = results.every(result => result.status !== "fail");
const warnings = results.some(result => result.status === "warn");
console.log(
  ok
    ? warnings
      ? "Frontend profile is ready for development with unverified platform warnings."
      : "Frontend profile is ready."
    : "Resolve the failed checks and rerun the doctor.",
);
if (!ok) process.exitCode = 1;
`;

async function projectFrontendTemplate(staging: string, projectName: string, productName: string) {
  const frontendSource = join(staging, "frontend");
  const projection = `${staging}-frontend`;
  const excluded = new Set(["dist", "node_modules", "storybook-static", "test-results", "tests/demo", "tests/e2e"]);
  try {
    await cp(frontendSource, projection, {
      recursive: true,
      filter: source => {
        const path = relative(frontendSource, source).replaceAll("\\", "/");
        return ![...excluded].some(entry => path === entry || path.startsWith(`${entry}/`));
      },
    });
    for (const file of ["LICENSE", "SECURITY.md", "SUPPORT.md"]) {
      try {
        await cp(join(staging, file), join(projection, file));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    try {
      await mkdir(join(projection, ".vireo", "examples"), { recursive: true });
      await cp(join(staging, ".vireo", "examples"), join(projection, ".vireo", "examples"), { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    const packagePath = join(projection, "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as Record<string, unknown> & {
      scripts: Record<string, string>;
    };
    packageJson.name = projectName;
    packageJson.scripts = {
      setup: "corepack npm ci",
      doctor: "node scripts/vireo-frontend-doctor.mjs",
      dev: packageJson.scripts.dev,
      build: packageJson.scripts.build,
      typecheck: packageJson.scripts.typecheck,
      lint: packageJson.scripts.lint,
      format: packageJson.scripts.format,
      "format:check": packageJson.scripts["format:check"],
      test: packageJson.scripts.test,
      "test:storybook": packageJson.scripts["test:storybook"],
      storybook: packageJson.scripts.storybook,
      "build-storybook": packageJson.scripts["build-storybook"],
      "starter:mode:published": packageJson.scripts["starter:mode:published"],
      "starter:boundary:check": packageJson.scripts["starter:boundary:check"],
      "architecture:check": packageJson.scripts["architecture:check"],
      "bundle:check": packageJson.scripts["bundle:check"],
      preview: packageJson.scripts.preview,
      vireo: "npx --yes --package=create-vireo@0.5.0 vireo",
      "generate:check": "corepack npm run vireo -- check",
      verify: "bash scripts/verify-frontend-profile.sh",
    };
    await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const lockPath = join(projection, "package-lock.json");
    const lock = JSON.parse(await readFile(lockPath, "utf8")) as {
      name?: string;
      packages?: Record<string, { name?: string }>;
    };
    lock.name = projectName;
    if (lock.packages?.[""]) lock.packages[""].name = projectName;
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

    await writeFile(
      join(projection, "README.md"),
      `# ${productName}\n\nA standalone Vireo frontend. It runs without Java or a database by default through application-owned mock adapters.\n\nThe authoritative local verification host is Ubuntu 24.04 x86-64 with GNU time/coreutils. Other Linux releases, macOS, Windows/WSL2, and ARM64 may work for development but remain untested; Doctor reports this boundary.\n\n\`\`\`bash\ncorepack npm run setup\ncorepack npm run doctor\ncorepack npm run dev\n\`\`\`\n\nSign in with \`demo\` / \`demo123\`. Replace the adapters exported from \`src/app/adapters/public.ts\` when connecting the company API. See \`docs/architecture/frontend-only-adoption.md\`.\n`,
    );
    await writeFile(
      join(projection, ".env.development"),
      `VITE_API_MODE=mock\nVITE_API_BASE_URL=/api\nVITE_APP_NAME=${productName}\n`,
    );
    await writeFile(join(projection, "scripts", "verify-frontend-profile.sh"), FRONTEND_VERIFY_SCRIPT);
    await chmod(join(projection, "scripts", "verify-frontend-profile.sh"), 0o755);
    const doctorPath = join(projection, "scripts", "vireo-frontend-doctor.mjs");
    const doctorConfig = (await resolveConfig(doctorPath)) ?? {};
    await writeFile(doctorPath, await format(FRONTEND_DOCTOR_SCRIPT, { ...doctorConfig, filepath: doctorPath }));

    await rm(staging, { recursive: true, force: true });
    await rename(projection, staging);
  } catch (error) {
    await rm(projection, { recursive: true, force: true });
    throw error;
  }
}

async function pinGeneratedProjectCli(staging: string) {
  const packagePath = join(staging, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!packageJson.scripts) throw new Error("The pinned Template package.json does not declare scripts.");
  packageJson.scripts.vireo = "npx --yes --package=create-vireo@0.5.0 vireo";
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

export async function createVireo(options: CreateVireoOptions): Promise<CreateVireoResult> {
  const directory = resolve(options.directory);
  const projectName = options.projectName ?? basename(directory);
  const profile = options.profile ?? "full-stack";
  const javaPackage = options.javaPackage ?? `com.example.${javaSuffix(projectName)}`;
  const database = options.database ?? "postgresql";
  const packageManager = options.packageManager ?? "npm";
  assertProjectName(projectName);
  if (profile === "full-stack") assertJavaPackage(javaPackage);
  if (profile !== "full-stack" && profile !== "frontend")
    throw new Error("Profile must be `full-stack` or `frontend`.");
  if (profile === "frontend" && (options.javaPackage !== undefined || options.database !== undefined))
    throw new Error("The frontend profile does not accept Java package or database options.");
  if (!(["postgresql", "h2"] as string[]).includes(database)) throw new Error("Database must be `postgresql` or `h2`.");
  if (packageManager !== "npm") throw new Error("Phase 2 supports npm as the canonical package manager.");
  try {
    await stat(directory);
    throw new Error(`Target already exists: ${directory}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const result: CreateVireoResult = {
    directory,
    projectName,
    profile,
    ...(profile === "full-stack" ? { javaPackage, database } : {}),
    packageManager,
    gitInitialized: false,
    templateCommit: TEMPLATE_COMMIT,
    dryRun: options.dryRun ?? false,
  };
  if (options.dryRun) return result;

  await mkdir(dirname(directory), { recursive: true });
  const staging = join(dirname(directory), `.${basename(directory)}.vireo-${randomBytes(6).toString("hex")}`);
  try {
    await mkdir(staging);
    if (options.templateDirectory) await cp(resolve(options.templateDirectory), staging, { recursive: true });
    else await downloadTemplate(staging);
    await replaceTextFiles(staging, [
      ["com.vireocode.startertemplate", javaPackage],
      ["starter_template", projectName.replaceAll("-", "_")],
      ["starter-template-frontend", `${projectName}-frontend`],
      ["starter-template", projectName],
    ]);
    const productName = displayName(projectName);
    await replaceTextFile(join(staging, "README.md"), [["# Vireo Starter Template", `# ${productName}`]]);
    await replaceTextFile(join(staging, "frontend", "vite.config.ts"), [
      ['name: "Vireo Starter App"', `name: "${productName}"`],
      ['short_name: "Vireo"', `short_name: "${productName}"`],
    ]);
    for (const locale of ["app.en.ts", "app.hr.ts"]) {
      await replaceTextFile(join(staging, "frontend", "src", "app", "ui", "localization", "resources", locale), [
        ['name: "Vireo Starter"', `name: "${productName}"`],
      ]);
    }
    await renameJavaPackage(staging, javaPackage);
    if (profile === "frontend") await projectFrontendTemplate(staging, projectName, productName);
    else await pinGeneratedProjectCli(staging);
    await rm(join(staging, ".vireo", "template.json"), { force: true });
    await mkdir(join(staging, ".vireo"), { recursive: true });
    await writeFile(
      join(staging, ".vireo", "project.json"),
      `${JSON.stringify({ schemaVersion: 1, profile, projectName, ...(profile === "full-stack" ? { javaPackage, database, databaseName: projectName.replaceAll("-", "_") } : {}), packageManager, templateCommit: TEMPLATE_COMMIT, createdBy: "create-vireo@0.5.0" }, null, 2)}\n`,
    );
    await writeExampleManifest(staging, TEMPLATE_COMMIT, profile);
    if (options.git !== false) {
      const initialized = spawnSync("git", ["init", "--quiet"], { cwd: staging });
      if (initialized.status !== 0) throw new Error("Git initialization failed. Retry with `--no-git` or install Git.");
      result.gitInitialized = true;
    }
    await rename(staging, directory);
    return result;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}
