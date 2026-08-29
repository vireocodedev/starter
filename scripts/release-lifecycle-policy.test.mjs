import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateReleaseCoordinates, validateReleaseLifecycle } from "./release-lifecycle-policy.mjs";

const read = relative => JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), "utf8"));

test("accepts the repository lifecycle ledger", () => {
  assert.deepEqual(validateReleaseLifecycle().problems, []);
});

test("prereleases cannot use stable coordinates or the stable npm tag", () => {
  const policy = read("contracts/release-lifecycle-policy.json");
  policy.channels.prerelease.status = "active";

  assert.deepEqual(validateReleaseCoordinates(policy, "prerelease", { npm: "0.3.0", maven: "0.3.0" }), [
    "npm version 0.3.0 is not valid for prerelease",
    "maven version 0.3.0 is not valid for prerelease",
  ]);
  assert.deepEqual(validateReleaseCoordinates(policy, "prerelease", { npm: "0.3.0-rc.1", maven: "0.3.0-rc.1" }), []);
});

test("rejects incomplete support withdrawal records", () => {
  const policy = read("contracts/release-lifecycle-policy.json");
  const ecosystem = read("contracts/ecosystem-release-contract.json");
  policy.supportLines[0].status = "deprecated";

  const result = validateReleaseLifecycle(policy, ecosystem);

  assert.ok(result.problems.some(problem => problem.includes("requires deprecation and EOL dates")));
  assert.ok(result.problems.some(problem => problem.includes("must project exactly")));
});

test("rejects an abbreviated withdrawal window and an invented replacement", () => {
  const policy = read("contracts/release-lifecycle-policy.json");
  const ecosystem = read("contracts/ecosystem-release-contract.json");
  Object.assign(policy.supportLines[0], {
    status: "deprecated",
    deprecatedOn: "2026-09-01",
    eolOn: "2026-09-08",
    replacement: "imaginary-line",
  });

  const result = validateReleaseLifecycle(policy, ecosystem);

  assert.ok(result.problems.some(problem => problem.includes("provides 7 deprecation days")));
  assert.ok(result.problems.some(problem => problem.includes("replacement must identify another line")));
});
