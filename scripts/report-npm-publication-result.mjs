import { appendFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { npmPurl, verifyNpmCandidates } from "./publish-verified-npm-candidates.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function requireCoordinateSubset(values, name, allowed) {
  if (!Array.isArray(values) || new Set(values).size !== values.length || values.some(value => !allowed.has(value))) {
    throw new Error(`npm publication result has invalid ${name}.`);
  }
}

function validSha512SRI(value) {
  return /^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(value ?? "");
}

export function publicationResultSummary(result, candidates, expectedCommit) {
  if (result?.schemaVersion !== 1 || result?.source?.commit !== expectedCommit) {
    throw new Error("npm publication result does not match the GitHub source commit.");
  }
  const expected = new Map(candidates.map(candidate => [candidate.coordinate, candidate]));
  if (expected.size !== 8) throw new Error("npm publication result requires eight manifest candidates.");
  const coordinates = new Set(expected.keys());
  if (
    !Array.isArray(result.candidates) ||
    result.candidates.length !== expected.size ||
    new Set(result.candidates.map(item => item?.coordinate)).size !== expected.size
  ) {
    throw new Error("npm publication result does not contain every manifest candidate.");
  }
  for (const item of result.candidates) {
    const candidate = expected.get(item?.coordinate);
    if (!candidate || item.integrity !== candidate.integrity || item.purl !== npmPurl(candidate)) {
      throw new Error(
        `npm publication result candidate differs from retained manifest evidence: ${item?.coordinate ?? "<missing>"}.`,
      );
    }
  }
  requireCoordinateSubset(result.published, "published", coordinates);
  requireCoordinateSubset(result.recoveredTags, "recoveredTags", coordinates);
  requireCoordinateSubset(result.publishedTags, "publishedTags", coordinates);
  if (!Array.isArray(result.auditedHistorical))
    throw new Error("npm publication result has invalid auditedHistorical.");
  const historical = new Map();
  for (const item of result.auditedHistorical) {
    const candidate = expected.get(item?.coordinate);
    if (
      !candidate ||
      historical.has(item.coordinate) ||
      !/^[a-f0-9]{40}$/u.test(item.commit ?? "") ||
      item.purl !== npmPurl(candidate) ||
      !validSha512SRI(item.registryIntegrity) ||
      !Array.isArray(item.bundles) ||
      item.bundles.length === 0
    ) {
      throw new Error(
        `npm publication result has invalid audited historical provenance: ${item?.coordinate ?? "<missing>"}.`,
      );
    }
    historical.set(item.coordinate, item);
  }
  const published = new Set(result.published);
  for (const coordinate of historical.keys()) {
    if (published.has(coordinate))
      throw new Error(`npm publication result overlaps published and historical ${coordinate}.`);
  }
  if (published.size + historical.size !== coordinates.size) {
    throw new Error("npm publication result must partition all manifest candidates into published and historical.");
  }
  if (result.recoveredTags.some(coordinate => !historical.has(coordinate))) {
    throw new Error("npm publication result recoveredTags must be historical coordinates.");
  }
  if (result.publishedTags.some(coordinate => !published.has(coordinate))) {
    throw new Error("npm publication result publishedTags must be published coordinates.");
  }
  if (process.env.AUTOMATIC_TEMPLATE_ADOPTION === "true") {
    const allowed = new Set(
      candidates.filter(candidate => candidate.name === "create-vireo").map(candidate => candidate.coordinate),
    );
    if (result.published.some(coordinate => !allowed.has(coordinate))) {
      throw new Error("Automatic Template adoption may publish only the exact create-vireo candidate.");
    }
  }
  return {
    published: result.published.length > 0,
    publishedPackages: result.published,
    recoveredTags: result.recoveredTags,
    publishedTags: result.publishedTags,
    outcome: result.published.length > 0 ? "published" : "recovered",
  };
}

export function writeGitHubOutput(summary, append = line => appendFileSync(process.env.GITHUB_OUTPUT, line)) {
  append(`published=${summary.published}\n`);
  append(`publishedPackages=${JSON.stringify(summary.publishedPackages)}\n`);
  append(`recoveredTags=${JSON.stringify(summary.recoveredTags)}\n`);
  append(`publishedTags=${JSON.stringify(summary.publishedTags)}\n`);
  append(`outcome=${summary.outcome}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = process.argv[2] ?? ".release-evidence/npm-publication-result.json";
  if (process.argv.length > 3) throw new Error("Usage: node scripts/report-npm-publication-result.mjs [result.json]");
  if (!/^[a-f0-9]{40}$/u.test(process.env.GITHUB_SHA ?? ""))
    throw new Error("GITHUB_SHA is required for publication reporting.");
  const resultPath = resolve(repositoryRoot, argument);
  const candidates = verifyNpmCandidates(dirname(resultPath), process.env.GITHUB_SHA);
  const summary = publicationResultSummary(
    JSON.parse(readFileSync(resultPath, "utf8")),
    candidates,
    process.env.GITHUB_SHA,
  );
  if (process.env.GITHUB_OUTPUT) writeGitHubOutput(summary);
  console.log(JSON.stringify(summary));
}
