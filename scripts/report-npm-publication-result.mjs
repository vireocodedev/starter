import { appendFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function publicationResultSummary(result) {
  if (result?.schemaVersion !== 1 || !/^[a-f0-9]{40}$/u.test(result?.source?.commit ?? "")) {
    throw new Error("npm publication result has an unsupported schema or source commit.");
  }
  for (const field of ["published", "recoveredTags", "publishedTags"]) {
    if (
      !Array.isArray(result[field]) ||
      result[field].some(value => typeof value !== "string" || !value.includes("@"))
    ) {
      throw new Error(`npm publication result has invalid ${field}.`);
    }
  }
  if (
    !Array.isArray(result.auditedHistorical) ||
    result.auditedHistorical.some(
      item =>
        typeof item?.coordinate !== "string" ||
        !/^[a-f0-9]{40}$/u.test(item?.commit ?? "") ||
        typeof item?.purl !== "string" ||
        !item.purl.startsWith("pkg:npm/") ||
        typeof item?.registryIntegrity !== "string" ||
        !Array.isArray(item?.bundles),
    )
  ) {
    throw new Error("npm publication result has invalid audited historical provenance.");
  }
  return {
    published: result.published,
    recoveredTags: result.recoveredTags,
    publishedTags: result.publishedTags,
    outcome: result.published.length > 0 ? "published" : "recovered",
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = process.argv[2] ?? ".release-evidence/npm-publication-result.json";
  if (process.argv.length > 3) throw new Error("Usage: node scripts/report-npm-publication-result.mjs [result.json]");
  const summary = publicationResultSummary(JSON.parse(readFileSync(resolve(repositoryRoot, argument), "utf8")));
  if (process.env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries(summary))
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${JSON.stringify(value)}\n`);
  }
  console.log(JSON.stringify(summary));
}
