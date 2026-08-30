import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function packagePath(root, name) {
  return join(root, "node_modules", ...name.split("/"));
}

function isWithin(root, candidate) {
  const path = relative(root, candidate);
  return path !== "" && !path.startsWith(`..${sep}`) && path !== ".." && !path.startsWith("../");
}

function aggregate(primary, failures, message) {
  const errors = [...(primary ? [primary] : []), ...failures];
  if (errors.length === 0) return undefined;
  if (errors.length === 1) return errors[0];
  return new AggregateError(errors, message);
}

export function candidateTarballFilename(name, version) {
  if (typeof name !== "string" || typeof version !== "string" || !name || !version)
    throw new Error("A local Vireo candidate requires a package name and version.");
  return `${name.replace(/^@/u, "").replaceAll("/", "-")}-${version}.tgz`;
}

export function projectCandidateDependencies(dependencies, candidates) {
  const projection = { ...dependencies };
  for (const name of Object.keys(dependencies ?? {})) {
    if (!name.startsWith("@vireocodedev/")) continue;
    const candidate = candidates.get(name);
    if (!candidate) throw new Error(`No packed local candidate is available for ${name}.`);
    projection[name] = `file:${candidate.tarball}`;
  }
  return projection;
}

export function assertCandidateManifest({ repositoryRoot, directory, manifest, packedManifest }) {
  const expectedDirectory = relative(repositoryRoot, directory).replaceAll("\\", "/");
  if (!isWithin(join(repositoryRoot, "packages"), directory))
    throw new Error(`Candidate directory must be inside packages/: ${directory}`);
  if (packedManifest.name !== manifest.name || packedManifest.version !== manifest.version)
    throw new Error(`Packed candidate identity differs from ${manifest.name}@${manifest.version}.`);
  if (packedManifest.repository?.directory !== expectedDirectory)
    throw new Error(`${manifest.name} packed candidate has an unexpected repository directory.`);
}

function lockPackageName(path, entry) {
  const matched = /(?:^|\/)node_modules\/(@vireocodedev\/[^/]+)$/u.exec(path)?.[1];
  const named = typeof entry?.name === "string" && entry.name.startsWith("@vireocodedev/") ? entry.name : undefined;
  if (matched && named && matched !== named)
    throw new Error(`Lockfile package path ${path} does not match declared package ${named}.`);
  return named ?? matched;
}

