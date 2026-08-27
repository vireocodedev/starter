import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { chmod, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { gunzipSync } from "node:zlib";

export const TEMPLATE_COMMIT = "9c77b6e1a2b456cb4250f434655e60170b286e05";
export const TEMPLATE_ARCHIVE_URL = `https://codeload.github.com/vireocodedev/starter-template/tar.gz/${TEMPLATE_COMMIT}`;

export type VireoDatabase = "postgresql" | "h2";
export type VireoPackageManager = "npm";
export type CreateVireoOptions = {
  directory: string;
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
  javaPackage: string;
  database: VireoDatabase;
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

export async function createVireo(options: CreateVireoOptions): Promise<CreateVireoResult> {
  const directory = resolve(options.directory);
  const projectName = options.projectName ?? basename(directory);
  const javaPackage = options.javaPackage ?? `com.example.${javaSuffix(projectName)}`;
  const database = options.database ?? "postgresql";
  const packageManager = options.packageManager ?? "npm";
  assertProjectName(projectName);
  assertJavaPackage(javaPackage);
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
    javaPackage,
    database,
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
    await rm(join(staging, ".vireo", "template.json"), { force: true });
    await mkdir(join(staging, ".vireo"), { recursive: true });
    await writeFile(
      join(staging, ".vireo", "project.json"),
      `${JSON.stringify({ schemaVersion: 1, projectName, javaPackage, database, databaseName: projectName.replaceAll("-", "_"), packageManager, templateCommit: TEMPLATE_COMMIT, createdBy: "create-vireo@0.1.0" }, null, 2)}\n`,
    );
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
