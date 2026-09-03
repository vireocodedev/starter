import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const sentinelName = "vireo-jvm-release-sentinel.md";
export const sentinelPath = join(".changeset", sentinelName);
// The pinned Changesets action needs a syntactically valid, non-empty file to
// open its ordinary release PR.  The version adapter removes this exact
// untracked trigger before Changesets computes a release plan, so it can never
// create a false npm version or changelog entry.
export const sentinelContents = `---\n"create-vireo": patch\n---\n\nEphemeral JVM-only release trigger; the Vireo version adapter removes it before versioning.\n`;

function pendingJvmReleaseRecords(repositoryRoot) {
  const directory = join(repositoryRoot, ".release-impact");
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter(name => name.endsWith(".json"))
    .sort()
    .filter(name => {
      try {
        const record = JSON.parse(readFileSync(join(directory, name), "utf8"));
        return record?.schemaVersion === 1 && record?.decision === "release" && /^jvm:/u.test(record?.artifact ?? "");
      } catch {
        return false;
      }
    });
}

function realChangesets(repositoryRoot) {
  const directory = join(repositoryRoot, ".changeset");
  return readdirSync(directory)
    .filter(name => name.endsWith(".md") && name !== sentinelName)
    .sort();
}

function tracked(path, repositoryRoot, git = execFileSync) {
  try {
    git("git", ["ls-files", "--error-unmatch", "--", path], {
      cwd: repositoryRoot,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch (error) {
    if (error?.status === 1) return false;
    throw error;
  }
}

export function prepareJvmOnlyReleaseTrigger({ repositoryRoot = root, git = execFileSync } = {}) {
  const absoluteSentinel = join(repositoryRoot, sentinelPath);
  const real = realChangesets(repositoryRoot);
  const records = pendingJvmReleaseRecords(repositoryRoot);
  if (existsSync(absoluteSentinel)) {
    if (tracked(sentinelPath, repositoryRoot, git))
      throw new Error("JVM-only Changesets sentinel must never be committed.");
    if (readFileSync(absoluteSentinel, "utf8") !== sentinelContents)
      throw new Error("JVM-only Changesets sentinel has unexpected contents.");
    throw new Error("JVM-only Changesets sentinel is already present; refusing ambiguous release preparation.");
  }
  if (real.length > 0 || records.length === 0) return { action: "no-op", changesets: real, records };
  writeFileSync(absoluteSentinel, sentinelContents, { flag: "wx" });
  return { action: "created", changesets: [], records, sentinel: sentinelPath };
}

export function consumeJvmOnlyReleaseTrigger({ repositoryRoot = root, git = execFileSync } = {}) {
  const absoluteSentinel = join(repositoryRoot, sentinelPath);
  if (!existsSync(absoluteSentinel)) return false;
  if (tracked(sentinelPath, repositoryRoot, git))
    throw new Error("JVM-only Changesets sentinel must never be committed.");
  if (readFileSync(absoluteSentinel, "utf8") !== sentinelContents)
    throw new Error("JVM-only Changesets sentinel has unexpected contents.");
  unlinkSync(absoluteSentinel);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/prepare-jvm-only-release-trigger.mjs");
  console.log(JSON.stringify(prepareJvmOnlyReleaseTrigger()));
}
