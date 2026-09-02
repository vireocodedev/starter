import assert from "node:assert/strict";
import test from "node:test";
import { validatePublicMavenRecord } from "./anonymous-public-maven-evidence.mjs";
test("Maven evidence binds coordinate and license checks", () => {
  const record = {
    group: "com.vireocode",
    module: "vireo-core",
    version: "0.3.1",
    extension: "pom",
    classifier: "",
    pomCoordinateVerified: true,
    pomMitLicense: true,
    binaryJarMitLicense: false,
    checksumVerified: true,
    signatureVerified: true,
  };
  assert.deepEqual(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }), []);
  record.pomMitLicense = false;
  assert.match(
    validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }).join("\n"),
    /incomplete/u,
  );
});

test("POM coordinate drift is rejected", () => {
  const record = {
    group: "com.vireocode",
    module: "vireo-core",
    version: "0.3.1",
    extension: "pom",
    pomCoordinateVerified: false,
    pomMitLicense: true,
    checksumVerified: true,
    signatureVerified: true,
  };
  assert.match(
    validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }).join("\n"),
    /incomplete/u,
  );
});

test("non-jar metadata does not inherit jar license state", () => {
  const record = {
    group: "com.vireocode",
    module: "vireo-bom",
    version: "0.3.1",
    extension: "module",
    pomMitLicense: false,
    binaryJarMitLicense: false,
    checksumVerified: true,
    signatureVerified: true,
  };
  assert.deepEqual(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }), []);
});
