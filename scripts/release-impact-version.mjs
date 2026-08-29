import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const bumpRank = { patch: 1, minor: 2, major: 3 };

export function bumpSemver(version, bump) {
  const match = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u);
  if (!match || !bumpRank[bump]) throw new Error(`Cannot apply ${bump} bump to JVM version ${version}`);
  const [, rawMajor, rawMinor, rawPatch] = match;
  const major = Number(rawMajor);
  const minor = Number(rawMinor);
  const patch = Number(rawPatch);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function applyJvmReleaseImpact(repositoryRoot) {
  const metadataDirectory = join(repositoryRoot, ".release-impact");
  if (!existsSync(metadataDirectory)) return { changed: false, records: [], version: null };
  const policy = JSON.parse(readFileSync(join(repositoryRoot, "contracts", "release-impact-policy.json"), "utf8"));
  const jvmArtifacts = new Set(
    policy.artifacts.filter(artifact => artifact.kind === "jvm").map(artifact => artifact.id),
  );
  const records = readdirSync(metadataDirectory)
    .filter(name => name.endsWith(".json"))
    .sort()
    .map(name => {
      const path = join(metadataDirectory, name);
      return { name, path, value: JSON.parse(readFileSync(path, "utf8")) };
    })
    .filter(entry => entry.value.decision === "release" && entry.value.artifact?.startsWith("jvm:"));
  if (records.length === 0) return { changed: false, records: [], version: null };

  for (const entry of records) {
    if (
      entry.value.schemaVersion !== 1 ||
      !jvmArtifacts.has(entry.value.artifact) ||
      !bumpRank[entry.value.bump] ||
      typeof entry.value.summary !== "string" ||
      entry.value.summary.trim().length < policy.minimumSummaryLength
    ) {
      throw new Error(`${entry.name} is not a valid JVM release-impact record`);
    }
  }
  const bump = records.map(entry => entry.value.bump).sort((left, right) => bumpRank[right] - bumpRank[left])[0];
  const propertiesPath = join(repositoryRoot, "jvm", "gradle.properties");
  const properties = readFileSync(propertiesPath, "utf8");
  const currentVersion = properties.match(/^version=(.+)$/mu)?.[1];
  if (!currentVersion) throw new Error("jvm/gradle.properties has no version");
  const nextVersion = bumpSemver(currentVersion, bump);
  writeFileSync(propertiesPath, properties.replace(/^version=.+$/mu, `version=${nextVersion}`));

  const changelogPath = join(repositoryRoot, "jvm", "CHANGELOG.md");
  const existing = existsSync(changelogPath)
    ? readFileSync(changelogPath, "utf8").trimEnd()
    : "# Vireo JVM changelog\n";
  const entries = records
    .map(entry => `- **${entry.value.artifact.slice(4)}:** ${entry.value.summary.trim()}`)
    .join("\n");
  const headingEnd = existing.indexOf("\n");
  const updated =
    headingEnd < 0
      ? `${existing}\n\n## ${nextVersion}\n\n${entries}\n`
      : `${existing.slice(0, headingEnd)}\n\n## ${nextVersion}\n\n${entries}\n${existing.slice(headingEnd + 1).replace(/^\n*/u, "\n")}`;
  writeFileSync(changelogPath, updated);
  for (const entry of records) unlinkSync(entry.path);
  return { changed: true, records: records.map(entry => entry.name), version: nextVersion, bump };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) {
    console.error("Usage: node scripts/release-impact-version.mjs");
    process.exit(2);
  }
  try {
    const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const result = applyJvmReleaseImpact(repositoryRoot);
    console.log(
      result.changed
        ? `Applied ${result.bump} JVM release impact at ${result.version} from ${result.records.length} record(s).`
        : "No pending JVM release-impact records.",
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
