import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputArgument = process.argv[2];

if (!outputArgument || process.argv.length !== 3) {
  console.error("Usage: node scripts/generate-release-evidence.mjs <new-output-directory>");
  process.exit(2);
}

const outputRoot = resolve(repoRoot, outputArgument);
if (existsSync(outputRoot)) {
  throw new Error(`Release evidence output already exists: ${outputRoot}`);
}

function command(commandName, args, options = {}) {
  const output = execFileSync(commandName, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  });
  return typeof output === "string" ? output.trim() : "";
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walkFiles(path) : [path];
    });
}

function digest(path, algorithm, encoding = "hex") {
  return createHash(algorithm).update(readFileSync(path)).digest(encoding);
}

function subjectKind(path) {
  const normalized = relative(outputRoot, path).replaceAll("\\", "/");
  if (normalized.startsWith("npm/") && normalized.endsWith(".tgz")) return "npm-package";
  if (normalized === "sbom/npm.cdx.json") return "cyclonedx-sbom";
  if (!normalized.startsWith("maven/") || /\.(?:md5|sha1|sha256|sha512)$/u.test(normalized)) return undefined;
  if (normalized.includes("/maven-metadata.xml")) return undefined;
  return "maven-artifact";
}

const initialStatus = command("git", ["status", "--porcelain"]);
if (initialStatus !== "") {
  throw new Error("Release evidence must be generated from a clean worktree.");
}

const commit = command("git", ["rev-parse", "HEAD"]);
if (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== commit) {
  throw new Error(`GITHUB_SHA ${process.env.GITHUB_SHA} does not match checked-out commit ${commit}.`);
}

const npmRoot = join(outputRoot, "npm");
const mavenRoot = join(outputRoot, "maven");
const sbomRoot = join(outputRoot, "sbom");
mkdirSync(npmRoot, { recursive: true });
mkdirSync(mavenRoot, { recursive: true });
mkdirSync(sbomRoot, { recursive: true });

console.log("Building and packing npm release candidates...");
command("corepack", ["npm", "run", "build"], { stdio: "inherit" });
command("corepack", ["npm", "pack", "--workspaces", "--pack-destination", npmRoot, "--ignore-scripts", "--silent"], {
  stdio: "ignore",
});

console.log("Generating the npm CycloneDX SBOM...");
const npmSbomPath = join(sbomRoot, "npm.cdx.json");
const npmSbomDescriptor = openSync(npmSbomPath, "w");
try {
  execFileSync("corepack", ["npm", "sbom", "--sbom-format", "cyclonedx"], {
    cwd: repoRoot,
    stdio: ["ignore", npmSbomDescriptor, "inherit"],
  });
} finally {
  closeSync(npmSbomDescriptor);
}
const npmSbom = JSON.parse(readFileSync(npmSbomPath, "utf8"));
if (npmSbom.bomFormat !== "CycloneDX" || !Array.isArray(npmSbom.components) || npmSbom.components.length === 0) {
  throw new Error("npm did not produce a populated CycloneDX SBOM.");
}

console.log("Publishing JVM release candidates to the evidence repository...");
command(
  join(repoRoot, "jvm", "gradlew"),
  [
    "-p",
    join(repoRoot, "jvm"),
    `-PvireoTestRepository=${mavenRoot}`,
    "publishMavenPublicationToVerificationRepository",
    "--no-build-cache",
  ],
  { stdio: "inherit" },
);
const jvmVersion = readFileSync(join(repoRoot, "jvm", "gradle.properties"), "utf8").match(/^version=(.+)$/mu)?.[1];
if (!jvmVersion) throw new Error("Could not read the JVM release version.");
command(join(repoRoot, "jvm", "scripts", "audit-publication-artifacts.sh"), [mavenRoot, jvmVersion], {
  stdio: "inherit",
});

const subjects = walkFiles(outputRoot)
  .map(path => ({ path, kind: subjectKind(path) }))
  .filter(subject => subject.kind)
  .map(({ path, kind }) => ({
    path: relative(outputRoot, path).replaceAll("\\", "/"),
    kind,
    bytes: statSync(path).size,
    sha256: digest(path, "sha256"),
    sha512: digest(path, "sha512"),
  }));

const npmSubjectCount = subjects.filter(subject => subject.kind === "npm-package").length;
const mavenSubjectCount = subjects.filter(subject => subject.kind === "maven-artifact").length;
if (npmSubjectCount !== 7) throw new Error(`Expected seven npm package subjects, found ${npmSubjectCount}.`);
if (mavenSubjectCount !== 27) throw new Error(`Expected 27 versioned Maven subjects, found ${mavenSubjectCount}.`);

const manifest = {
  schemaVersion: 1,
  evidenceClass: "unsigned-release-candidate",
  source: {
    repository: "https://github.com/vireocodedev/starter",
    commit,
    committedAt: command("git", ["show", "-s", "--format=%cI", commit]),
    clean: true,
  },
  toolchain: {
    node: process.version,
    npm: command("corepack", ["npm", "--version"]),
    java: command("java", ["--version"], { stdio: ["ignore", "pipe", "pipe"] }).split("\n")[0],
    gradle: command(join(repoRoot, "jvm", "gradlew"), ["-p", join(repoRoot, "jvm"), "--version"]).match(
      /^Gradle (.+)$/mu,
    )?.[1],
  },
  versions: {
    npm: Object.fromEntries(
      readdirSync(join(repoRoot, "packages"), { withFileTypes: true })
        .filter(entry => entry.isDirectory() && existsSync(join(repoRoot, "packages", entry.name, "package.json")))
        .map(entry => JSON.parse(readFileSync(join(repoRoot, "packages", entry.name, "package.json"), "utf8")))
        .filter(packageManifest => !packageManifest.private)
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(packageManifest => [packageManifest.name, packageManifest.version]),
    ),
    maven: { group: "com.vireocode", version: jvmVersion },
  },
  subjects,
  controls: {
    sourceMaps: "contracts/package-portability-policy.json",
    npmSbom: "sbom/npm.cdx.json",
    checksumAlgorithm: ["sha256", "sha512"],
    signature: "absent-in-dry-run",
    publicationRequiresSignedProvenance: true,
    immutableVersionPolicy: "correct-forward-only",
  },
};

writeFileSync(join(outputRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(outputRoot, "checksums.sha256"),
  `${subjects.map(subject => `${subject.sha256}  ${subject.path}`).join("\n")}\n`,
);

console.log(
  `Release evidence generated for ${subjects.length} subjects (${npmSubjectCount} npm, ${mavenSubjectCount} Maven, one SBOM).`,
);
console.log(`Output: ${outputRoot}`);
console.log("This dry-run evidence is unsigned; stable publication still requires registry-backed signed provenance.");
