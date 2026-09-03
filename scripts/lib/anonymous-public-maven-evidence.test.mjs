import assert from "node:assert/strict";
import test from "node:test";
import { publicMavenCoordinatesMatch, validatePublicMavenRecord } from "./anonymous-public-maven-evidence.mjs";

test("public Maven coordinate matching is order-independent and leaves both sources unchanged", () => {
  const policyMaven = {
    group: "com.vireocode",
    modules: [{ name: "vireo-bom" }, { name: "vireo-core" }, { name: "vireo-auth" }],
  };
  const contractMaven = {
    group: "com.vireocode",
    modules: ["vireo-auth", "vireo-bom", "vireo-core"],
  };
  const originalPolicyMaven = structuredClone(policyMaven);
  const originalContractMaven = structuredClone(contractMaven);

  assert.equal(publicMavenCoordinatesMatch({ policyMaven, contractMaven }), true);
  assert.deepEqual(policyMaven, originalPolicyMaven);
  assert.deepEqual(contractMaven, originalContractMaven);
});

test("public Maven coordinate matching rejects drift, duplicates, and malformed coordinate contracts", () => {
  const policyMaven = {
    group: "com.vireocode",
    modules: [{ name: "vireo-bom" }, { name: "vireo-core" }, { name: "vireo-auth" }],
  };
  const contractMaven = {
    group: "com.vireocode",
    modules: ["vireo-bom", "vireo-core", "vireo-auth"],
  };
  const cases = [
    ["different group", { ...contractMaven, group: "com.example" }],
    ["missing module", { ...contractMaven, modules: ["vireo-bom", "vireo-core"] }],
    ["extra module", { ...contractMaven, modules: [...contractMaven.modules, "vireo-query"] }],
    ["renamed module", { ...contractMaven, modules: ["vireo-bom", "vireo-core", "vireo-client"] }],
    [
      "duplicate policy module",
      contractMaven,
      { ...policyMaven, modules: [...policyMaven.modules, { name: "vireo-core" }] },
    ],
    ["duplicate contract module", { ...contractMaven, modules: [...contractMaven.modules, "vireo-core"] }],
    ["empty group", { ...contractMaven, group: "" }],
    ["malformed policy module", contractMaven, { ...policyMaven, modules: [{ name: "vireo-bom" }, "vireo-core"] }],
    ["empty policy module name", contractMaven, { ...policyMaven, modules: [{ name: "vireo-bom" }, { name: "" }] }],
    ["malformed contract module", { ...contractMaven, modules: ["vireo-bom", { name: "vireo-core" }] }],
    ["empty contract module", { ...contractMaven, modules: ["vireo-bom", ""] }],
    ["missing module lists", { group: contractMaven.group }],
  ];

  for (const [name, candidateContractMaven, candidatePolicyMaven = policyMaven] of cases)
    assert.equal(
      publicMavenCoordinatesMatch({ policyMaven: candidatePolicyMaven, contractMaven: candidateContractMaven }),
      false,
      name,
    );
});

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
