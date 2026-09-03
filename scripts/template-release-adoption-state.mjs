import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { auditHistoricalCandidates } from "./publish-verified-npm-candidates.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const commit = /^[a-f0-9]{40}$/u;
const requiredNpmPackages = [
  "@vireocodedev/history",
  "@vireocodedev/infrastructure",
  "@vireocodedev/localization",
  "@vireocodedev/query",
  "@vireocodedev/shell",
  "@vireocodedev/sqlite",
  "@vireocodedev/ui",
];
const requiredMavenModules = ["vireo-bom", "vireo-core", "vireo-auth", "vireo-query", "vireo-offline", "vireo-history"];
const requiredTemplateBoundFiles = [
  "contracts/template-release-policy.json",
  ".vireo/template.json",
  "package.json",
  "frontend/package.json",
  "frontend/package-lock.json",
  "contracts/vireo-package-compatibility.json",
  "contracts/project-upgrade-policy.json",
  "gradle.properties",
];

function verifyMavenSignature({ pom, signature }) {
  const directory = mkdtempSync(`${tmpdir()}/vireo-template-maven-`);
  try {
    const key = resolve(root, "contracts/vireo-release-signing-key.asc");
    const pomPath = resolve(directory, "artifact.pom");
    const signaturePath = resolve(directory, "artifact.pom.asc");
    writeFileSync(pomPath, pom);
    writeFileSync(signaturePath, signature);
    execFileSync("gpg", ["--batch", "--homedir", directory, "--import", key], { stdio: "pipe" });
    const fingerprint = "C8C362C561046CD11C0F0DE01174796DD298F009";
    const listed = execFileSync("gpg", ["--homedir", directory, "--with-colons", "--fingerprint", fingerprint], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (!listed.includes(`fpr:::::::::${fingerprint}:`))
      throw new Error("Checked-in Vireo Maven signing key fingerprint drifted.");
    const verification = execFileSync(
      "gpg",
      ["--batch", "--status-fd", "1", "--homedir", directory, "--verify", signaturePath, pomPath],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    if (!verification.includes(`[GNUPG:] VALIDSIG ${fingerprint} `))
      throw new Error("Maven signature was not made by the pinned Vireo signer.");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256")
    .update(typeof value === "string" || value instanceof Uint8Array ? value : stableJson(value))
    .digest("hex");
}

export async function readBoundedBytes(response, label, maximum) {
  const length = Number(response.headers?.get?.("content-length") ?? 0);
  if (Number.isFinite(length) && length > maximum) throw new Error(`${label} exceeds its bounded response size.`);
  if (!response.body?.getReader) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maximum) throw new Error(`${label} exceeds its bounded response size.`);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        await reader.cancel("bounded response size exceeded");
        throw new Error(`${label} exceeds its bounded response size.`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock?.();
  }
  return Buffer.concat(chunks, total);
}

export function compareVersions(left, right) {
  const leftParts = String(left).split(".").map(Number);
  const rightParts = String(right).split(".").map(Number);
  if (!stableVersion.test(left) || !stableVersion.test(right))
    throw new Error("Versions must be stable semantic versions.");
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
}

function problem(condition, message, problems) {
  if (!condition) problems.push(message);
}

export function validateAdoptionPolicy(policy) {
  const problems = [];
  problem(policy?.schemaVersion === 1, "template adoption policy schemaVersion must equal 1", problems);
  problem(
    policy?.templateRepository === "vireocodedev/vireo-template",
    "template repository must be vireocodedev/vireo-template",
    problems,
  );
  problem(
    policy?.templateRepositoryUrl === "https://github.com/vireocodedev/vireo-template",
    "template repository URL must be canonical",
    problems,
  );
  problem(policy?.releaseTagPrefix === "starter-template@", "template release tag prefix must be exact", problems);
  problem(
    policy?.releaseManifestAsset === "template-release-manifest.json",
    "template release manifest asset must be exact",
    problems,
  );
  problem(
    /^automation\/template-$/u.test(policy?.adoptionBranchPrefix ?? ""),
    "adoption branch prefix is invalid",
    problems,
  );
  problem(policy?.prMarkerPrefix === "vireo-template-adoption", "PR marker prefix must be exact", problems);
  problem(
    JSON.stringify(policy?.requiredNpmPackages) === JSON.stringify(requiredNpmPackages),
    "required npm package set is not exact",
    problems,
  );
  problem(
    JSON.stringify(policy?.requiredMavenModules) === JSON.stringify(requiredMavenModules),
    "required Maven module set is not exact",
    problems,
  );
  problem(
    JSON.stringify(policy?.requiredTemplateBoundFiles) === JSON.stringify(requiredTemplateBoundFiles),
    "required Template bound file set is not exact",
    problems,
  );
  problem(policy?.polling?.maximumReleasePages === 5, "Template polling maximumReleasePages must equal 5", problems);
  problem(
    JSON.stringify(policy?.automaticPublication) ===
      JSON.stringify({
        onlyPackage: "create-vireo",
        requireExactImmutableTemplate: true,
        requirePublishedLibraries: true,
        requirePublishedMaven: true,
      }),
    "automatic Template publication policy must be exact",
    problems,
  );
  return problems;
}

function normalizeNpmCoordinates(manifest) {
  const source = manifest?.artifacts?.npm ?? manifest?.adoption?.npm ?? manifest?.npm;
  const entries = Array.isArray(source)
    ? source
    : source && typeof source === "object"
      ? Object.entries(source).map(([name, value]) =>
          typeof value === "string" ? { name, version: value } : { name, ...value },
        )
      : [];
  return entries.map(entry => ({
    name: entry?.name,
    version: entry?.version,
    integrity: entry?.integrity,
    attestationBundleSha256: entry?.attestationBundleSha256,
  }));
}

function normalizeMaven(manifest) {
  const source = manifest?.artifacts?.maven ?? manifest?.adoption?.maven ?? manifest?.maven;
  if (source?.modules && !Array.isArray(source.modules))
    return { ...source, moduleDigests: source.modules, modules: Object.keys(source.modules) };
  return source;
}

export async function validatePublicDependencies({ plan, fetchResponse = fetch, audit = auditHistoricalCandidates }) {
  for (const entry of plan.npm ?? []) {
    const endpoint = `https://registry.npmjs.org/${encodeURIComponent(entry.name)}/${encodeURIComponent(entry.version)}`;
    const response = await fetchResponse(endpoint, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`${entry.name}@${entry.version} is not publicly available on npm.`);
    const raw = await readBoundedBytes(response, `${entry.name}@${entry.version} registry metadata`, 512 * 1024);
    const metadata = JSON.parse(raw.toString("utf8"));
    if (
      metadata?.name !== entry.name ||
      metadata?.version !== entry.version ||
      metadata?.dist?.integrity !== entry.integrity
    )
      throw new Error(`${entry.name}@${entry.version} does not match its immutable Template manifest integrity.`);
    if (!metadata?.dist?.attestations?.url)
      throw new Error(`${entry.name}@${entry.version} has no public npm attestation metadata.`);
  }
  const provenance = await audit(
    plan.npm.map(entry => ({
      name: entry.name,
      version: entry.version,
      coordinate: `${entry.name}@${entry.version}`,
      integrity: entry.integrity,
      registryIntegrity: entry.integrity,
    })),
  );
  for (const entry of plan.npm ?? []) {
    const audited = provenance?.get?.(`${entry.name}@${entry.version}`);
    if (!Array.isArray(audited?.bundles) || audited.bundles.length === 0)
      throw new Error(`${entry.name}@${entry.version} has no independently audited npm attestation bundles.`);
    if (sha256(audited.bundles) !== entry.attestationBundleSha256)
      throw new Error(
        `${entry.name}@${entry.version} audited attestation bundles do not match the immutable Template manifest.`,
      );
  }
  for (const module of plan.maven?.modules ?? []) {
    const endpoint = `https://repo1.maven.org/maven2/${plan.maven.group.replaceAll(".", "/")}/${module}/${plan.maven.version}/${module}-${plan.maven.version}.pom`;
    const response = await fetchResponse(endpoint, { redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`com.vireocode:${module}:${plan.maven.version} is not public on Maven Central.`);
    const bytes = await readBoundedBytes(response, `${module} Maven POM`, 512 * 1024);
    const expected = plan.maven.moduleDigests?.[module]?.sha256;
    if (sha256(bytes) !== expected)
      throw new Error(`Maven Central POM digest does not match the immutable Template manifest for ${module}.`);
    const checksum = await fetchResponse(`${endpoint}.sha256`, {
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (
      !checksum.ok ||
      (await readBoundedBytes(checksum, `${module} Maven checksum`, 8 * 1024))
        .toString("utf8")
        .trim()
        .split(/\s/u)[0] !== expected
    )
      throw new Error(`Maven Central SHA-256 sidecar is not exact for ${module}.`);
    const signature = await fetchResponse(`${endpoint}.asc`, {
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    const signatureBytes = signature.ok
      ? await readBoundedBytes(signature, `${module} Maven signature`, 64 * 1024)
      : Buffer.alloc(0);
    if (
      !signature.ok ||
      signatureBytes.length < 32 ||
      sha256(signatureBytes) !== plan.maven.moduleDigests?.[module]?.signatureSha256
    )
      throw new Error(`Maven Central detached signature is missing for ${module}.`);
    verifyMavenSignature({ pom: bytes, signature: signatureBytes });
  }
  return true;
}

export function validateImmutableTemplateRelease({ release, tag, manifest, policy, current }) {
  const problems = [...validateAdoptionPolicy(policy)];
  const version = release?.tag_name?.startsWith(policy?.releaseTagPrefix ?? "")
    ? release.tag_name.slice(policy.releaseTagPrefix.length)
    : null;
  problem(
    release?.draft === false && release?.prerelease === false,
    "Template release must be published and non-prerelease",
    problems,
  );
  problem(release?.immutable === true, "Template release must be immutable", problems);
  problem(stableVersion.test(version ?? ""), "Template release tag must contain a stable version", problems);
  problem(
    compareVersions(version ?? "0.0.0", current?.template?.version ?? "0.0.0") > 0,
    "Template release must be a strict successor",
    problems,
  );
  problem(
    tag?.name === release?.tag_name && tag?.annotated === true && commit.test(tag?.commit ?? ""),
    "Template tag must be annotated and peel to a commit",
    problems,
  );
  problem(manifest?.schemaVersion === 2, "A successor Template release manifest must use schemaVersion 2", problems);
  for (const [key, expected] of Object.entries({
    version,
    tag: release?.tag_name,
    repository: policy?.templateRepository,
    releaseUrl: release?.html_url,
    commit: tag?.commit,
    immutableReleasesRequired: true,
  })) {
    problem(manifest?.[key] === expected, `Template release manifest ${key} is not exact`, problems);
  }
  problem(
    manifest?.createVireoVersion === version,
    "Template manifest create-vireo version must equal Template version",
    problems,
  );
  problem(
    /^npm-\d+\.\d+\.\d+_jvm-\d+\.\d+\.\d+$/u.test(manifest?.ecosystemRelease ?? ""),
    "Template manifest ecosystem release is invalid",
    problems,
  );
  const packages = normalizeNpmCoordinates(manifest);
  const names = new Set(packages.map(entry => entry.name));
  problem(
    packages.length === policy?.requiredNpmPackages?.length &&
      policy.requiredNpmPackages.every(name => names.has(name)),
    "Template manifest must bind exactly the seven Vireo library coordinates",
    problems,
  );
  for (const entry of packages) {
    problem(
      stableVersion.test(entry.version ?? ""),
      `Template manifest has invalid npm version for ${entry.name ?? "<missing>"}`,
      problems,
    );
    problem(
      typeof entry.integrity === "string" && /^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(entry.integrity),
      `Template manifest has no SHA-512 integrity for ${entry.name ?? "<missing>"}`,
      problems,
    );
    problem(
      /^[a-f0-9]{64}$/u.test(entry.attestationBundleSha256 ?? ""),
      `Template manifest has no exact attestation bundle digest for ${entry.name ?? "<missing>"}`,
      problems,
    );
  }
  const maven = normalizeMaven(manifest);
  problem(
    typeof maven?.group === "string" && maven.group === "com.vireocode",
    "Template manifest Maven group must be com.vireocode",
    problems,
  );
  problem(stableVersion.test(maven?.version ?? ""), "Template manifest Maven version is invalid", problems);
  problem(
    Array.isArray(maven?.modules) &&
      JSON.stringify([...maven.modules].sort()) === JSON.stringify([...(policy?.requiredMavenModules ?? [])].sort()),
    "Template manifest Maven modules are not exact",
    problems,
  );
  for (const module of policy?.requiredMavenModules ?? []) {
    problem(
      /^[a-f0-9]{64}$/u.test(maven?.moduleDigests?.[module]?.sha256 ?? "") &&
        /^[a-f0-9]{64}$/u.test(maven?.moduleDigests?.[module]?.signatureSha256 ?? ""),
      `Template manifest Maven module ${module} must have exact POM and signature SHA-256 digests`,
      problems,
    );
  }
  problem(
    manifest?.artifacts?.coordinateDigest ===
      sha256(JSON.stringify({ npm: manifest?.artifacts?.npm, maven: manifest?.artifacts?.maven })),
    "Template manifest artifact coordinate digest is not exact",
    problems,
  );
  const files = manifest?.artifacts?.files;
  const sortedFiles =
    files && typeof files === "object"
      ? Object.fromEntries(Object.entries(files).sort(([left], [right]) => left.localeCompare(right)))
      : undefined;
  problem(
    sortedFiles &&
      JSON.stringify(Object.keys(sortedFiles)) ===
        JSON.stringify([...(policy.requiredTemplateBoundFiles ?? [])].sort()) &&
      Object.values(sortedFiles).every(value => /^[a-f0-9]{64}$/u.test(value)) &&
      manifest.artifacts.fileDigest === sha256(JSON.stringify(sortedFiles)),
    "Template manifest must bind exactly the required Template contract files with a canonical sorted digest",
    problems,
  );
  return { problems, version, npm: packages, maven };
}

export function selectSuccessorRelease({ releases, currentVersion, policy }) {
  if (!Array.isArray(releases)) throw new Error("Template release listing must be an array.");
  const candidates = releases.filter(release => {
    const tag = release?.tag_name;
    if (typeof tag !== "string" || !tag.startsWith(policy.releaseTagPrefix)) return false;
    const version = tag.slice(policy.releaseTagPrefix.length);
    return stableVersion.test(version) && compareVersions(version, currentVersion) > 0;
  });
  const versions = new Map();
  for (const release of candidates) {
    const version = release.tag_name.slice(policy.releaseTagPrefix.length);
    if (!versions.has(version)) versions.set(version, []);
    versions.get(version).push(release);
  }
  if ([...versions.values()].some(items => items.length !== 1))
    throw new Error("Template releases contain duplicate successor tags.");
  const sorted = [...versions.entries()].sort(([left], [right]) => compareVersions(left, right));
  return sorted[0]?.[1][0] ?? null;
}

export function planTemplateAdoption({ ecosystem, intent, policy, releases, tag, manifest, rawManifestDigest }) {
  const current = ecosystem?.current;
  if (!current?.template?.version || !commit.test(current.template.commit ?? ""))
    return { action: "fail", reason: "Vireo ecosystem contract lacks an exact current Template identity" };
  const policyProblems = validateAdoptionPolicy(policy);
  if (policyProblems.length) return { action: "fail", reason: policyProblems.join("; ") };
  if (intent?.status !== "adopted" || intent?.template?.commit !== current.template.commit)
    return { action: "fail", reason: "Template adoption receipt must exactly describe the current ecosystem Template" };
  let successor;
  try {
    successor = selectSuccessorRelease({ releases, currentVersion: current.template.version, policy });
  } catch (error) {
    return { action: "fail", reason: error.message };
  }
  if (!successor) return { action: "no-op", reason: "No newer public Template release exists" };
  const validation = validateImmutableTemplateRelease({ release: successor, tag, manifest, policy, current });
  if (validation.problems.length) return { action: "fail", reason: validation.problems.join("; ") };
  if (!/^[a-f0-9]{64}$/u.test(rawManifestDigest ?? ""))
    return { action: "fail", reason: "Template release plan must retain the raw manifest asset SHA-256." };
  const releaseManifestDigest = rawManifestDigest;
  return {
    action: "stage",
    version: validation.version,
    tag: successor.tag_name,
    commit: tag.commit,
    releaseUrl: successor.html_url,
    ecosystemRelease: manifest.ecosystemRelease,
    releaseManifestDigest,
    npm: validation.npm,
    maven: validation.maven,
  };
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  try {
    return JSON.parse((await readBoundedBytes(response, `GitHub API ${url}`, 512 * 1024)).toString("utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`${url} returned invalid JSON.`, { cause: error });
    throw error;
  }
}

export async function readPublicTemplateState({ policy, fetchJson = githubJson }) {
  const pages = [];
  for (let page = 1; page <= policy.polling.maximumReleasePages; page += 1) {
    const items = await fetchJson(
      `https://api.github.com/repos/${policy.templateRepository}/releases?per_page=100&page=${page}`,
    );
    if (!Array.isArray(items)) throw new Error("Template release listing is invalid.");
    pages.push(...items);
    if (items.length < 100) break;
  }
  return { releases: pages };
}

function usage() {
  return "Usage: node scripts/template-release-adoption-state.mjs [--json] [--dry-run] [--help]";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  if (args.has("--help")) console.log(usage());
  else if ([...args].some(argument => !["--json", "--dry-run"].includes(argument))) throw new Error(usage());
  else {
    const policy = JSON.parse(readFileSync(resolve(root, "contracts/template-adoption-policy.json"), "utf8"));
    const ecosystem = JSON.parse(readFileSync(resolve(root, "contracts/ecosystem-release-contract.json"), "utf8"));
    const intent = JSON.parse(readFileSync(resolve(root, "contracts/template-adoption-intent.json"), "utf8"));
    const { releases } = await readPublicTemplateState({ policy });
    const successor = selectSuccessorRelease({ releases, currentVersion: ecosystem.current.template.version, policy });
    const result = successor
      ? {
          action: "inspect",
          tag: successor.tag_name,
          reason: "Candidate requires tag and manifest retrieval by the workflow.",
        }
      : planTemplateAdoption({ ecosystem, intent, policy, releases, tag: null, manifest: null });
    console.log(args.has("--json") ? JSON.stringify(result) : `${result.action}: ${result.reason ?? result.tag}`);
  }
}
