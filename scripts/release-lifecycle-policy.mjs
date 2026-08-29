import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = path => JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
const isoDate = /^\d{4}-\d{2}-\d{2}$/u;

export function validateReleaseCoordinates(policy, channelName, versions) {
  const problems = [];
  const channel = policy.channels?.[channelName];
  if (!channel) return [`unknown release channel ${channelName}`];
  if (channel.status !== "active") problems.push(`release channel ${channelName} is ${channel.status}`);

  let pattern;
  try {
    pattern = new RegExp(channel.versionPattern, "u");
  } catch {
    return [`release channel ${channelName} has an invalid versionPattern`];
  }
  for (const [coordinate, version] of Object.entries(versions)) {
    if (!pattern.test(version)) {
      problems.push(`${coordinate} version ${version} is not valid for ${channelName}`);
    }
  }
  return problems;
}

export function validateReleaseLifecycle(
  policy = readJson("contracts/release-lifecycle-policy.json"),
  ecosystem = readJson("contracts/ecosystem-release-contract.json"),
) {
  const problems = [];
  if (policy.schemaVersion !== 1) problems.push("release lifecycle schemaVersion must be 1");

  const stable = policy.channels?.stable;
  const prerelease = policy.channels?.prerelease;
  if (stable?.status !== "active") problems.push("stable release channel must be active");
  if (!stable?.npmTag || !prerelease?.npmTag || stable.npmTag === prerelease.npmTag) {
    problems.push("stable and prerelease npm tags must be present and distinct");
  }
  if (prerelease?.mustNotReplaceStableCoordinates !== true) {
    problems.push("prerelease channel must forbid replacing stable coordinates");
  }
  for (const [name, channel] of Object.entries(policy.channels ?? {})) {
    try {
      new RegExp(channel.versionPattern, "u");
    } catch {
      problems.push(`release channel ${name} has an invalid versionPattern`);
    }
  }

  const lines = policy.supportLines ?? [];
  const ids = lines.map(line => line.id);
  if (lines.length === 0 || new Set(ids).size !== ids.length) {
    problems.push("support lines must be non-empty and have unique IDs");
  }
  if (JSON.stringify(policy.transitions?.allowed) !== JSON.stringify(["active->deprecated", "deprecated->eol"])) {
    problems.push("support-line transitions must be active->deprecated then deprecated->eol");
  }
  if (!Number.isInteger(policy.transitions?.minimumDeprecationDays) || policy.transitions.minimumDeprecationDays < 1) {
    problems.push("support-line minimumDeprecationDays must be a positive integer");
  }
  if (policy.transitions?.requireReplacementOrExplicitNone !== true) {
    problems.push("support-line withdrawal must require a replacement or explicit none");
  }
  const releaseIds = new Set([ecosystem.current?.id, ...(ecosystem.compatibility?.sets ?? []).map(set => set.release)]);
  for (const line of lines) {
    if (!["active", "deprecated", "eol"].includes(line.status)) {
      problems.push(`support line ${line.id} has invalid status ${line.status}`);
    }
    for (const field of ["introducedOn", "statusEffectiveOn"]) {
      if (!isoDate.test(line[field] ?? "")) problems.push(`support line ${line.id} requires ISO ${field}`);
    }
    if (line.deprecatedOn !== null && !isoDate.test(line.deprecatedOn ?? "")) {
      problems.push(`support line ${line.id} deprecatedOn must be an ISO date or null`);
    }
    if (line.eolOn !== null && !isoDate.test(line.eolOn ?? "")) {
      problems.push(`support line ${line.id} eolOn must be an ISO date or null`);
    }
    if (line.status === "active" && (line.deprecatedOn !== null || line.eolOn !== null)) {
      problems.push(`active support line ${line.id} cannot have deprecation or EOL dates`);
    }
    if (line.status === "deprecated" && (line.deprecatedOn === null || line.eolOn === null)) {
      problems.push(`deprecated support line ${line.id} requires deprecation and EOL dates`);
    }
    if (line.status === "eol" && (line.deprecatedOn === null || line.eolOn === null)) {
      problems.push(`EOL support line ${line.id} requires deprecation and EOL dates`);
    }
    if (isoDate.test(line.introducedOn ?? "") && isoDate.test(line.statusEffectiveOn ?? "")) {
      if (Date.parse(line.statusEffectiveOn) < Date.parse(line.introducedOn)) {
        problems.push(`support line ${line.id} statusEffectiveOn predates introduction`);
      }
    }
    if (isoDate.test(line.deprecatedOn ?? "") && isoDate.test(line.eolOn ?? "")) {
      const deprecationDays = (Date.parse(line.eolOn) - Date.parse(line.deprecatedOn)) / 86_400_000;
      if (deprecationDays < policy.transitions.minimumDeprecationDays) {
        problems.push(
          `support line ${line.id} provides ${deprecationDays} deprecation days; minimum is ${policy.transitions.minimumDeprecationDays}`,
        );
      }
    }
    if (line.replacement !== "none" && !ids.includes(line.replacement)) {
      problems.push(`support line ${line.id} replacement must identify another line or be explicit none`);
    }
    if (line.replacement === line.id) problems.push(`support line ${line.id} cannot replace itself`);
    if (!releaseIds.has(line.release))
      problems.push(`support line ${line.id} references unknown release ${line.release}`);
    for (const field of ["compatibilityPolicy", "withdrawalGuide"]) {
      if (!line[field] || !existsSync(join(repositoryRoot, line[field]))) {
        problems.push(`support line ${line.id} references missing ${field} ${line[field] ?? ""}`);
      }
    }
    if (!line.maintenanceScope) problems.push(`support line ${line.id} requires maintenanceScope`);
  }
  if (!lines.some(line => line.status === "active" && line.release === ecosystem.current?.id)) {
    problems.push("the current ecosystem release requires one active support line");
  }

  const contractLines = ecosystem.supportLines ?? [];
  const projection = lines.map(({ id, status, release, eolOn }) => ({ id, status, release, eol: eolOn }));
  const ecosystemProjection = contractLines.map(({ id, status, release, eol }) => ({ id, status, release, eol }));
  if (JSON.stringify(projection) !== JSON.stringify(ecosystemProjection)) {
    problems.push("ecosystem supportLines must project exactly from the lifecycle policy");
  }
  for (const name of ["stable", "prerelease"]) {
    const expected = policy.channels?.[name];
    const actual = ecosystem.channels?.[name];
    if (actual?.status !== expected?.status || actual?.npmTag !== expected?.npmTag) {
      problems.push(`ecosystem ${name} channel must project from the lifecycle policy`);
    }
  }

  return {
    problems,
    summary: `Release lifecycle policy passed: ${lines.length} support line(s), stable tag ${stable?.npmTag}, prerelease tag ${prerelease?.npmTag}.`,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) {
    console.error("Usage: node scripts/release-lifecycle-policy.mjs");
    process.exit(2);
  }
  const result = validateReleaseLifecycle();
  if (result.problems.length > 0) {
    console.error("Release lifecycle policy failed:");
    for (const problem of result.problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(result.summary);
}
