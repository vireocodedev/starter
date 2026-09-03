import assert from "node:assert/strict";
import test from "node:test";
import { planEcosystemPublication } from "./ecosystem-publication-plan.mjs";

const policy = {
  classicLibraries: ["@vireocodedev/history", "@vireocodedev/ui"],
  cli: "create-vireo",
  generatedReleasePullRequest: {
    repository: "vireocodedev/vireo",
    base: "main",
    head: "changeset-release/main",
    authorId: 324462250,
    authorLogin: "vireo-template-adoption[bot]",
    title: "chore(release): version public ecosystem",
  },
};
const before = {
  npm: { "create-vireo": "0.8.7", "@vireocodedev/history": "0.2.2", "@vireocodedev/ui": "0.3.1" },
  jvm: "0.3.1",
};
const pull = sha => ({
  merged_at: "2026-09-03T00:00:00Z",
  merge_commit_sha: sha,
  base: { ref: "main", repo: { full_name: "vireocodedev/vireo" } },
  head: { ref: "changeset-release/main", repo: { full_name: "vireocodedev/vireo" } },
  user: { id: 324462250, login: "vireo-template-adoption[bot]" },
  title: "chore(release): version public ecosystem",
});

test("ordinary protected main push is a no-op", () => {
  assert.equal(planEcosystemPublication({ before, after: { ...before, sha: "a".repeat(40) }, policy }).action, "no-op");
});
test("requires exact bot-generated merge for a classic-library publication", () => {
  const sha = "b".repeat(40);
  const after = { npm: { ...before.npm, "@vireocodedev/history": "0.2.3" }, jvm: before.jvm, sha };
  const result = planEcosystemPublication({ before, after, policy, associatedPullRequests: [pull(sha)] });
  assert.deepEqual(result, {
    action: "libraries-only",
    reason: "Exact generated ecosystem release PR authorized publication.",
    classicCoordinates: ["@vireocodedev/history@0.2.3"],
    jvmVersion: null,
  });
  assert.equal(
    planEcosystemPublication({
      before,
      after,
      policy,
      associatedPullRequests: [{ ...pull(sha), user: { id: 1, login: "vireo-template-adoption[bot]" } }],
    }).action,
    "fail",
  );
  assert.equal(
    planEcosystemPublication({
      before,
      after,
      policy,
      associatedPullRequests: [{ ...pull(sha), user: { id: 324462250, login: "wrong[bot]" } }],
    }).action,
    "fail",
  );
  for (const invalid of [
    { ...pull(sha), merge_commit_sha: "c".repeat(40) },
    { ...pull(sha), base: { ...pull(sha).base, ref: "release" } },
    { ...pull(sha), head: { ...pull(sha).head, ref: "feature" } },
    { ...pull(sha), head: { ...pull(sha).head, repo: { full_name: "fork/vireo" } } },
    { ...pull(sha), title: "close enough" },
    { ...pull(sha), merged_at: null },
  ])
    assert.equal(planEcosystemPublication({ before, after, policy, associatedPullRequests: [invalid] }).action, "fail");
  assert.equal(
    planEcosystemPublication({ before, after, policy, associatedPullRequests: [pull(sha), pull(sha)] }).action,
    "fail",
  );
});
test("plans JVM-only and mixed paths but rejects CLI co-release", () => {
  const sha = "c".repeat(40);
  assert.equal(
    planEcosystemPublication({
      before,
      after: { npm: before.npm, jvm: "0.3.2", sha },
      policy,
      associatedPullRequests: [pull(sha)],
    }).action,
    "jvm-only",
  );
  assert.equal(
    planEcosystemPublication({
      before,
      after: { npm: { ...before.npm, "@vireocodedev/history": "0.2.3" }, jvm: "0.3.2", sha },
      policy,
      associatedPullRequests: [pull(sha)],
    }).action,
    "jvm-then-libraries",
  );
  assert.equal(
    planEcosystemPublication({
      before,
      after: { npm: { ...before.npm, "create-vireo": "0.8.8" }, jvm: before.jvm, sha },
      policy,
      associatedPullRequests: [pull(sha)],
    }).action,
    "fail",
  );
});
