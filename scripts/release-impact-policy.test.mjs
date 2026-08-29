import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { parseChangeset, validateReleaseImpact } from "./release-impact-policy.mjs";

const policy = JSON.parse(readFileSync(new URL("../contracts/release-impact-policy.json", import.meta.url), "utf8"));
const ecosystemContract = JSON.parse(
  readFileSync(new URL("../contracts/ecosystem-release-contract.json", import.meta.url), "utf8"),
);

const sourceChange = path => ({ status: "M", path, baseContent: null, headContent: null });
const changeset = (
  name,
  bump = "patch",
  summary = "Describe the user-visible release behavior.",
  path = ".changeset/example.md",
) => ({
  status: "A",
  path,
  baseContent: null,
  headContent: `---\n"${name}": ${bump}\n---\n${summary}\n`,
});
const impactRecord = record => ({
  status: "A",
  path: `.release-impact/${record.artifact.replaceAll(/[^a-z0-9]+/giu, "-")}.json`,
  baseContent: null,
  headContent: `${JSON.stringify({ schemaVersion: 1, ...record }, null, 2)}\n`,
});
const validate = changes => validateReleaseImpact({ policy, ecosystemContract, changes });

test("requires an affected npm package to have a changed Changeset", () => {
  const result = validate([sourceChange("packages/sqlite/src/runtime.ts")]);

  assert.ok(result.problems.some(problem => problem.includes("npm:@vireocodedev/sqlite is affected")));
});

test("does not let another package's Changeset cover the affected package", () => {
  const result = validate([sourceChange("packages/sqlite/src/runtime.ts"), changeset("@vireocodedev/history")]);

  assert.ok(result.problems.some(problem => problem.includes("npm:@vireocodedev/sqlite is affected")));
});

test("requires decisions for both sides of a cross-artifact rename", () => {
  const result = validate([
    {
      status: "R",
      previousPath: "packages/history/src/moved.ts",
      path: "packages/sqlite/src/moved.ts",
      baseContent: null,
      headContent: null,
    },
    changeset("@vireocodedev/sqlite"),
  ]);

  assert.deepEqual(result.affected, ["npm:@vireocodedev/history", "npm:@vireocodedev/sqlite"]);
  assert.ok(result.problems.some(problem => problem.includes("npm:@vireocodedev/history is affected")));
});

test("accepts Changesets as npm release metadata", () => {
  const result = validate([sourceChange("packages/sqlite/src/runtime.ts"), changeset("@vireocodedev/sqlite", "minor")]);

  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.affected, ["npm:@vireocodedev/sqlite"]);
  assert.equal(result.decisions[0].decision, "release");
});

test("combines multiple Changesets for one package using the highest bump", () => {
  const result = validate([
    sourceChange("packages/sqlite/src/runtime.ts"),
    changeset("@vireocodedev/sqlite", "patch", "Correct the replay failure path.", ".changeset/fix.md"),
    changeset("@vireocodedev/sqlite", "minor", "Expose replay diagnostics to consumers.", ".changeset/api.md"),
  ]);

  assert.deepEqual(result.problems, []);
  assert.equal(result.decisions[0].bump, "minor");
});

test("requires maintainer-reviewable no-release justification", () => {
  const short = validate([
    sourceChange("packages/ui/tests/only.test.ts"),
    impactRecord({ artifact: "npm:@vireocodedev/ui", decision: "no-release", justification: "tests only" }),
  ]);
  assert.ok(short.problems.some(problem => problem.includes("at least 24 characters")));

  const justified = validate([
    sourceChange("packages/ui/tests/only.test.ts"),
    impactRecord({
      artifact: "npm:@vireocodedev/ui",
      decision: "no-release",
      justification: "Test-only coverage; packed runtime bytes and public behavior are unchanged.",
    }),
  ]);
  assert.deepEqual(justified.problems, []);
});

test("ignores stale metadata that is not changed by the pull request", () => {
  const result = validate([sourceChange("jvm/vireo-offline/src/main/java/example/Replay.java")]);

  assert.ok(result.problems.some(problem => problem.includes("jvm:vireo-offline is affected")));
});

