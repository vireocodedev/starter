import assert from "node:assert/strict";
import test from "node:test";
import { validatePublicMavenRecord } from "./anonymous-public-maven-evidence.mjs";
test("Maven evidence binds coordinate and license checks", () => {
  const record = { group: "com.vireocode", module: "vireo-core", version: "0.3.1", pomMitLicense: true, binaryJarMitLicense: true, checksumVerified: true, signatureVerified: true };
  assert.deepEqual(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }), []);
  record.pomMitLicense = false;
  assert.match(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }).join("\n"), /incomplete/u);
});
