import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

const MAX_BYTES = 128 * 1024 * 1024;
const SHA = /^[a-f0-9]{40}$/u;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;
const POSITIVE = /^[1-9][0-9]*$/u;
const PRINTABLE_ASCII_PATH = /^[!-~]+$/u;

const sha256 = value => createHash("sha256").update(value).digest("hex");

function files(root, directory = root) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const path = join(directory, entry.name);
      const rawName = relative(root, path);
      const name = rawName.replaceAll("\\", "/");
      if (!PRINTABLE_ASCII_PATH.test(name) || rawName.includes("\\"))
        throw new Error(`Website deployment paths must be printable ASCII without backslashes: ${name}`);
      if (entry.isDirectory()) return files(root, path);
      if (!entry.isFile() || lstatSync(path).isSymbolicLink())
        throw new Error(`Website deployment accepts regular files only: ${name}`);
      return [name];
    })
    .sort();
}
function normalizeStaticTree(root, directory = root) {
  chmodSync(directory, 0o755);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) normalizeStaticTree(root, path);
    else if (entry.isFile() && !lstatSync(path).isSymbolicLink()) chmodSync(path, 0o644);
    else throw new Error(`Website deployment accepts regular files only: ${relative(root, path)}`);
  }
}

export function createWebsiteDeploymentBundle({
  artifactRoot,
  archivePath,
  manifestPath,
  repository,
  commit,
  runId,
  runAttempt,
}) {
  const root = resolve(artifactRoot);
  if (!existsSync(join(root, "index.html")) || !existsSync(join(root, "healthz")))
    throw new Error("Website artifact must contain index.html and healthz.");
  if (
    !REPOSITORY.test(repository ?? "") ||
    !SHA.test(commit ?? "") ||
    !POSITIVE.test(String(runId)) ||
    !POSITIVE.test(String(runAttempt))
  )
    throw new Error("Website deployment identity is malformed.");
  const proofPath = join(root, ".well-known", "vireo-deployment.json");
  if (existsSync(proofPath)) throw new Error("Website artifact must not pre-contain deployment proof.");
  normalizeStaticTree(root);
  const digestEntries = files(root).map(path => [path, sha256(readFileSync(join(root, path)))]);
  const siteDigest = sha256(JSON.stringify(digestEntries));
  mkdirSync(join(root, ".well-known"), { recursive: true });
  writeFileSync(proofPath, `${JSON.stringify({ schemaVersion: 1, repository, commit, siteDigest })}\n`);
  chmodSync(join(root, ".well-known"), 0o755);
  chmodSync(proofPath, 0o644);
  execFileSync("tar", [
    "--format=posix",
    "--pax-option=delete=atime,delete=ctime",
    "--sort=name",
    "--mtime=@0",
    "--owner=0",
    "--group=0",
    "--numeric-owner",
    "--mode=u=rwX,go=rX",
    "-cf",
    archivePath,
    "-C",
    root,
    ".",
  ]);
  const archiveBytes = statSync(archivePath).size;
  if (archiveBytes <= 0 || archiveBytes > MAX_BYTES)
    throw new Error(`Website deployment archive must be within 1..${MAX_BYTES} bytes.`);
  const manifest = {
    schemaVersion: 1,
    repository,
    commit,
    runId: String(runId),
    runAttempt: String(runAttempt),
    siteDigest,
    archiveBytes,
    archiveSha256: sha256(readFileSync(archivePath)),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
  return manifest;
}

if (process.argv[1]?.endsWith("build-deployment-bundle.mjs")) {
  const [artifactRoot, archivePath, manifestPath] = process.argv.slice(2);
  if (!artifactRoot || !archivePath || !manifestPath)
    throw new Error("usage: build-deployment-bundle.mjs ARTIFACT_ROOT ARCHIVE_PATH MANIFEST_PATH");
  console.log(
    JSON.stringify(
      createWebsiteDeploymentBundle({
        artifactRoot,
        archivePath,
        manifestPath,
        repository: process.env.GITHUB_REPOSITORY,
        commit: process.env.GITHUB_SHA,
        runId: process.env.GITHUB_RUN_ID,
        runAttempt: process.env.GITHUB_RUN_ATTEMPT,
      }),
    ),
  );
}
