import assert from "node:assert/strict";
import test from "node:test";
import { validateAnonymousPublicEvidence, validateExactNpmRecord } from "./anonymous-public-evidence.mjs";

test("public evidence requires all exact npm and Maven subjects", () => {
  const release = { npm: [{ name: "create-vireo", version: "1.2.3" }], maven: { group: "com.example", version: "4.5.6", modules: ["core"] } };
  const manifest = { versions: { npm: { "create-vireo": "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } }, subjects: [{ ecosystem: "npm", name: "create-vireo", version: "1.2.3", sha256: "a".repeat(64) }, { coordinate: "com.example:core:4.5.6" }] };
  assert.deepEqual(validateAnonymousPublicEvidence({ manifest, release }), []);
  assert.match(validateAnonymousPublicEvidence({ manifest: {}, release }).join("\n"), /create-vireo/u);
});

test("exact npm record rejects repository workflow commit digest license and inventory drift", () => {
  const record = { name: "create-vireo", version: "1.2.3", integrity: "sha512-x", sha256: "a".repeat(64), repository: "https://github.com/vireocodedev/vireo", license: "MIT", licenseFile: "LICENSE", inventorySafe: true, exportsSafe: true, binSafe: true, attestationUrl: "https://registry.example/attestation", registrySignaturesValid: true, provenance: { repository: "vireocodedev/vireo", workflow: ".github/workflows/release-npm.yml", ref: "refs/heads/main", commit: "b".repeat(40), statementType: "https://in-toto.io/Statement/v1", predicateType: "https://slsa.dev/provenance/v1" } };
  assert.deepEqual(validateExactNpmRecord({ record, expected: record, releaseTagCommit: "b".repeat(40) }), []);
  record.provenance.workflow = "wrong.yml";
  assert.match(validateExactNpmRecord({ record, expected: { name: "create-vireo", version: "1.2.3" }, releaseTagCommit: "b".repeat(40) }).join("\n"), /provenance/u);
});
