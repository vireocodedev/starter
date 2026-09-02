import assert from "node:assert/strict";
import test from "node:test";
import { peelGitHubTag, validateReleasePreflightIdentity, vireoReleaseImmutabilityFinding } from "./anonymous-consumer-release-preflight.mjs";

const release = { id: "npm-0.8.1_jvm-0.3.1", template: { commit: "a".repeat(40) } };
test("release preflight binds exact release and source coordinates", () => {
  assert.deepEqual(validateReleasePreflightIdentity({ release, requestedReleaseId: release.id, requestedSourceCommit: "b".repeat(40), verifierSourceCommit: "b".repeat(40) }), []);
  assert.match(validateReleasePreflightIdentity({ release, requestedReleaseId: "npm-0.8.0_jvm-0.3.1", verifierSourceCommit: "b".repeat(40) }).join("\n"), /requested release/u);
});
test("only the historical Template release immutability warning is narrow", () => {
  assert.equal(vireoReleaseImmutabilityFinding({ version: "0.8.1", immutable: false }).category, "external-warning");
  assert.throws(() => vireoReleaseImmutabilityFinding({ version: "0.8.2", immutable: false }));
});
test("annotated GitHub tags are peeled to an exact commit", async () => {
  const responses = [
    { ok: true, json: async () => ({ object: { type: "tag", url: "https://example.invalid/tag" } }) },
    { ok: true, json: async () => ({ object: { type: "commit", sha: "c".repeat(40) } }) },
  ];
  assert.equal(await peelGitHubTag({ repository: "vireo/template", tag: "v1", fetchImpl: async () => responses.shift() }), "c".repeat(40));
  await assert.rejects(peelGitHubTag({ repository: "vireo/template", tag: "v1", fetchImpl: async () => ({ ok: true, json: async () => ({ object: { type: "commit", sha: "wrong" } }) }) }));
});
