import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputArgument = process.argv[2];
if (!outputArgument || process.argv.length !== 3) {
  console.error("Usage: node scripts/collect-public-release-evidence.mjs <new-output-directory>");
  process.exit(2);
}

const outputRoot = resolve(repositoryRoot, outputArgument);
if (existsSync(outputRoot)) throw new Error(`Public release evidence already exists: ${outputRoot}`);

const policy = JSON.parse(
  readFileSync(join(repositoryRoot, "contracts", "public-release-attestation-policy.json"), "utf8"),
);
if (policy.schemaVersion !== 1) throw new Error(`Unsupported attestation policy schema ${policy.schemaVersion}`);

const attempts = positiveInteger(process.env.VIREO_PUBLIC_EVIDENCE_ATTEMPTS, 20);
const intervalMs = positiveInteger(process.env.VIREO_PUBLIC_EVIDENCE_INTERVAL_MS, 15_000);
const npmSubjectsRoot = join(outputRoot, "subjects", "npm");
const mavenSubjectsRoot = join(outputRoot, "subjects", "maven");
const sbomRoot = join(outputRoot, "sbom");
mkdirSync(npmSubjectsRoot, { recursive: true });
mkdirSync(mavenSubjectsRoot, { recursive: true });
mkdirSync(sbomRoot, { recursive: true });

let complete = false;
process.on("exit", () => {
  if (!complete && existsSync(outputRoot)) rmSync(outputRoot, { recursive: true, force: true });
});

function positiveInteger(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`Expected a positive integer, found ${value}`);
  return parsed;
}

function command(commandName, args, options = {}) {
  const result = execFileSync(commandName, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  });
  return typeof result === "string" ? result.trim() : "";
}

function digest(bytes, algorithm, encoding = "hex") {
  return createHash(algorithm).update(bytes).digest(encoding);
}

function normalizedPath(path) {
  return relative(repositoryRoot, path).replaceAll("\\", "/");
}

async function pause(milliseconds) {
  await new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
}

async function fetchRequired(url, accept = "application/octet-stream") {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { accept } });
    if (response.ok) return response;
    const retryable =
      response.status === 404 || response.status === 408 || response.status === 429 || response.status >= 500;
    if (!retryable || attempt === attempts) {
      throw new Error(`${url} returned HTTP ${response.status} after ${attempt} attempt(s)`);
    }
    console.log(`${url} returned HTTP ${response.status}; retrying ${attempt}/${attempts} after ${intervalMs} ms.`);
    await pause(intervalMs);
  }
  throw new Error(`Could not fetch ${url}`);
}

function assertCycloneDx(path, label) {
  const sbom = JSON.parse(readFileSync(path, "utf8"));
  if (sbom.bomFormat !== "CycloneDX" || !Array.isArray(sbom.components) || sbom.components.length === 0) {
    throw new Error(`${label} is not a populated CycloneDX SBOM.`);
  }
}

console.log("Generating current npm and JVM CycloneDX SBOMs...");
const npmSbomPath = join(sbomRoot, "npm.cdx.json");
writeFileSync(npmSbomPath, `${command("corepack", ["npm", "sbom", "--sbom-format", "cyclonedx"])}\n`);
assertCycloneDx(npmSbomPath, "npm SBOM");

command(
  join(repositoryRoot, "jvm", "gradlew"),
  ["-p", join(repositoryRoot, "jvm"), "cyclonedxBom", "--no-build-cache"],
  { stdio: "inherit" },
);
const jvmSbomPath = join(sbomRoot, "jvm.cdx.json");
copyFileSync(join(repositoryRoot, "jvm", "build", "reports", "cyclonedx", "bom.json"), jvmSbomPath);
assertCycloneDx(jvmSbomPath, "JVM SBOM");

