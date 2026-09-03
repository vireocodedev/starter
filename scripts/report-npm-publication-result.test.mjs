import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { npmPurl } from "./publish-verified-npm-candidates.mjs";
import { publicationResultSummary, writeGitHubOutput } from "./report-npm-publication-result.mjs";

const commit = "a".repeat(40);
const names = [
  "create-vireo",
  "@vireocodedev/history",
  "@vireocodedev/infrastructure",
  "@vireocodedev/localization",
  "@vireocodedev/query",
  "@vireocodedev/shell",
  "@vireocodedev/sqlite",
  "@vireocodedev/ui",
];

function candidates() {
  return names.map((name, index) => {
    const version = `0.2.${index + 1}`;
    const bytes = Buffer.from(`${name}@${version}`);
    return {
      name,
      version,
      coordinate: `${name}@${version}`,
      integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
      bytes,
    };
  });
}

function resultFor(candidatesToReport = candidates()) {
  const [published, ...historical] = candidatesToReport;
  return {
    schemaVersion: 1,
    source: { commit },
    candidates: candidatesToReport.map(candidate => ({
      coordinate: candidate.coordinate,
      integrity: candidate.integrity,
      purl: npmPurl(candidate),
    })),
    published: [published.coordinate],
    recoveredTags: [historical[0].coordinate],
    publishedTags: [published.coordinate],
    auditedHistorical: historical.map(candidate => ({
      coordinate: candidate.coordinate,
      commit: "b".repeat(40),
      purl: npmPurl(candidate),
      registryIntegrity: candidate.integrity,
      bundles: [{ verified: true }],
    })),
  };
}

test("reports a manifest-complete published/historical partition", () => {
  const input = resultFor();
  assert.deepEqual(publicationResultSummary(input, candidates(), commit), {
    published: true,
    publishedPackages: input.published,
    recoveredTags: input.recoveredTags,
    publishedTags: input.publishedTags,
    outcome: "published",
  });
});

test("rejects an overlap, unknown coordinate, or malformed audited provenance", () => {
  const input = resultFor();
  assert.throws(
    () =>
      publicationResultSummary(
        { ...input, published: [...input.published, input.auditedHistorical[0].coordinate] },
        candidates(),
        commit,
      ),
    /overlaps published and historical/u,
  );
  assert.throws(
    () => publicationResultSummary({ ...input, recoveredTags: ["unknown@0.0.0"] }, candidates(), commit),
    /invalid recoveredTags/u,
  );
  assert.throws(
    () => publicationResultSummary({ ...input, auditedHistorical: [] }, candidates(), commit),
    /partition all manifest candidates/u,
  );
});

test("automatic Template adoption cannot publish a library coordinate", () => {
  const values = candidates();
  const input = resultFor([values[1], values[0], ...values.slice(2)]);
  const previous = process.env.AUTOMATIC_TEMPLATE_ADOPTION;
  process.env.AUTOMATIC_TEMPLATE_ADOPTION = "true";
  try {
    assert.throws(
      () => publicationResultSummary(input, candidates(), commit),
      /only the exact create-vireo candidate/u,
    );
  } finally {
    if (previous === undefined) delete process.env.AUTOMATIC_TEMPLATE_ADOPTION;
    else process.env.AUTOMATIC_TEMPLATE_ADOPTION = previous;
  }
});

test("classic-library scope permits only its exact planned library coordinate and tag mutation", () => {
  const values = candidates();
  const library = values[1];
  const input = resultFor([library, ...values.filter(candidate => candidate !== library)]);
  input.recoveredTags = [];
  const previousScope = process.env.NPM_PUBLICATION_SCOPE;
  const previousCoordinates = process.env.NPM_ALLOWED_LIBRARY_COORDINATES;
  process.env.NPM_PUBLICATION_SCOPE = "classic-libraries";
  process.env.NPM_ALLOWED_LIBRARY_COORDINATES = JSON.stringify([library.coordinate]);
  try {
    assert.deepEqual(publicationResultSummary(input, values, commit).publishedPackages, [library.coordinate]);
    assert.throws(
      () => publicationResultSummary({ ...input, recoveredTags: [values[2].coordinate] }, values, commit),
      /out-of-scope tag mutation/u,
    );
    const cliPublication = {
      ...input,
      published: [library.coordinate, values[0].coordinate],
      publishedTags: [library.coordinate, values[0].coordinate],
      auditedHistorical: input.auditedHistorical.filter(item => item.coordinate !== values[0].coordinate),
    };
    assert.throws(
      () => publicationResultSummary(cliPublication, values, commit),
      /outside the authorized release plan/u,
    );
  } finally {
    if (previousScope === undefined) delete process.env.NPM_PUBLICATION_SCOPE;
    else process.env.NPM_PUBLICATION_SCOPE = previousScope;
    if (previousCoordinates === undefined) delete process.env.NPM_ALLOWED_LIBRARY_COORDINATES;
    else process.env.NPM_ALLOWED_LIBRARY_COORDINATES = previousCoordinates;
  }
});

test("writes scalar GitHub outputs and JSON arrays without JSON-quoting scalars", () => {
  const writes = [];
  writeGitHubOutput(publicationResultSummary(resultFor(), candidates(), commit), value => writes.push(value));
  const values = writes.join("");
  assert.match(values, /^published=true$/mu);
  assert.match(values, /^outcome=published$/mu);
  assert.match(values, /^publishedPackages=\[/mu);
  assert.doesNotMatch(values, /^published="true"$/mu);
});

test("keeps workflow job outputs on the established boolean and JSON-array contract", () => {
  const workflow = readFileSync(new URL("../.github/workflows/release-npm.yml", import.meta.url), "utf8");
  assert.match(workflow, /published: \$\{\{ steps\.publication-result\.outputs\.published \}\}/u);
  assert.match(workflow, /published-packages: \$\{\{ steps\.publication-result\.outputs\.publishedPackages \}\}/u);
  assert.doesNotMatch(workflow, /steps\.changesets\.outputs\.published/u);
});