function fileResolution(lockDirectory, resolution) {
  if (typeof resolution !== "string" || !resolution.startsWith("file:"))
    throw new Error(
      `Vireo candidate lock resolution must be a file reference, received ${JSON.stringify(resolution)}.`,
    );
  try {
    return resolve(lockDirectory, decodeURIComponent(resolution.slice("file:".length)));
  } catch (error) {
    throw new Error(
      `Vireo candidate lock resolution is invalid: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      },
    );
  }
}

/** Validates every Vireo node in the temporary lock, including nested nodes. */
export function assertCandidateLockProvenance(lock, candidates, lockDirectory) {
  if (!lock || typeof lock !== "object" || !lock.packages || typeof lock.packages !== "object")
    throw new Error("Candidate installation did not create an npm lockfile packages map.");
  const seen = new Map();
  for (const [path, entry] of Object.entries(lock.packages)) {
    const name = lockPackageName(path, entry);
    if (!name) continue;
    const candidate = candidates.get(name);
    if (!candidate) throw new Error(`Lockfile contains unexpected Vireo package ${name}.`);
    const nodes = seen.get(name) ?? [];
    nodes.push(path);
    seen.set(name, nodes);
    const actual = fileResolution(lockDirectory, entry.resolved);
    if (actual !== resolve(candidate.tarball))
      throw new Error(`${name} lockfile resolution does not identify its exact packed candidate.`);
    if (
      typeof entry.integrity !== "string" ||
      !entry.integrity.startsWith("sha512-") ||
      entry.integrity !== candidate.integrity
    )
      throw new Error(`${name} lockfile integrity does not match its exact packed candidate.`);
  }
  for (const [name] of candidates) {
    const nodes = seen.get(name) ?? [];
    if (nodes.length === 0) throw new Error(`Lockfile is missing packed candidate ${name}.`);
    if (nodes.length !== 1)
      throw new Error(`Lockfile has duplicate packed candidates for ${name}: ${nodes.join(", ")}`);
  }
}

export function assertInstalledCandidateMetadata({
  projectDirectory,
  directory,
  stats,
  resolved,
  manifest,
  candidate,
}) {
  if (stats.isSymbolicLink())
    throw new Error(`${candidate.manifest.name} was linked instead of installed from its packed candidate.`);
  if (directory !== packagePath(projectDirectory, candidate.manifest.name))
    throw new Error(`${candidate.manifest.name} installed directory does not match its package identity.`);
  if (!isWithin(projectDirectory, resolved))
    throw new Error(`${candidate.manifest.name} resolved outside the generated fixture.`);
  if (manifest.name !== candidate.manifest.name || manifest.version !== candidate.manifest.version)
    throw new Error(`${candidate.manifest.name} installed identity does not match its packed candidate.`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function packageManifests(repositoryRoot) {
  const packagesRoot = join(repositoryRoot, "packages");
  return Promise.all(
    (await readdir(packagesRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const directory = join(packagesRoot, entry.name);
        return { directory, manifest: await readJson(join(directory, "package.json")) };
      }),
  );
}

async function packCandidates(repositoryRoot, names) {
  const candidateRoot = await mkdtemp(join(tmpdir(), "vireo-local-candidates-"));
  const tarballRoot = join(candidateRoot, "tarballs");
  try {
    await mkdir(tarballRoot);
    execFileSync(
      "corepack",
      ["npm", "pack", "--workspaces", "--pack-destination", tarballRoot, "--ignore-scripts", "--silent"],
      {
        cwd: repositoryRoot,
        env: { ...process.env, npm_config_cache: join(candidateRoot, "npm-cache") },
        stdio: "inherit",
      },
    );
    const sourcePackages = await packageManifests(repositoryRoot);
    const candidates = new Map();
    for (const source of sourcePackages.filter(candidate => names.includes(candidate.manifest.name))) {
      const filename = candidateTarballFilename(source.manifest.name, source.manifest.version);
      const tarball = join(tarballRoot, filename);
      const [packedManifest, bytes] = await Promise.all([
        JSON.parse(execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" })),
        readFile(tarball),
      ]);
      assertCandidateManifest({ ...source, repositoryRoot, packedManifest });
      candidates.set(source.manifest.name, {
        ...source,
        tarball,
        integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
      });
    }
    if (candidates.size !== names.length) {
      const missing = names.filter(name => !candidates.has(name));
      throw new Error(`Could not pack every required local Vireo candidate: ${missing.join(", ")}`);
    }
    return { candidateRoot, candidates };
  } catch (error) {
    const failures = await settleRestoration([() => rm(candidateRoot, { recursive: true, force: true })]);
    throw aggregate(error, failures, "Candidate packing failed and its temporary files could not be removed.");
  }
}

async function assertInstalledCandidates(projectDirectory, candidates) {
  const root = await realpath(projectDirectory);
  for (const candidate of candidates.values()) {
    const directory = packagePath(projectDirectory, candidate.manifest.name);
    const [stats, resolved, manifest] = await Promise.all([
      lstat(directory),
      realpath(directory),
      readJson(join(directory, "package.json")),
    ]);
    assertInstalledCandidateMetadata({ projectDirectory: root, directory, stats, resolved, manifest, candidate });
  }
}

async function settleRestoration(actions) {
  const settled = await Promise.allSettled(actions.map(action => action()));
  return settled.filter(result => result.status === "rejected").map(result => result.reason);
}

/**
 * Runs setup then restores source declarations and removes every temporary
 * candidate/cache before executing the fixture callback. The callback therefore
 * exercises installed packed bytes while seeing the published package contract.
 */
export async function runCandidateFixtureLifecycle({ install, assertInstalled, restore, cleanup, callback }) {
  let primary;
  try {
    await install();
    await assertInstalled();
  } catch (error) {
    primary = error;
  }
  const cleanupFailures = await settleRestoration([restore, cleanup]);
  const setupFailure = aggregate(primary, cleanupFailures, "Candidate setup failed and restoration was incomplete.");
  if (setupFailure) throw setupFailure;
  return callback();
}

/**
 * Installs the current workspace packages as exact tarballs for a generated
 * frontend fixture. The generated package.json and registry lockfile are put
 * back byte-for-byte, then candidate tarballs and caches are removed before
 * the callback runs. The installed node_modules tree remains packed.
 */
export async function withLocalVireoCandidates(
  projectDirectory,
  action,
  { repositoryRoot = defaultRepositoryRoot } = {},
) {
  const root = resolve(projectDirectory);
  const manifestPath = join(root, "package.json");
  const lockPath = join(root, "package-lock.json");
  const [manifestText, lockText] = await Promise.all([readFile(manifestPath, "utf8"), readFile(lockPath, "utf8")]);
  const manifest = JSON.parse(manifestText);
  const names = Object.keys(manifest.dependencies ?? {}).filter(name => name.startsWith("@vireocodedev/"));
  if (names.length === 0) throw new Error(`Generated fixture ${root} has no Vireo package dependencies.`);
  const packed = await packCandidates(repositoryRoot, names);
  return runCandidateFixtureLifecycle({
    install: async () => {
      const candidateManifest = {
        ...manifest,
        dependencies: projectCandidateDependencies(manifest.dependencies, packed.candidates),
      };
      await writeFile(manifestPath, `${JSON.stringify(candidateManifest, null, 2)}\n`);
      execFileSync(
        "corepack",
        ["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund", "--strict-peer-deps"],
        {
          cwd: root,
          env: { ...process.env, npm_config_cache: join(packed.candidateRoot, "fixture-npm-cache") },
          stdio: "inherit",
        },
      );
      assertCandidateLockProvenance(await readJson(lockPath), packed.candidates, root);
    },
    assertInstalled: () => assertInstalledCandidates(root, packed.candidates),
    restore: () =>
      settleRestoration([() => writeFile(manifestPath, manifestText), () => writeFile(lockPath, lockText)]).then(
        failures => {
          const failure = aggregate(undefined, failures, "Candidate source declarations could not be restored.");
          if (failure) throw failure;
        },
      ),
    cleanup: () => rm(packed.candidateRoot, { recursive: true, force: true }),
    callback: action,
  });
}
