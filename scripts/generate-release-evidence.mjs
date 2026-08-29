import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runLicensePolicy } from "./third-party-license-policy.mjs";
import { validateReleaseSbomManifest } from "./lib/release-sbom-evidence.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(join(repoRoot, "contracts", "public-release-attestation-policy.json"), "utf8"));
const outputArgument = process.argv[2];

if (!outputArgument || process.argv.length !== 3) {
  console.error("Usage: node scripts/generate-release-evidence.mjs <new-output-directory>");
  process.exit(2);
}

const outputRoot = resolve(repoRoot, outputArgument);
if (existsSync(outputRoot)) {
  throw new Error(`Release evidence output already exists: ${outputRoot}`);
}

let complete = false;
process.on("exit", () => {
  if (!complete && existsSync(outputRoot)) rmSync(outputRoot, { recursive: true, force: true });
});

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
const npmPackRoot = mkdtempSync(join(tmpdir(), "vireo-release-pack-"));
try {
  command(
    "corepack",
    ["npm", "pack", "--workspaces", "--pack-destination", npmPackRoot, "--ignore-scripts", "--silent"],
    {
      env: { ...process.env, npm_config_cache: join(npmPackRoot, "npm-cache") },
      stdio: "ignore",
    },
  );
  for (const tarball of readdirSync(npmPackRoot).filter(file => file.endsWith(".tgz"))) {
    copyFileSync(join(npmPackRoot, tarball), join(npmRoot, tarball));
  }
} finally {
  rmSync(npmPackRoot, { recursive: true, force: true });
}

function packedManifest(tarball) {
  return JSON.parse(command("tar", ["-xOf", tarball, "package/package.json"]));
}

