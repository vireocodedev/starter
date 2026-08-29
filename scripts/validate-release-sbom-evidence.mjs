import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { attestationMatrix, validateReleaseSbomManifest } from "./lib/release-sbom-evidence.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = resolve(repositoryRoot, process.argv[2] ?? ".public-release-evidence");
const option = process.argv[3];
if (process.argv.length > 4 || (option && option !== "--github-matrix")) {
  console.error("Usage: node scripts/validate-release-sbom-evidence.mjs [evidence-directory] [--github-matrix]");
  process.exit(2);
}
const policy = JSON.parse(
  readFileSync(join(repositoryRoot, "contracts/public-release-attestation-policy.json"), "utf8"),
);
const manifest = JSON.parse(readFileSync(join(evidenceRoot, "public-release-manifest.json"), "utf8"));
const problems = validateReleaseSbomManifest(manifest, policy, { root: evidenceRoot });
if (problems.length > 0) {
  console.error("Release SBOM evidence failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
if (option === "--github-matrix") console.log(`matrix=${JSON.stringify({ include: attestationMatrix(manifest) })}`);
else console.log(`Release SBOM evidence passed for ${manifest.sboms.length} exact artifact mappings.`);
