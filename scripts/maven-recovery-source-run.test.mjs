import assert from "node:assert/strict";
import test from "node:test";

import { validateMavenRecoverySourceRun } from "./maven-recovery-source-run.mjs";

const sha = "a".repeat(40);
const source = (path = ".github/workflows/release-npm.yml") => ({
  repository: { full_name: "vireocodedev/vireo" },
  workflow_id: 343525517,
  path,
  name: "Release · Publish npm and Maven",
  event: "push",
  head_branch: "main",
  head_sha: sha,
  status: "completed",
  conclusion: "failure",
});
const identity = { repository: "vireocodedev/vireo", sourceCommit: sha };

test("accepts canonical combined workflow paths, including GitHub main suffixes", () => {
  for (const path of [
    ".github/workflows/release-npm.yml",
    ".github/workflows/release-npm.yml@main",
    ".github/workflows/release-npm.yml@refs/heads/main",
  ])
    assert.doesNotThrow(() => validateMavenRecoverySourceRun(source(path), identity));
});

test("accepts the reviewed historical display name for the same stable workflow identity", () => {
  assert.doesNotThrow(() => validateMavenRecoverySourceRun({ ...source(), name: "Publish Vireo ecosystem" }, identity));
});

test("rejects another workflow identity or ref even when the source SHA matches", () => {
  for (const run of [
    { ...source(), workflow_id: 1 },
    source(".github/workflows/release-npm.yml@feature"),
    { ...source(), name: "Publish npm release" },
    { ...source(), conclusion: "success" },
  ])
    assert.throws(() => validateMavenRecoverySourceRun(run, identity), /exact interrupted ecosystem release/u);
});
