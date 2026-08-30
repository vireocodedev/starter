import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { format, resolveConfig } from "prettier";
import { readEntitySchema } from "./entity-schema.js";
import {
  createWireContract,
  entityNames,
  renderCapabilityRegistry,
  renderEntityFiles,
  type GeneratedFile,
  type VireoGenerationTarget,
  type VireoProjectMetadata,
} from "./entity-renderer.js";

export const VIREO_GENERATOR_VERSION = "0.3.0";
const LEGACY_GENERATOR_VERSION = "0.2.0";

type ManifestFile = Pick<GeneratedFile, "ownership" | "path" | "role"> & {
  sha256: string;
};

export type EntityGenerationManifest = {
  schemaVersion: 1;
  generatorVersion: string;
  target?: VireoGenerationTarget;
  entity: string;
  plural: string;
  fileStem: string;
  schemaDigest: string;
  contractDigest: string;
  schemaPath: string;
  files: ManifestFile[];
};

export type EntityGenerationFileResult = {
  path: string;
  role: GeneratedFile["role"] | "manifest";
  status: "create" | "customized" | "delete" | "unchanged" | "update";
};

export type GenerateEntityOptions = {
  projectDirectory: string;
  schemaPath: string;
  outputDirectory?: string;
  dryRun?: boolean;
  force?: boolean;
  acceptOverwrite?: boolean;
  target?: VireoGenerationTarget;
};

export type GenerateEntityResult = {
  entity: string;
  plural: string;
  projectDirectory: string;
  outputDirectory: string;
  schemaDigest: string;
  contractDigest: string;
  target: VireoGenerationTarget;
  dryRun: boolean;
  files: EntityGenerationFileResult[];
};

export type GeneratedContractCheck = {
  entity: string;
  ok: boolean;
  problems: string[];
};

export class VireoGeneratorError extends Error {
  constructor(
    readonly code: "VIR-GEN-002" | "VIR-GEN-003" | "VIR-GEN-004" | "VIR-GEN-005" | "VIR-GEN-006",
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "VireoGeneratorError";
  }
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  return value;
}

export function stableJson(value: unknown) {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

export function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

async function pathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function assertInside(root: string, candidate: string) {
  const path = resolve(root, candidate);
  const rel = relative(root, path);
  if (rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))) return path;
  throw new VireoGeneratorError("VIR-GEN-002", `Refusing path outside the project: ${candidate}`);
}

