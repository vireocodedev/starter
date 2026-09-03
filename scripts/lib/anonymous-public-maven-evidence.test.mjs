import assert from "node:assert/strict";
import test from "node:test";
import {
  mavenPublicationArtifactsInVerificationOrder,
  publicMavenCoordinatesMatch,
  publicMavenModulesInVerificationOrder,
  validatePublicMavenRecord,
} from "./anonymous-public-maven-evidence.mjs";

const group = "com.vireocode";
const module = "vireo-core";
const version = "0.3.1";
const pomSha256 = "a".repeat(64);
const artifactSha256 = "b".repeat(64);
const canonicalPublicMaven = () => ({
  group,
  modules: [
    {
      name: "vireo-bom",
      artifacts: [
        { classifier: "", extension: "module" },
        { classifier: "", extension: "pom" },
      ],
    },
    ...["vireo-core", "vireo-auth", "vireo-query", "vireo-history", "vireo-offline"].map(name => ({
      name,
      artifacts: [
        { classifier: "-javadoc", extension: "jar" },
        { classifier: "-sources", extension: "jar" },
        { classifier: "", extension: "jar" },
        { classifier: "", extension: "module" },
        { classifier: "", extension: "pom" },
      ],
    })),
  ],
});
const verifiedPom = {
  group,
  module,
  version,
  extension: "pom",
  classifier: "",
  subject: `${module}-${version}.pom`,
  sha256: pomSha256,
  checksumVerified: true,
  signatureVerified: true,
  pomCoordinateVerified: true,
  pomMitLicense: true,
  licenseContentVerified: null,
  licenseSha256: null,
};

const linkedPublicationRecord = ({ extension, classifier, ...overrides }) => ({
  group,
  module,
  version,
  extension,
  classifier,
  sha256: artifactSha256,
  checksumVerified: true,
  signatureVerified: true,
  pomMitLicense: null,
  licenseContentVerified: null,
  licenseSha256: null,
  publicationPomSubject: verifiedPom.subject,
  publicationPomSha256: verifiedPom.sha256,
  ...overrides,
});

test("public Maven coordinate matching is order-independent and leaves both sources unchanged", () => {
  const policyMaven = {
    group,
    modules: ["vireo-offline", "vireo-core", "vireo-bom", "vireo-query", "vireo-auth", "vireo-history"].map(name => ({
      name,
    })),
  };
  const contractMaven = {
    group,
    modules: ["vireo-history", "vireo-auth", "vireo-query", "vireo-bom", "vireo-offline", "vireo-core"],
  };
  const originalPolicyMaven = structuredClone(policyMaven);
  const originalContractMaven = structuredClone(contractMaven);

  assert.equal(publicMavenCoordinatesMatch({ policyMaven, contractMaven }), true);
  assert.deepEqual(policyMaven, originalPolicyMaven);
  assert.deepEqual(contractMaven, originalContractMaven);
});

test("public Maven coordinate matching rejects drift, duplicates, and malformed coordinate contracts", () => {
  const policyMaven = {
    group,
    modules: canonicalPublicMaven().modules.map(({ name }) => ({ name })),
  };
  const contractMaven = {
    group,
    modules: canonicalPublicMaven().modules.map(({ name }) => name),
  };
  const cases = [
    ["different group", { ...contractMaven, group: "com.example" }],
    [
      "mutually consistent noncanonical group",
      { ...contractMaven, group: "com.example" },
      { ...policyMaven, group: "com.example" },
    ],
    ["missing module", { ...contractMaven, modules: contractMaven.modules.slice(1) }],
    [
      "mutually consistent noncanonical subset",
      { ...contractMaven, modules: contractMaven.modules.slice(0, -1) },
      { ...policyMaven, modules: policyMaven.modules.slice(0, -1) },
    ],
    ["extra module", { ...contractMaven, modules: [...contractMaven.modules, "vireo-extra"] }],
    [
      "mutually consistent renamed module",
      { ...contractMaven, modules: [...contractMaven.modules.slice(0, -1), "vireo-client"] },
      { ...policyMaven, modules: [...policyMaven.modules.slice(0, -1), { name: "vireo-client" }] },
    ],
    [
      "duplicate policy module",
      contractMaven,
      { ...policyMaven, modules: [...policyMaven.modules, { name: "vireo-core" }] },
    ],
    ["duplicate contract module", { ...contractMaven, modules: [...contractMaven.modules, "vireo-core"] }],
    ["empty group", { ...contractMaven, group: "" }],
    [
      "malformed policy module",
      contractMaven,
      { ...policyMaven, modules: [...policyMaven.modules.slice(0, -1), "vireo-core"] },
    ],
    [
      "empty policy module name",
      contractMaven,
      { ...policyMaven, modules: [...policyMaven.modules.slice(0, -1), { name: "" }] },
    ],
    [
      "malformed contract module",
      { ...contractMaven, modules: [...contractMaven.modules.slice(0, -1), { name: "vireo-core" }] },
    ],
    ["empty contract module", { ...contractMaven, modules: [...contractMaven.modules.slice(0, -1), ""] }],
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
    ...verifiedPom,
    extension: "pom",
    classifier: "",
  };
  assert.deepEqual(validatePublicMavenRecord({ record, group, version }), []);
  record.pomMitLicense = false;
  assert.match(validatePublicMavenRecord({ record, group, version }).join("\n"), /incomplete/u);
});

