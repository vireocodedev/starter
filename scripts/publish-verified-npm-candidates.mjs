import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = "https://registry.npmjs.org";

function positiveInteger(value, fallback, variableName) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0)
    throw new Error(`${variableName} must be a positive integer, received ${JSON.stringify(value)}.`);
  return parsed;
}

export function registryConfirmationSettings(environment = process.env) {
  return {
    retryAttempts: positiveInteger(environment.NPM_CANDIDATE_CONFIRM_ATTEMPTS, 80, "NPM_CANDIDATE_CONFIRM_ATTEMPTS"),
    retryDelay: positiveInteger(
      environment.NPM_CANDIDATE_CONFIRM_INTERVAL_MS,
      15_000,
      "NPM_CANDIDATE_CONFIRM_INTERVAL_MS",
    ),
  };
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sha512(path) {
  return createHash("sha512").update(readFileSync(path)).digest("hex");
}

function npmIntegrity(path) {
  return `sha512-${createHash("sha512").update(readFileSync(path)).digest("base64")}`;
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
  if (manifest.schemaVersion !== 2 || manifest.evidenceClass !== "unsigned-release-candidate") {
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
    if (
      statSync(tarballPath).size !== subject.bytes ||
      sha256(tarballPath) !== subject.sha256 ||
      sha512(tarballPath) !== subject.sha512
    ) {
      throw new Error(`Verified candidate tarball changed after review: ${subjectPath}`);
    }
    subjectsByPath.delete(subjectPath);
    return {
      coordinate: `${name}@${version}`,
      name,
      version,
      tarballPath,
      integrity: npmIntegrity(tarballPath),
    };
  });
}

function registryEndpoint(candidate) {
  return `${registry}/${encodeURIComponent(candidate.name)}/${encodeURIComponent(candidate.version)}`;
}

function isSha512Integrity(value) {
  if (typeof value !== "string") return false;
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/u.exec(value);
  if (!match) return false;
  const digest = Buffer.from(match[1], "base64");
  return digest.length === 64 && digest.toString("base64") === match[1];
}

function assertCandidateCoordinate(candidate) {
  if (
    !candidate ||
    typeof candidate.name !== "string" ||
    candidate.name.length === 0 ||
    typeof candidate.version !== "string" ||
    candidate.version.length === 0 ||
    candidate.coordinate !== `${candidate.name}@${candidate.version}`
  ) {
    throw new Error("Release candidate must have a valid npm coordinate.");
  }
  if (!isSha512Integrity(candidate.integrity)) {
    throw new Error(`Release candidate ${candidate.coordinate} must have a valid sha512 SRI integrity.`);
  }
}

export async function inspectRegistryCandidate(candidate, fetchRegistry) {
  assertCandidateCoordinate(candidate);
  const response = await fetchRegistry(registryEndpoint(candidate), { headers: { accept: "application/json" } });
  if (response.status === 404) return { state: "absent" };
  if (response.status !== 200)
    throw new Error(`npm registry returned HTTP ${response.status} while checking ${candidate.coordinate}`);

  let metadata;
  try {
    metadata = await response.json();
  } catch (error) {
    throw new Error(`npm registry returned invalid metadata for ${candidate.coordinate}`, { cause: error });
  }
  if (metadata?.name !== candidate.name || metadata?.version !== candidate.version) {
    throw new Error(`npm registry metadata has an unexpected coordinate for ${candidate.coordinate}`);
  }
  if (!isSha512Integrity(metadata?.dist?.integrity)) {
    throw new Error(`npm registry metadata has invalid sha512 SRI integrity for ${candidate.coordinate}`);
  }
  return {
    state: metadata.dist.integrity === candidate.integrity ? "exact" : "historical",
    metadata,
  };
}

async function confirmPublishedCandidate(candidate, { fetchRegistry, sleep, retryAttempts, retryDelay }) {
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    const registryState = await inspectRegistryCandidate(candidate, fetchRegistry);
    if (registryState.state === "exact") return;
    if (registryState.state === "historical") {
      throw new Error(`npm registry integrity does not match reviewed candidate bytes for ${candidate.coordinate}`);
    }
    if (attempt === retryAttempts) break;
    await sleep(retryDelay);
  }
  throw new Error(`npm registry did not confirm ${candidate.coordinate} after ${retryAttempts} attempts`);
}

function runGit(args) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function inspectExistingTag(tag, executeGit = runGit) {
  const ref = `refs/tags/${tag}`;
  try {
    executeGit(["show-ref", "--verify", "--quiet", ref]);
  } catch (error) {
    if (error?.status === 1) return null;
    throw new Error(`Could not verify release tag ref ${ref}.`, { cause: error });
  }
  if (executeGit(["cat-file", "-t", ref]) !== "tag") {
    throw new Error(`Release tag ${ref} must be an annotated tag object.`);
  }
  if (executeGit(["for-each-ref", "--format=%(contents:subject)", ref]) !== tag) {
    throw new Error(`Release tag ${ref} must use annotation message ${tag}.`);
  }
  try {
    const commit = executeGit(["rev-parse", "--verify", `${ref}^{commit}`]);
    if (!/^[0-9a-f]{40}$/u.test(commit)) throw new Error(`Tag ${ref} did not peel to a full commit.`);
    return commit;
  } catch (error) {
    throw new Error(`Release tag ${ref} could not be peeled to a commit.`, { cause: error });
  }
}

