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
    licenseContentVerified: null,
    licenseSha256: null,
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
    licenseContentVerified: null,
    licenseSha256: null,
    checksumVerified: true,
    signatureVerified: true,
  };
  assert.deepEqual(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }), []);
});

test("JAR license evidence requires canonical content verification and a byte digest", () => {
  const record = {
    group: "com.vireocode",
    module: "vireo-core",
    version: "0.3.1",
    extension: "jar",
    checksumVerified: true,
    signatureVerified: true,
    licenseContentVerified: true,
    licenseSha256: "a".repeat(64),
  };
  assert.deepEqual(validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }), []);
  record.licenseContentVerified = "true";
  assert.match(
    validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }).join("\n"),
    /incomplete/u,
  );
  record.licenseContentVerified = true;
  record.licenseSha256 = "MIT";
  assert.match(
    validatePublicMavenRecord({ record, group: "com.vireocode", version: "0.3.1" }).join("\n"),
    /incomplete/u,
  );
});