console.log("Downloading exact public npm tarballs...");
const npmSubjects = [];
for (const expected of policy.npm.packages) {
  const manifest = JSON.parse(
    readFileSync(join(repositoryRoot, "packages", expected.directory, "package.json"), "utf8"),
  );
  if (manifest.name !== expected.name || manifest.private === true) {
    throw new Error(`${expected.directory} does not declare public package ${expected.name}`);
  }
  const coordinate = `${manifest.name}@${manifest.version}`;
  const metadataUrl = `${policy.npm.registry}/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`;
  const metadata = await (await fetchRequired(metadataUrl, "application/json")).json();
  if (metadata.name !== manifest.name || metadata.version !== manifest.version) {
    throw new Error(`${coordinate} returned mismatched npm metadata`);
  }
  if (!metadata.dist?.tarball?.startsWith(`${policy.npm.registry}/`) || !metadata.dist?.integrity) {
    throw new Error(`${coordinate} has incomplete npm distribution metadata`);
  }
  if (!metadata.dist?.attestations?.url) throw new Error(`${coordinate} has no npm registry provenance attestation`);

  const bytes = Buffer.from(await (await fetchRequired(metadata.dist.tarball)).arrayBuffer());
  const [integrityAlgorithm, integrityValue] = metadata.dist.integrity.split("-", 2);
  if (!integrityAlgorithm || !integrityValue || digest(bytes, integrityAlgorithm, "base64") !== integrityValue) {
    throw new Error(`${coordinate} tarball does not match npm registry integrity`);
  }
  const fileName = `${manifest.name.slice(1).replace("/", "-")}-${manifest.version}.tgz`;
  const path = join(npmSubjectsRoot, fileName);
  writeFileSync(path, bytes);
  npmSubjects.push({
    ecosystem: "npm",
    name: manifest.name,
    version: manifest.version,
    coordinate,
    path: normalizedPath(path),
    url: metadata.dist.tarball,
    provenance: metadata.dist.attestations.url,
    bytes: statSync(path).size,
    sha256: digest(bytes, "sha256"),
    sha512: digest(bytes, "sha512"),
    registryIntegrity: metadata.dist.integrity,
  });
}

console.log("Downloading exact public Maven Central artifacts...");
const gradleProperties = readFileSync(join(repositoryRoot, "jvm", "gradle.properties"), "utf8");
const mavenVersion = gradleProperties.match(/^version=(.+)$/mu)?.[1];
if (!mavenVersion) throw new Error("Could not read the JVM version");
const groupPath = policy.maven.group.replaceAll(".", "/");
const mavenSubjects = [];
for (const module of policy.maven.modules) {
  for (const artifact of module.artifacts) {
    const fileName = `${module.name}-${mavenVersion}${artifact.classifier}.${artifact.extension}`;
    const url = `${policy.maven.registry}/${groupPath}/${module.name}/${mavenVersion}/${fileName}`;
    const bytes = Buffer.from(await (await fetchRequired(url)).arrayBuffer());
    const registryChecksum = (await (await fetchRequired(`${url}.sha256`, "text/plain")).text())
      .trim()
      .split(/\s+/u)[0];
    const sha256 = digest(bytes, "sha256");
    if (!/^[0-9a-f]{64}$/u.test(registryChecksum) || registryChecksum !== sha256) {
      throw new Error(
        `${policy.maven.group}:${module.name}:${mavenVersion} ${fileName} failed Central SHA-256 verification`,
      );
    }
    const path = join(mavenSubjectsRoot, fileName);
    writeFileSync(path, bytes);
    mavenSubjects.push({
      ecosystem: "maven",
      coordinate: `${policy.maven.group}:${module.name}:${mavenVersion}`,
      path: normalizedPath(path),
      url,
      bytes: statSync(path).size,
      sha256,
      sha512: digest(bytes, "sha512"),
      registrySha256: registryChecksum,
    });
  }
}

if (npmSubjects.length !== policy.npm.expectedSubjectCount) {
  throw new Error(`Expected ${policy.npm.expectedSubjectCount} npm subjects, found ${npmSubjects.length}`);
}
if (mavenSubjects.length !== policy.maven.expectedSubjectCount) {
  throw new Error(`Expected ${policy.maven.expectedSubjectCount} Maven subjects, found ${mavenSubjects.length}`);
}

function writeChecksums(name, subjects) {
  const path = join(outputRoot, name);
  const rows = subjects
    .toSorted((left, right) => left.path.localeCompare(right.path))
    .map(subject => `${subject.sha256}  ${subject.path}`);
  writeFileSync(path, `${rows.join("\n")}\n`);
  return normalizedPath(path);
}

const manifest = {
  schemaVersion: policy.schemaVersion,
  evidenceClass: "public-registry-subjects-awaiting-signed-sbom-attestation",
  recordedAt: new Date().toISOString(),
  source: {
    repository: `https://github.com/${policy.repository}`,
    commit: command("git", ["rev-parse", "HEAD"]),
    clean: command("git", ["status", "--porcelain"]) === "",
  },
  versions: {
    npm: Object.fromEntries(npmSubjects.map(subject => [subject.name, subject.version])),
    maven: { group: policy.maven.group, version: mavenVersion },
  },
  sboms: {
    npm: normalizedPath(npmSbomPath),
    maven: normalizedPath(jvmSbomPath),
  },
  checksumFiles: {
    npm: writeChecksums("npm-subjects.sha256", npmSubjects),
    maven: writeChecksums("maven-subjects.sha256", mavenSubjects),
  },
  subjects: [...npmSubjects, ...mavenSubjects],
};
writeFileSync(join(outputRoot, "public-release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

complete = true;
console.log(
  `Collected ${npmSubjects.length} npm and ${mavenSubjects.length} Maven Central exact-byte subjects with two populated SBOMs.`,
);
console.log(`Output: ${outputRoot}`);