test("POM coordinate drift is rejected", () => {
  const record = {
    ...verifiedPom,
    pomCoordinateVerified: false,
  };
  assert.match(validatePublicMavenRecord({ record, group, version }).join("\n"), /incomplete/u);
});

test("the public Maven family is exact and each module is deterministically POM-first", () => {
  const policy = canonicalPublicMaven();
  const original = structuredClone(policy);
  const ordered = publicMavenModulesInVerificationOrder(policy);
  assert.equal(ordered.length, 6);
  assert.deepEqual(
    ordered.map(candidate => [
      candidate.name,
      candidate.artifacts.map(artifact => `${artifact.classifier}.${artifact.extension}`),
    ]),
    [
      ["vireo-bom", [".pom", ".module"]],
      ...["vireo-core", "vireo-auth", "vireo-query", "vireo-history", "vireo-offline"].map(name => [
        name,
        [".pom", ".jar", "-sources.jar", "-javadoc.jar", ".module"],
      ]),
    ],
  );
  assert.deepEqual(policy, original);
});

test("the public Maven family rejects coordinate, module, artifact, and implicit-classifier drift", () => {
  const policy = canonicalPublicMaven();
  const library = policy.modules.find(candidate => candidate.name === module);
  const bom = policy.modules.find(candidate => candidate.name === "vireo-bom");
  const cases = [
    { ...policy, group: "com.example" },
    { ...policy, modules: policy.modules.slice(1) },
    { ...policy, modules: [...policy.modules, { name: "vireo-extra", artifacts: [] }] },
    ...library.artifacts.map((_, index) => ({
      ...policy,
      modules: policy.modules.map(candidate =>
        candidate.name === module
          ? { ...candidate, artifacts: candidate.artifacts.filter((_, artifactIndex) => artifactIndex !== index) }
          : candidate,
      ),
    })),
    {
      ...policy,
      modules: policy.modules.map(candidate =>
        candidate.name === module
          ? { ...candidate, artifacts: [...candidate.artifacts, { classifier: "-tests", extension: "jar" }] }
          : candidate,
      ),
    },
    {
      ...policy,
      modules: policy.modules.map(candidate => {
        if (candidate.name !== module) return candidate;
        const artifacts = structuredClone(candidate.artifacts);
        delete artifacts[2].classifier;
        return { ...candidate, artifacts };
      }),
    },
    ...["", "-sources", "-javadoc"].map(classifier => ({
      ...policy,
      modules: policy.modules.map(candidate =>
        candidate.name === "vireo-bom"
          ? { ...candidate, artifacts: [...bom.artifacts, { classifier, extension: "jar" }] }
          : candidate,
      ),
    })),
  ];
  for (const candidate of cases) assert.equal(publicMavenModulesInVerificationOrder(candidate), null);
});

test("publication declaration order verifies each module POM first without mutating policy artifacts", () => {
  const publication = {
    name: module,
    artifacts: [
      { classifier: "", extension: "jar" },
      { classifier: "", extension: "module" },
      { classifier: "", extension: "pom" },
      { classifier: "-sources", extension: "jar" },
      { classifier: "-javadoc", extension: "jar" },
    ],
  };
  const original = structuredClone(publication);
  assert.deepEqual(mavenPublicationArtifactsInVerificationOrder(publication), [
    publication.artifacts[2],
    publication.artifacts[0],
    publication.artifacts[3],
    publication.artifacts[4],
    publication.artifacts[1],
  ]);
  assert.deepEqual(publication, original);
});