function createAnnotatedTag(tag, message, commit) {
  execFileSync("git", ["tag", "--annotate", tag, commit, "--message", message], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
}

async function preflightCandidateTags(candidates, expectedCommit, options) {
  if (!/^[0-9a-f]{40}$/u.test(expectedCommit)) throw new Error("Expected release commit must be a full Git commit.");
  const resolveTag = options.resolveTag ?? inspectExistingTag;
  const registryStates = options.registryStates;
  const missingTags = new Set();

  for (const candidate of candidates) {
    const registryState = registryStates.get(candidate.coordinate);
    if (!registryState || !["absent", "exact", "historical"].includes(registryState.state)) {
      throw new Error(`Release candidate ${candidate.coordinate} is missing a valid registry preflight state.`);
    }
    const target = await resolveTag(candidate.coordinate);
    if (target !== null && !/^[0-9a-f]{40}$/u.test(target)) {
      throw new Error(`Release tag ${candidate.coordinate} did not resolve to a full commit.`);
    }

    if (registryState.state === "historical") {
      if (target === null) {
        throw new Error(
          `Historical npm registry candidate ${candidate.coordinate} requires its existing annotated coordinate tag.`,
        );
      }
      continue;
    }

    if (target === null) missingTags.add(candidate.coordinate);
    else if (target !== expectedCommit) {
      throw new Error(
        `Release tag ${candidate.coordinate} resolves to ${target}, not expected commit ${expectedCommit}`,
      );
    }
  }

  return missingTags;
}

export async function reconcileCandidateTags(candidates, expectedCommit, options = {}) {
  const createTag = options.createTag ?? createAnnotatedTag;
  const log = options.log ?? console.log;
  const missingTags =
    options.missingTags ??
    (await preflightCandidateTags(candidates, expectedCommit, {
      ...options,
      registryStates: new Map(candidates.map(candidate => [candidate.coordinate, { state: "exact" }])),
    }));

  for (const candidate of candidates) {
    if (!missingTags.has(candidate.coordinate)) continue;
    await createTag(candidate.coordinate, candidate.coordinate, expectedCommit);
    log(`New tag: ${candidate.coordinate}`);
  }
  return candidates.filter(candidate => missingTags.has(candidate.coordinate)).map(candidate => candidate.coordinate);
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
  const sleep = options.sleep ?? (delay => new Promise(resolveSleep => setTimeout(resolveSleep, delay)));
  const confirmation = registryConfirmationSettings(options.environment);
  const retryAttempts = options.retryAttempts ?? confirmation.retryAttempts;
  const retryDelay = options.retryDelay ?? confirmation.retryDelay;
  const expectedCommit = options.expectedCommit ?? process.env.GITHUB_SHA;
  if (!Number.isInteger(retryAttempts) || retryAttempts < 1)
    throw new Error("Registry confirmation attempts must be a positive integer.");
  if (!Number.isInteger(retryDelay) || retryDelay < 0)
    throw new Error("Registry confirmation delay must be non-negative.");
  if (!/^[0-9a-f]{40}$/u.test(expectedCommit ?? ""))
    throw new Error("Expected release commit must be a full Git commit.");
  const published = [];
  const registryStates = new Map();
  const unpublished = [];

  for (const candidate of candidates) {
    if (registryStates.has(candidate.coordinate)) {
      throw new Error(`Release candidates contain duplicate coordinate ${candidate.coordinate}.`);
    }
    const registryState = await inspectRegistryCandidate(candidate, fetchRegistry);
    registryStates.set(candidate.coordinate, registryState);
    if (registryState.state === "absent") unpublished.push(candidate);
  }

  // All registry coordinates and all tag bindings must be understood before
  // either immutable system is mutated. A historical registry version is only
  // safe when its existing annotated coordinate tag supplies its provenance.
  const missingTags = await preflightCandidateTags(candidates, expectedCommit, {
    ...options,
    registryStates,
  });

  for (const candidate of unpublished) {
    await publish(candidate);
    await confirmPublishedCandidate(candidate, { fetchRegistry, sleep, retryAttempts, retryDelay });
    published.push(candidate.coordinate);
  }

  await reconcileCandidateTags(candidates, expectedCommit, { ...options, missingTags });
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
  await publishVerifiedCandidates(candidates, { expectedCommit: process.env.GITHUB_SHA });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