test("requires JVM release intent and validates its bump and changelog summary", () => {
  const missing = validate([sourceChange("jvm/vireo-offline/src/main/java/example/Replay.java")]);
  assert.ok(missing.problems.some(problem => problem.includes("jvm:vireo-offline is affected")));

  const accepted = validate([
    sourceChange("jvm/vireo-offline/src/main/java/example/Replay.java"),
    impactRecord({
      artifact: "jvm:vireo-offline",
      decision: "release",
      bump: "patch",
      summary: "Dispatch offline commands without credential-bearing self-HTTP.",
    }),
  ]);
  assert.deepEqual(accepted.problems, []);
});

test("requires deploy intent for the documentation application", () => {
  const rejected = validate([
    sourceChange("site/content/index.md"),
    impactRecord({
      artifact: "application:documentation-site",
      decision: "release",
      bump: "patch",
      summary: "Publish revised public documentation.",
    }),
  ]);
  assert.ok(rejected.problems.some(problem => problem.includes("bump must be one of deploy")));

  const accepted = validate([
    sourceChange("site/content/index.md"),
    impactRecord({
      artifact: "application:documentation-site",
      decision: "release",
      bump: "deploy",
      summary: "Publish revised public documentation.",
    }),
  ]);
  assert.deepEqual(accepted.problems, []);
});

test("rejects unknown artifacts and npm release records that bypass Changesets", () => {
  const unknown = validate([
    impactRecord({
      artifact: "jvm:not-real",
      decision: "no-release",
      justification: "This deliberately references an artifact outside the contract.",
    }),
  ]);
  assert.ok(unknown.problems.some(problem => problem.includes("unknown artifact")));

  const bypass = validate([
    sourceChange("packages/history/src/index.ts"),
    impactRecord({
      artifact: "npm:@vireocodedev/history",
      decision: "release",
      bump: "patch",
      summary: "Attempt to bypass Changesets metadata.",
    }),
  ]);
  assert.ok(bypass.problems.some(problem => problem.includes("add a Changeset instead")));
});

test("accepts a consumed Changeset only when the version PR changes version and changelog", () => {
  const deletedChangeset = {
    status: "D",
    path: ".changeset/released.md",
    baseContent: `---\n"@vireocodedev/sqlite": patch\n---\nShip the queued replay correction.\n`,
    headContent: null,
  };
  const incomplete = validate([
    deletedChangeset,
    {
      status: "M",
      path: "packages/sqlite/package.json",
      baseContent: '{"version":"0.2.2"}',
      headContent: '{"version":"0.2.3"}',
    },
  ]);
  assert.ok(incomplete.problems.some(problem => problem.includes("deleted without versioning")));

  const complete = validate([
    deletedChangeset,
    {
      status: "M",
      path: "packages/sqlite/package.json",
      baseContent: '{"version":"0.2.2"}',
      headContent: '{"version":"0.2.3"}',
    },
    sourceChange("packages/sqlite/CHANGELOG.md"),
  ]);
  assert.deepEqual(complete.problems, []);
});

test("parses metadata as data and rejects executable or ambiguous Changesets syntax", () => {
  assert.throws(
    () => parseChangeset('---\n"@vireocodedev/ui": patch; rm -rf /\n---\nA meaningful summary.\n', "evil.md"),
    /unsupported Changesets metadata/u,
  );
});

test("runs the pull-request gate with exact revisions and no privileged execution", () => {
  const workflow = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  const job = workflow.match(/^ {2}release-impact:\n([\s\S]*?)(?=^ {2}[a-z][a-z-]+:\n)/mu)?.[0];

  assert.ok(job, "CI must define a release-impact job");
  assert.match(workflow, /^ {2}pull_request:\n/mu);
  assert.doesNotMatch(workflow, /pull_request_target:/u);
  assert.match(job, /permissions:\n {6}contents: read/u);
  assert.match(job, /persist-credentials: false/u);
  assert.match(job, /fetch-depth: 0/u);
  assert.match(job, /BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/u);
  assert.match(job, /HEAD_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/u);
  assert.match(job, /--base "\$BASE_SHA" --head "\$HEAD_SHA"/u);
  assert.doesNotMatch(job, /npm (?:ci|install)|secrets\./u);
});