test("publication declarations reject missing or duplicate POMs, unsupported classifiers, and duplicate subjects", () => {
  const valid = canonicalPublicMaven().modules.find(candidate => candidate.name === module);
  for (const publication of [
    { ...valid, artifacts: [{ classifier: "", extension: "jar" }] },
    { ...valid, artifacts: [...valid.artifacts, { classifier: "", extension: "pom" }] },
    { ...valid, artifacts: [...valid.artifacts, { classifier: "-tests", extension: "jar" }] },
    { ...valid, artifacts: [...valid.artifacts, { classifier: "-sources", extension: "module" }] },
    { ...valid, artifacts: [...valid.artifacts, { classifier: "", extension: "jar" }] },
  ])
    assert.equal(mavenPublicationArtifactsInVerificationOrder(publication), null);
});

test("auxiliary JARs and Gradle metadata bind to the actual verified same-module POM", () => {
  for (const record of [
    linkedPublicationRecord({ extension: "jar", classifier: "-sources" }),
    linkedPublicationRecord({ extension: "jar", classifier: "-javadoc" }),
    linkedPublicationRecord({ extension: "module", classifier: "" }),
  ])
    assert.deepEqual(validatePublicMavenRecord({ record, group, version, verifiedPom }), []);

  const mainJar = linkedPublicationRecord({
    extension: "jar",
    classifier: "",
    licenseContentVerified: true,
    licenseSha256: artifactSha256,
  });
  assert.deepEqual(validatePublicMavenRecord({ record: mainJar, group, version, verifiedPom }), []);
});

test("publication-family linkage rejects missing, drifted, unlicensed, unverified, or claimed-only POM evidence", () => {
  const record = linkedPublicationRecord({ extension: "jar", classifier: "-sources" });
  const cases = [
    ["missing POM", { verifiedPom: null }],
    ["wrong POM subject", { record: { ...record, publicationPomSubject: "other-0.3.1.pom" } }],
    ["wrong POM hash", { record: { ...record, publicationPomSha256: "c".repeat(64) } }],
    ["cross-coordinate POM", { verifiedPom: { ...verifiedPom, module: "vireo-auth" } }],
    ["bad POM coordinates", { verifiedPom: { ...verifiedPom, pomCoordinateVerified: false } }],
    ["unlicensed POM", { verifiedPom: { ...verifiedPom, pomMitLicense: false } }],
    ["unverified POM", { verifiedPom: { ...verifiedPom, signatureVerified: false } }],
    [
      "auxiliary claimed embedded license without linkage",
      {
        record: {
          ...record,
          publicationPomSubject: null,
          publicationPomSha256: null,
          licenseContentVerified: true,
          licenseSha256: artifactSha256,
        },
      },
    ],
    ["unknown JAR classifier", { record: { ...record, classifier: "-tests" } }],
  ];
  for (const [name, overrides] of cases) {
    const problems = validatePublicMavenRecord({
      record: overrides.record ?? record,
      group,
      version,
      verifiedPom: overrides.verifiedPom === undefined ? verifiedPom : overrides.verifiedPom,
    });
    assert.ok(problems.length > 0, name);
  }
});

test("main JAR requires both canonical embedded bytes and exact verified POM linkage", () => {
  const mainJar = linkedPublicationRecord({
    extension: "jar",
    classifier: "",
    licenseContentVerified: true,
    licenseSha256: artifactSha256,
  });
  const cases = [
    ["missing POM link", { record: { ...mainJar, publicationPomSubject: null, publicationPomSha256: null } }],
    ["wrong POM link", { record: { ...mainJar, publicationPomSubject: "vireo-auth-0.3.1.pom" } }],
    ["cross-coordinate POM", { verifiedPom: { ...verifiedPom, module: "vireo-auth" } }],
    ["unverified POM", { verifiedPom: { ...verifiedPom, checksumVerified: false } }],
  ];
  for (const [name, overrides] of cases) {
    const problems = validatePublicMavenRecord({
      record: overrides.record ?? mainJar,
      group,
      version,
      verifiedPom: overrides.verifiedPom === undefined ? verifiedPom : overrides.verifiedPom,
    });
    assert.ok(problems.includes("Maven publication family linkage is incomplete"), name);
  }
});

test("JAR license evidence requires canonical content verification and a byte digest", () => {
  const record = linkedPublicationRecord({
    extension: "jar",
    classifier: "",
    licenseContentVerified: true,
    licenseSha256: artifactSha256,
  });
  assert.deepEqual(validatePublicMavenRecord({ record, group, version, verifiedPom }), []);
  record.licenseContentVerified = "true";
  assert.match(validatePublicMavenRecord({ record, group, version, verifiedPom }).join("\n"), /incomplete/u);
  record.licenseContentVerified = true;
  record.licenseSha256 = "MIT";
  assert.match(validatePublicMavenRecord({ record, group, version, verifiedPom }).join("\n"), /incomplete/u);
});