async function readJson(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new VireoGeneratorError(
      "VIR-GEN-002",
      `Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function parseProjectMetadata(value: unknown): VireoProjectMetadata {
  if (!value || typeof value !== "object")
    throw new VireoGeneratorError("VIR-GEN-002", "Project metadata must be an object.");
  const data = value as Record<string, unknown>;
  if (data.schemaVersion !== 1)
    throw new VireoGeneratorError("VIR-GEN-002", "Project metadata schemaVersion must be 1.");
  if (typeof data.projectName !== "string")
    throw new VireoGeneratorError("VIR-GEN-002", "Project metadata must contain projectName.");
  const profile = data.profile ?? "full-stack";
  if (profile !== "full-stack" && profile !== "frontend")
    throw new VireoGeneratorError("VIR-GEN-002", "Project metadata profile must be full-stack or frontend.");
  if (profile === "full-stack" && typeof data.javaPackage !== "string")
    throw new VireoGeneratorError("VIR-GEN-002", "Full-stack project metadata must contain javaPackage.");
  return data as VireoProjectMetadata;
}

export async function readProjectMetadata(projectDirectory: string): Promise<VireoProjectMetadata> {
  const root = resolve(projectDirectory);
  for (const file of [".vireo/project.json", ".vireo/template.json"]) {
    const path = join(root, file);
    if (await pathExists(path)) return parseProjectMetadata(await readJson(path));
  }
  throw new VireoGeneratorError(
    "VIR-GEN-002",
    `No .vireo/project.json metadata was found in ${root}. Run this command from a Vireo application root.`,
  );
}

function manifestPath(root: string, plural: string) {
  return join(root, ".vireo", "generated", `${plural}.json`);
}

async function readManifest(path: string): Promise<EntityGenerationManifest | null> {
  if (!(await pathExists(path))) return null;
  const value = await readJson(path);
  if (!value || typeof value !== "object" || (value as EntityGenerationManifest).schemaVersion !== 1)
    throw new VireoGeneratorError("VIR-GEN-002", `Invalid generation manifest: ${path}`);
  return value as EntityGenerationManifest;
}

async function manifests(root: string) {
  const directory = join(root, ".vireo", "generated");
  if (!(await pathExists(directory))) return [];
  const files = (await readdir(directory)).filter(file => file.endsWith(".json")).sort();
  return Promise.all(files.map(file => readManifest(join(directory, file)))) as Promise<EntityGenerationManifest[]>;
}

async function currentHash(path: string) {
  return sha256(await readFile(path));
}

async function classifyFiles(
  root: string,
  files: GeneratedFile[],
  previous: EntityGenerationManifest | null,
): Promise<EntityGenerationFileResult[]> {
  const previousByPath = new Map(previous?.files.map(file => [file.path, file]));
  return Promise.all(
    files.map(async file => {
      const target = assertInside(root, file.path);
      if (!(await pathExists(target))) return { path: file.path, role: file.role, status: "create" as const };
      const existingHash = await currentHash(target);
      const expectedHash = sha256(file.content);
      if (existingHash === expectedHash) return { path: file.path, role: file.role, status: "unchanged" as const };
      const recorded = previousByPath.get(file.path);
      if (recorded && recorded.sha256 !== existingHash)
        return { path: file.path, role: file.role, status: "customized" as const };
      return { path: file.path, role: file.role, status: "update" as const };
    }),
  );
}

function contractCritical(file: ManifestFile) {
  return (
    file.role === "contract" ||
    file.role === "migration" ||
    /DTO\.java$|Controller\.java$|\/models\/|\/api\//u.test(file.path)
  );
}

async function writeAtomically(root: string, writes: Array<{ path: string; content: string | null }>) {
  const originals = new Map<string, Uint8Array | null>();
  try {
    for (const file of writes) {
      const target = assertInside(root, file.path);
      originals.set(target, (await pathExists(target)) ? await readFile(target) : null);
      if (file.content === null) await rm(target, { force: true });
      else {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, file.content);
      }
    }
  } catch (error) {
    for (const [path, contents] of [...originals.entries()].reverse()) {
      if (contents === null) await rm(path, { force: true });
      else await writeFile(path, contents);
    }
    throw error;
  }
}

function registryFromManifests(records: EntityGenerationManifest[]) {
  return renderCapabilityRegistry(records.map(record => ({ plural: record.plural, fileStem: record.fileStem })));
}

const prettierExtensions = new Set([".json", ".md", ".ts", ".tsx"]);

async function formatGeneratedFile(root: string, file: GeneratedFile): Promise<GeneratedFile> {
  const extension = file.path.slice(file.path.lastIndexOf("."));
  if (!prettierExtensions.has(extension)) return file;
  const filepath = join(root, file.path);
  const config = (await resolveConfig(filepath)) ?? {};
  return { ...file, content: await format(file.content, { ...config, filepath }) };
}

export async function generateEntity(options: GenerateEntityOptions): Promise<GenerateEntityResult> {
  const projectRoot = resolve(options.projectDirectory);
  const outputRoot = options.outputDirectory ? resolve(options.outputDirectory) : projectRoot;
  const project = await readProjectMetadata(projectRoot);
  const profile = project.profile ?? "full-stack";
  const target = options.target ?? profile;
  if (target === "full-stack" && profile === "frontend")
    throw new VireoGeneratorError("VIR-GEN-002", "A frontend project cannot generate full-stack files.");
  const schema = await readEntitySchema(resolve(projectRoot, options.schemaPath));
  const canonicalSchema = stableJson(schema);
  const schemaDigest = sha256(canonicalSchema);
  const contract = createWireContract(schema, target);
  const contractJson = stableJson(contract);
  const contractDigest = sha256(contractJson);
  const names = entityNames(schema, project);
  const generatedFiles = renderEntityFiles(schema, project, schemaDigest, target);
  const schemaFile = `.vireo/schemas/${names.plural}.json`;
  const contractFile = `.vireo/contracts/${names.plural}.contract.json`;
  const priorManifest = options.outputDirectory ? null : await readManifest(manifestPath(projectRoot, names.plural));
  const plannedFiles: GeneratedFile[] = await Promise.all(
    [
      ...generatedFiles,
      { path: schemaFile, content: canonicalSchema, ownership: "regenerated", role: "contract" },
      { path: contractFile, content: contractJson, ownership: "regenerated", role: "contract" },
    ].map(file => formatGeneratedFile(outputRoot, file as GeneratedFile)),
  );
  let records = options.outputDirectory
    ? []
    : (await manifests(projectRoot)).filter(record => record.plural !== names.plural);
  const manifest: EntityGenerationManifest = {
    schemaVersion: 1,
    generatorVersion: VIREO_GENERATOR_VERSION,
    target,
    entity: schema.entity.name,
    plural: names.plural,
    fileStem: names.fileStem,
    schemaDigest,
    contractDigest,
    schemaPath: schemaFile,
    files: plannedFiles.map(file => ({
      path: file.path,
      ownership: file.ownership,
      role: file.role,
      sha256: sha256(file.content),
    })),
  };
  records = [...records, manifest].sort((left, right) => left.plural.localeCompare(right.plural));
  const registryFile = `${profile === "frontend" ? "" : "frontend/"}src/generated/vireo.capabilities.ts`;
  const registry: GeneratedFile = await formatGeneratedFile(outputRoot, {
    path: registryFile,
    content: registryFromManifests(records),
    ownership: "regenerated",
    role: "registry",
  });
  plannedFiles.push(registry);

  const classification = await classifyFiles(outputRoot, plannedFiles, priorManifest);
  const plannedPaths = new Set(plannedFiles.map(file => file.path));
  const obsolete: EntityGenerationFileResult[] = [];
  if (priorManifest) {
    for (const file of priorManifest.files.filter(file => !plannedPaths.has(file.path))) {
      const target = assertInside(outputRoot, file.path);
      if (!(await pathExists(target))) continue;
      obsolete.push({
        path: file.path,
        role: file.role,
        status: (await currentHash(target)) === file.sha256 ? "delete" : "customized",
      });
    }
  }
  let collisions = classification.filter(file => file.status === "update" && !priorManifest);
  const registryTarget = join(outputRoot, registryFile);
  if (collisions.some(file => file.path === registryFile) && (await pathExists(registryTarget))) {
    const currentRegistry = await readFile(registryTarget, "utf8");
    if (currentRegistry.startsWith("// @vireo-regenerated schema-v1"))
      collisions = collisions.filter(file => file.path !== registryFile);
  }
  if (collisions.length > 0 && !options.acceptOverwrite)
    throw new VireoGeneratorError(
      "VIR-GEN-003",
      `Generation would overwrite unmanaged files:\n${collisions.map(file => `- ${file.path}`).join("\n")}\nUse --output to review elsewhere; --force --accept-overwrite is the explicit destructive path.`,
    );
  if (priorManifest && priorManifest.schemaDigest !== schemaDigest && !options.force)
    throw new VireoGeneratorError(
      "VIR-GEN-004",
      `The ${schema.entity.name} schema changed. Review with --dry-run or --output, then rerun with --force.`,
    );
  if (obsolete.some(file => file.status === "delete") && !options.force)
    throw new VireoGeneratorError(
      "VIR-GEN-004",
      `Regeneration would remove obsolete generated files:\n${obsolete.map(file => `- ${file.path}`).join("\n")}\nReview the plan and rerun with --force.`,
    );
  classification.push(...obsolete);
  const customized = classification.filter(file => file.status === "customized");
  if (customized.length > 0 && (!options.force || !options.acceptOverwrite))
    throw new VireoGeneratorError(
      "VIR-GEN-005",
      `Application-owned generated files were customized:\n${customized.map(file => `- ${file.path}`).join("\n")}\nVireo will not replace them without both --force and --accept-overwrite. Use vireo eject ${names.plural} to keep them permanently.`,
    );
  if (options.acceptOverwrite && !options.force)
    throw new VireoGeneratorError("VIR-GEN-005", "--accept-overwrite is valid only together with --force.");

  const manifestRelative = `.vireo/generated/${names.plural}.json`;
  const manifestContent = stableJson(manifest);
  const manifestTarget = join(outputRoot, manifestRelative);
  const manifestStatus = !(await pathExists(manifestTarget))
    ? "create"
    : sha256(await readFile(manifestTarget)) === sha256(manifestContent)
      ? "unchanged"
      : "update";
  classification.push({ path: manifestRelative, role: "manifest", status: manifestStatus });
  if (!options.dryRun) {
    const writes: Array<{ path: string; content: string | null }> = plannedFiles
      .filter((_, index) => classification[index].status !== "unchanged")
      .map(file => ({ path: file.path, content: file.content }));
    writes.push(
      ...obsolete
        .filter(file => file.status === "delete" || (file.status === "customized" && options.acceptOverwrite))
        .map(file => ({ path: file.path, content: null })),
    );
    if (manifestStatus !== "unchanged") writes.push({ path: manifestRelative, content: manifestContent });
    await writeAtomically(outputRoot, writes);
  }

  return {
    entity: schema.entity.name,
    plural: names.plural,
    projectDirectory: projectRoot,
    outputDirectory: outputRoot,
    schemaDigest,
    contractDigest,
    target,
    dryRun: options.dryRun ?? false,
    files: classification,
  };
}

export async function checkGeneratedEntities(projectDirectory: string): Promise<GeneratedContractCheck[]> {
  const root = resolve(projectDirectory);
  const project = await readProjectMetadata(root);
  const records = await manifests(root);
  return Promise.all(
    records.map(async record => {
      const problems: string[] = [];
      const schemaPath = assertInside(root, record.schemaPath);
      if (!(await pathExists(schemaPath))) problems.push(`missing canonical schema ${record.schemaPath}`);
      else {
        try {
          if (record.generatorVersion === VIREO_GENERATOR_VERSION) {
            const schema = await readEntitySchema(schemaPath);
            const canonical = stableJson(schema);
            if (sha256(canonical) !== record.schemaDigest)
              problems.push("canonical schema digest differs from the manifest");
            const contract = stableJson(createWireContract(schema, record.target ?? project.profile ?? "full-stack"));
            if (sha256(contract) !== record.contractDigest)
              problems.push("derived wire contract digest differs from the schema");
          } else if (record.generatorVersion === LEGACY_GENERATOR_VERSION) {
            if (sha256(stableJson(await readJson(schemaPath))) !== record.schemaDigest)
              problems.push("legacy canonical schema digest differs from the manifest");
          } else problems.push(`unsupported generator version ${JSON.stringify(record.generatorVersion)}`);
          const contractPath = join(root, ".vireo", "contracts", `${record.plural}.contract.json`);
          if (
            !(await pathExists(contractPath)) ||
            sha256(stableJson(await readJson(contractPath))) !== record.contractDigest
          )
            problems.push(
              record.generatorVersion === LEGACY_GENERATOR_VERSION
                ? "legacy wire-contract artifact is missing or stale"
                : "wire-contract artifact is missing or stale",
            );
        } catch (error) {
          problems.push(error instanceof Error ? error.message : String(error));
        }
      }
      for (const file of record.files.filter(contractCritical)) {
        const path = assertInside(root, file.path);
        if (!(await pathExists(path))) problems.push(`missing contract-critical file ${file.path}`);
        else if ((await currentHash(path)) !== file.sha256) problems.push(`contract drift in ${file.path}`);
      }
      return { entity: record.entity, ok: problems.length === 0, problems };
    }),
  );
}

export async function ejectEntity(projectDirectory: string, plural: string, dryRun = false) {
  const root = resolve(projectDirectory);
  const project = await readProjectMetadata(root);
  const path = manifestPath(root, plural);
  const manifest = await readManifest(path);
  if (!manifest) throw new VireoGeneratorError("VIR-GEN-006", `No managed generated capability named ${plural}.`);
  const remaining = (await manifests(root)).filter(record => record.plural !== plural);
  if (!dryRun) {
    for (const file of manifest.files.filter(file => file.ownership === "generated-once")) {
      const target = assertInside(root, file.path);
      if (!(await pathExists(target))) continue;
      const content = await readFile(target, "utf8");
      await writeFile(target, content.replace("@vireo-generated-once", "@vireo-ejected"));
    }
    await writeFile(
      join(root, `${project.profile === "frontend" ? "" : "frontend/"}src/generated/vireo.capabilities.ts`),
      registryFromManifests(remaining),
    );
    await rm(path, { force: true });
    await rm(join(root, ".vireo", "schemas", `${plural}.json`), { force: true });
    await rm(join(root, ".vireo", "contracts", `${plural}.contract.json`), { force: true });
  }
  return { entity: manifest.entity, plural, dryRun, retainedFiles: manifest.files.map(file => file.path) };
}
