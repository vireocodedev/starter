import assert from "node:assert/strict";
import test from "node:test";
import { assertExactContract, parseCommandLine } from "./verify-npm-public-release.mjs";

const publicManifests = [
  ["create-vireo", "create-vireo"], ["history", "@vireocodedev/history"], ["infrastructure", "@vireocodedev/infrastructure"], ["localization", "@vireocodedev/localization"], ["queryengine", "@vireocodedev/query"], ["shell", "@vireocodedev/shell"], ["sqlite", "@vireocodedev/sqlite"], ["ui", "@vireocodedev/ui"],
].map(([directory, name]) => ({ directory, manifest: { name, version: "1.2.3" } }));
const contract = {
  current: { id: "npm-1.2.3_jvm-4.5.6", npm: publicManifests.map(({ manifest }) => ({ name: manifest.name, version: manifest.version })), template: { commit: "a".repeat(40) } },
  npmPublicationProvenance: {},
};

test("npm public verifier accepts an explicit contract and expected release id", () => {
  assert.deepEqual(parseCommandLine(["evidence.json", "--contract", "contracts/release.json", "--expected-release-id", "npm-1.2.3_jvm-4.5.6"]), { output: "evidence.json", contract: "contracts/release.json", expectedReleaseId: "npm-1.2.3_jvm-4.5.6" });
  assert.equal(assertExactContract({ contract, manifests: publicManifests, expectedReleaseId: "npm-1.2.3_jvm-4.5.6" }).id, "npm-1.2.3_jvm-4.5.6");
});

test("npm public verifier rejects a local public manifest that drifts from its contract", () => {
  const manifests = structuredClone(publicManifests);
  manifests[0].manifest.version = "1.2.4";
  assert.throws(() => assertExactContract({ contract, manifests }), /does not match/u);
  assert.throws(() => parseCommandLine(["--expected-release-id"]), /requires/u);
});
