import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { publicationResultSummary } from "./report-npm-publication-result.mjs";

const result = {
  schemaVersion: 1,
  source: { commit: "a".repeat(40) },
  published: ["create-vireo@0.8.0"],
  recoveredTags: ["@vireocodedev/ui@0.3.1"],
  publishedTags: ["create-vireo@0.8.0"],
  auditedHistorical: [
    {
      coordinate: "@vireocodedev/ui@0.3.1",
      commit: "b".repeat(40),
      purl: "pkg:npm/%40vireocodedev%2Fui@0.3.1",
      registryIntegrity: "sha512-reviewed",
      bundles: [],
    },
  ],
};

test("reports published packages separately from provenance-recovered tags", () => {
  assert.deepEqual(publicationResultSummary(result), {
    published: result.published,
    recoveredTags: result.recoveredTags,
    publishedTags: result.publishedTags,
    outcome: "published",
  });
});

test("rejects a malformed publication result instead of allowing Changesets output to stand in for evidence", () => {
  assert.throws(() => publicationResultSummary({ ...result, recoveredTags: [42] }), /invalid recoveredTags/u);
});

test("uses the signed publication-result contract rather than Changesets heuristics in the publish workflow", () => {
  const workflow = readFileSync(new URL("../.github/workflows/release-npm.yml", import.meta.url), "utf8");
  assert.match(workflow, /id: publication-result\n        run: corepack npm run release:report-publication/u);
  assert.match(workflow, /steps\.publication-result\.outputs\.published/u);
  assert.doesNotMatch(workflow, /steps\.changesets\.outputs\.published/u);
});
