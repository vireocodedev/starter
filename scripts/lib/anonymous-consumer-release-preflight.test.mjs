import assert from "node:assert/strict";
import test from "node:test";
import { templateReleaseImmutabilityFinding, validateReleasePreflightIdentity } from "./anonymous-consumer-release-preflight.mjs";

const release = { id: "npm-0.8.1_jvm-0.3.1", template: { commit: "a".repeat(40) } };
test("release preflight binds exact release and source coordinates", () => {
  assert.deepEqual(validateReleasePreflightIdentity({ release, requestedReleaseId: release.id, requestedSourceCommit: release.template.commit }), []);
  assert.match(validateReleasePreflightIdentity({ release, requestedReleaseId: "npm-0.8.0_jvm-0.3.1" }).join("\n"), /requested release/u);
});
test("only the historical Template release immutability warning is narrow", () => {
  assert.equal(templateReleaseImmutabilityFinding({ version: "0.8.1", immutable: false }).category, "external-warning");
  assert.throws(() => templateReleaseImmutabilityFinding({ version: "0.8.2", immutable: false }));
});
