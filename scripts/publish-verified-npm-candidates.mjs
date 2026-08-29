import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = "https://registry.npmjs.org";

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function tarballName(name, version) {
  return `${name.replace(/^@/u, "").replaceAll("/", "-")}-${version}.tgz`;
}

function assertInside(root, path) {
  const pathFromRoot = relative(root, path);
  if (pathFromRoot === "" || pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Candidate subject escapes its evidence root: ${path}`);
  }
}

export function verifyNpmCandidates(evidenceRoot, expectedCommit) {
  const resolvedRoot = resolve(evidenceRoot);
  const manifestPath = join(resolvedRoot, "release-manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`Missing release candidate manifest: ${manifestPath}`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || manifest.evidenceClass !== "unsigned-release-candidate") {
    throw new Error("Unsupported release candidate manifest");
  }
  if (!/^[0-9a-f]{40}$/u.test(expectedCommit) || manifest.source?.commit !== expectedCommit) {
    throw new Error(`Candidate commit ${manifest.source?.commit ?? "<missing>"} does not match ${expectedCommit}`);
  }
  if (manifest.source?.clean !== true) throw new Error("Release candidates must originate from a clean worktree");

  const versions = Object.entries(manifest.versions?.npm ?? {}).sort(([left], [right]) => left.localeCompare(right));
  const subjects = (manifest.subjects ?? []).filter(subject => subject.kind === "npm-package");
  if (versions.length !== 8 || subjects.length !== versions.length) {
    throw new Error(
      `Expected eight versioned npm candidates, found ${versions.length} versions and ${subjects.length} subjects`,
    );
  }

  const subjectsByPath = new Map(subjects.map(subject => [subject.path, subject]));
  if (subjectsByPath.size !== subjects.length)
    throw new Error("Release candidate manifest contains duplicate npm subjects");

  return versions.map(([name, version]) => {
    if (typeof version !== "string" || !/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
      throw new Error(`Candidate ${name} has an invalid approved release version: ${version}`);
    }
    const subjectPath = `npm/${tarballName(name, version)}`;
    const subject = subjectsByPath.get(subjectPath);
    if (!subject) throw new Error(`Candidate manifest does not bind ${name}@${version} to ${subjectPath}`);

    const tarballPath = resolve(resolvedRoot, subjectPath);
    assertInside(resolvedRoot, tarballPath);
    if (!existsSync(tarballPath)) throw new Error(`Verified candidate tarball is missing: ${subjectPath}`);
    if (statSync(tarballPath).size !== subject.bytes || sha256(tarballPath) !== subject.sha256) {
      throw new Error(`Verified candidate tarball changed after review: ${subjectPath}`);
    }
    subjectsByPath.delete(subjectPath);
    return { coordinate: `${name}@${version}`, name, version, tarballPath };
  });
}

export async function publishVerifiedCandidates(candidates, options = {}) {
  const fetchRegistry = options.fetchRegistry ?? fetch;
  const publish =
    options.publish ??
    (candidate =>
      execFileSync("corepack", ["npm", "publish", candidate.tarballPath, "--access", "public", "--provenance"], {
        cwd: repositoryRoot,
        env: process.env,
        stdio: "inherit",
      }));
  const published = [];

  for (const candidate of candidates) {
    const endpoint = `${registry}/${encodeURIComponent(candidate.name)}/${encodeURIComponent(candidate.version)}`;
    const response = await fetchRegistry(endpoint, { headers: { accept: "application/json" } });
    if (response.ok) continue;
    if (response.status !== 404) {
      throw new Error(`npm registry returned HTTP ${response.status} while checking ${candidate.coordinate}`);
    }
    await publish(candidate);
    published.push(candidate.coordinate);
    console.log(`New tag: ${candidate.coordinate}`);
  }

  if (published.length === 0) throw new Error("Every verified candidate is already immutable on npm");
  return published;
}

async function main() {
  if (process.env.GITHUB_ACTIONS !== "true" || !process.env.GITHUB_SHA) {
    throw new Error("Verified candidate publication is restricted to its protected GitHub Actions workflow");
  }
  const argument = process.argv[2];
  if (!argument || process.argv.length !== 3) {
    throw new Error("Usage: node scripts/publish-verified-npm-candidates.mjs <release-evidence-directory>");
  }
  const candidates = verifyNpmCandidates(resolve(repositoryRoot, argument), process.env.GITHUB_SHA);
  await publishVerifiedCandidates(candidates);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