function generatePackedNpmSbom(tarball, destination, expected) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "vireo-sbom-"));
  try {
    command("tar", ["-xzf", tarball, "-C", temporaryRoot]);
    const packageRoot = join(temporaryRoot, "package");
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
    if (manifest.name !== expected.name || manifest.version !== expected.version) {
      throw new Error(
        `${tarball} contains ${manifest.name}@${manifest.version}, expected ${expected.name}@${expected.version}`,
      );
    }
    // npm publishes devDependencies in package.json even though they are not
    // part of the install contract. Resolve a runtime projection of the exact
    // packed manifest so a dependency that is also used during development is
    // not incorrectly omitted from the release SBOM.
    delete manifest.devDependencies;
    writeFileSync(join(packageRoot, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    command(
      "corepack",
      ["npm", "install", "--package-lock-only", "--ignore-scripts", "--omit=dev", "--workspaces=false"],
      { cwd: packageRoot, env: { ...process.env, npm_config_cache: join(temporaryRoot, "npm-cache") } },
    );
    const descriptor = openSync(destination, "w");
    try {
      execFileSync(
        "corepack",
        ["npm", "sbom", "--package-lock-only", "--omit=dev", "--sbom-format", "cyclonedx", "--sbom-type", "library"],
        { cwd: packageRoot, stdio: ["ignore", descriptor, "inherit"] },
      );
    } finally {
      closeSync(descriptor);
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

console.log("Generating one CycloneDX SBOM from each packed npm package...");
const npmCoordinates = new Map();
for (const tarball of readdirSync(npmRoot).filter(file => file.endsWith(".tgz"))) {
  const path = join(npmRoot, tarball);
  const manifest = packedManifest(path);
  const declared = policy.npm.packages.find(entry => entry.name === manifest.name);
  if (!declared) throw new Error(`${manifest.name} is packed but has no SBOM policy`);
  npmCoordinates.set(`npm/${tarball}`, `${manifest.name}@${manifest.version}`);
  generatePackedNpmSbom(path, join(sbomRoot, `${declared.sbomId}.cdx.json`), manifest);
}

console.log("Publishing JVM release candidates to the evidence repository...");
command(
  join(repoRoot, "jvm", "gradlew"),
  [
    "-p",
    join(repoRoot, "jvm"),
    `-PvireoTestRepository=${mavenRoot}`,
    "publishMavenPublicationToVerificationRepository",
    "cyclonedxBom",
    ...policy.maven.modules.map(module => `:${module.name}:cyclonedxDirectBom`),
    "--no-build-cache",
  ],
  { stdio: "inherit" },
);
const jvmVersion = readFileSync(join(repoRoot, "jvm", "gradle.properties"), "utf8").match(/^version=(.+)$/mu)?.[1];
if (!jvmVersion) throw new Error("Could not read the JVM release version.");
for (const module of policy.maven.modules) {
  copyFileSync(
    join(repoRoot, "jvm", module.name, "build", "reports", "cyclonedx-direct", "bom.json"),
    join(sbomRoot, `${module.sbomId}.cdx.json`),
  );
}
command(join(repoRoot, "jvm", "scripts", "audit-publication-artifacts.sh"), [mavenRoot, jvmVersion], {
  stdio: "inherit",
});

console.log("Evaluating npm and JVM third-party licenses...");
const licenseInventoryPath = join(outputRoot, "licenses", "third-party-license-inventory.json");
runLicensePolicy({
  ecosystem: "all",
  jvmSbom: join(repoRoot, "jvm", "build", "reports", "cyclonedx", "bom.json"),
  output: licenseInventoryPath,
});
const licenseEvidence = {
  path: relative(outputRoot, licenseInventoryPath).replaceAll("\\", "/"),
  bytes: statSync(licenseInventoryPath).size,
  sha256: digest(licenseInventoryPath, "sha256"),
};

const subjects = walkFiles(outputRoot)
  .map(path => ({ path, kind: subjectKind(path) }))
  .filter(subject => subject.kind)
  .map(({ path, kind }) => {
    const normalized = relative(outputRoot, path).replaceAll("\\", "/");
    const module =
      kind === "maven-artifact"
        ? policy.maven.modules.find(entry => normalized.split("/").at(-1).startsWith(`${entry.name}-${jvmVersion}`))
        : undefined;
    return {
      path: normalized,
      kind,
      ecosystem: kind === "npm-package" ? "npm" : "maven",
      coordinate:
        kind === "npm-package" ? npmCoordinates.get(normalized) : `${policy.maven.group}:${module?.name}:${jvmVersion}`,
      bytes: statSync(path).size,
      sha256: digest(path, "sha256"),
      sha512: digest(path, "sha512"),
    };
  });

const npmSubjectCount = subjects.filter(subject => subject.kind === "npm-package").length;
const mavenSubjectCount = subjects.filter(subject => subject.kind === "maven-artifact").length;
if (npmSubjectCount !== policy.npm.expectedSubjectCount)
  throw new Error(`Expected ${policy.npm.expectedSubjectCount} npm package subjects, found ${npmSubjectCount}.`);
if (mavenSubjectCount !== policy.maven.expectedSubjectCount)
  throw new Error(
    `Expected ${policy.maven.expectedSubjectCount} versioned Maven subjects, found ${mavenSubjectCount}.`,
  );

const sboms = [
  ...policy.npm.packages.map(entry => ({
    id: entry.sbomId,
    ecosystem: "npm",
    coordinate: subjects.find(subject => subject.coordinate?.startsWith(`${entry.name}@`))?.coordinate,
    path: `sbom/${entry.sbomId}.cdx.json`,
    checksums: `mappings/${entry.sbomId}.sha256`,
    subjects: subjects.filter(subject => subject.coordinate?.startsWith(`${entry.name}@`)).map(subject => subject.path),
  })),
  ...policy.maven.modules.map(module => ({
    id: module.sbomId,
    ecosystem: "maven",
    coordinate: `${policy.maven.group}:${module.name}:${jvmVersion}`,
    path: `sbom/${module.sbomId}.cdx.json`,
    checksums: `mappings/${module.sbomId}.sha256`,
    subjects: subjects
      .filter(subject => subject.coordinate === `${policy.maven.group}:${module.name}:${jvmVersion}`)
      .map(subject => subject.path),
  })),
];
mkdirSync(join(outputRoot, "mappings"), { recursive: true });
for (const mapping of sboms) {
  writeFileSync(
    join(outputRoot, mapping.checksums),
    `${mapping.subjects.map(path => `${subjects.find(subject => subject.path === path).sha256}  ${path}`).join("\n")}\n`,
  );
}

const manifest = {
  schemaVersion: 2,
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
    maven: { group: policy.maven.group, version: jvmVersion },
  },
  subjects,
  controls: {
    sourceMaps: "contracts/package-portability-policy.json",
    sbomScope: "one-cyclonedx-document-per-publishable-package-or-module",
    thirdPartyLicenses: licenseEvidence,
    checksumAlgorithm: ["sha256", "sha512"],
    signature: "absent-in-dry-run",
    publicationRequiresSignedProvenance: true,
    immutableVersionPolicy: "correct-forward-only",
  },
  sboms,
};

const sbomProblems = validateReleaseSbomManifest(manifest, policy, { root: outputRoot });
if (sbomProblems.length > 0) {
  throw new Error(`Release SBOM evidence is invalid:\n${sbomProblems.map(problem => `- ${problem}`).join("\n")}`);
}

writeFileSync(join(outputRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(outputRoot, "checksums.sha256"),
  `${subjects.map(subject => `${subject.sha256}  ${subject.path}`).join("\n")}\n`,
);

complete = true;

console.log(
  `Release evidence generated for ${subjects.length} subjects (${npmSubjectCount} npm, ${mavenSubjectCount} Maven, ${sboms.length} subject-specific SBOMs, one hashed license inventory).`,
);
console.log(`Output: ${outputRoot}`);
console.log("This dry-run evidence is unsigned; stable publication still requires registry-backed signed provenance.");
