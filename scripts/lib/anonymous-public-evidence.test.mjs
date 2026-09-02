import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeExactNpmProvenance,
  validateAnonymousPublicEvidence,
  validateExactNpmRecord,
} from "./anonymous-public-evidence.mjs";

const provenancePolicy = {
  canonicalRepository: "vireocodedev/vireo",
  repositoryAliases: ["vireocodedev/starter"],
  workflowPath: ".github/workflows/release-npm.yml",
  workflowRef: "refs/heads/main",
  repositoryId: "1304974749",
  statementType: "https://in-toto.io/Statement/v1",
  predicateType: "https://slsa.dev/provenance/v1",
};

test("public evidence requires all exact npm and Maven subjects", () => {
  const release = {
    npm: [{ name: "create-vireo", version: "1.2.3" }],
    maven: { group: "com.example", version: "4.5.6", modules: ["core"] },
  };
  const manifest = {
    versions: { npm: { "create-vireo": "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } },
    subjects: [
      { ecosystem: "npm", name: "create-vireo", version: "1.2.3", sha256: "a".repeat(64) },
      { coordinate: "com.example:core:4.5.6" },
    ],
  };
  assert.deepEqual(validateAnonymousPublicEvidence({ manifest, release }), []);
  assert.match(validateAnonymousPublicEvidence({ manifest: {}, release }).join("\n"), /create-vireo/u);
});

test("exact npm record rejects repository workflow commit digest license and inventory drift", () => {
  const record = {
    name: "create-vireo",
    version: "1.2.3",
    integrity: "sha512-x",
    sha256: "a".repeat(64),
    repository: "https://github.com/vireocodedev/vireo",
    license: "MIT",
    licenseFile: "LICENSE",
    licenseContentVerified: true,
    licenseSha256: "d".repeat(64),
    inventorySafe: true,
    exportsSafe: true,
    binSafe: true,
    attestationUrl: "https://registry.example/attestation",
    registrySignaturesValid: true,
    provenance: {
      repository: "vireocodedev/vireo",
      repositoryClassification: "canonical",
      canonicalRepository: "vireocodedev/vireo",
      workflow: ".github/workflows/release-npm.yml",
      ref: "refs/heads/main",
      repositoryId: "1304974749",
      commit: "b".repeat(40),
      materialRepository: "vireocodedev/vireo",
      materialRepositoryClassification: "canonical",
      materialCommit: "b".repeat(40),
      statementType: "https://in-toto.io/Statement/v1",
      predicateType: "https://slsa.dev/provenance/v1",
    },
  };
  assert.deepEqual(
    validateExactNpmRecord({ record, expected: record, releaseTagCommit: "b".repeat(40), policy: provenancePolicy }),
    [],
  );
  record.licenseContentVerified = "true";
  assert.match(
    validateExactNpmRecord({
      record,
      expected: record,
      releaseTagCommit: "b".repeat(40),
      policy: provenancePolicy,
    }).join("\n"),
    /license content evidence/u,
  );
  record.licenseContentVerified = true;
  record.provenance.workflow = "wrong.yml";
  assert.match(
    validateExactNpmRecord({
      record,
      expected: { name: "create-vireo", version: "1.2.3" },
      releaseTagCommit: "b".repeat(40),
      policy: provenancePolicy,
    }).join("\n"),
    /provenance/u,
  );
  record.provenance.workflow = provenancePolicy.workflowPath;
  for (const repository of [
    "https://evilgithub.com/vireocodedev/starter",
    "https://github.com/vireocodedev/starter/extra",
    "https://github.com/unapproved/starter",
  ]) {
    record.repository = repository;
    assert.match(
      validateExactNpmRecord({
        record,
        expected: { name: "create-vireo", version: "1.2.3" },
        releaseTagCommit: "b".repeat(40),
        policy: provenancePolicy,
      }).join("\n"),
      /packed package repository/u,
    );
  }
});

test("decoded verified-audit provenance binds its exact npm subject and peeled release tag commit", () => {
  const commit = "b".repeat(40);
  const integrity = `sha512-${Buffer.alloc(64, 7).toString("base64")}`;
  const statement = {
    _type: "https://in-toto.io/Statement/v1",
    predicateType: "https://slsa.dev/provenance/v1",
    subject: [{ name: "pkg:npm/create-vireo@1.2.3", digest: { sha512: Buffer.alloc(64, 7).toString("hex") } }],
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            repository: "https://github.com/vireocodedev/vireo",
            path: ".github/workflows/release-npm.yml",
            ref: "refs/heads/main",
          },
        },
        internalParameters: { github: { repository_id: "1304974749" } },
        resolvedDependencies: [
          { uri: `git+https://github.com/vireocodedev/vireo@${commit}`, digest: { gitCommit: commit } },
        ],
      },
    },
  };
  const provenance = decodeExactNpmProvenance({
    auditRecord: {
      name: "create-vireo",
      version: "1.2.3",
      attestationBundles: [
        { bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") } } },
      ],
    },
    expected: { name: "create-vireo", version: "1.2.3" },
    integrity,
    releaseTagCommit: commit,
    policy: {
      canonicalRepository: "vireocodedev/vireo",
      workflowPath: ".github/workflows/release-npm.yml",
      workflowRef: "refs/heads/main",
      repositoryId: "1304974749",
      statementType: "https://in-toto.io/Statement/v1",
      predicateType: "https://slsa.dev/provenance/v1",
    },
  });
  assert.equal(provenance.commit, commit);
  statement.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit = "c".repeat(40);
  assert.throws(
    () =>
      decodeExactNpmProvenance({
        auditRecord: {
          name: "create-vireo",
          version: "1.2.3",
          attestationBundles: [
            { bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") } } },
          ],
        },
        expected: { name: "create-vireo", version: "1.2.3" },
        integrity,
        releaseTagCommit: commit,
        policy: {
          canonicalRepository: "vireocodedev/vireo",
          workflowPath: ".github/workflows/release-npm.yml",
          workflowRef: "refs/heads/main",
          repositoryId: "1304974749",
          statementType: "https://in-toto.io/Statement/v1",
          predicateType: "https://slsa.dev/provenance/v1",
        },
      }),
    /peeled coordinate tag/u,
  );
});

test("canonical registry metadata cannot override a wrong verified audit bundle", () => {
  const commit = "b".repeat(40);
  const integrity = `sha512-${Buffer.alloc(64, 7).toString("base64")}`;
  const statement = {
    _type: "https://in-toto.io/Statement/v1",
    predicateType: "https://slsa.dev/provenance/v1",
    subject: [{ name: "pkg:npm/create-vireo@1.2.3", digest: { sha512: Buffer.alloc(64, 7).toString("hex") } }],
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            repository: "https://github.com/vireocodedev/vireo",
            path: ".github/workflows/release-npm.yml",
            ref: "refs/heads/main",
          },
        },
        internalParameters: { github: { repository_id: "1304974749" } },
        resolvedDependencies: [
          { uri: `git+https://github.com/vireocodedev/vireo@${commit}`, digest: { gitCommit: commit } },
        ],
      },
    },
  };
  const policy = {
    canonicalRepository: "vireocodedev/vireo",
    workflowPath: ".github/workflows/release-npm.yml",
    workflowRef: "refs/heads/main",
    repositoryId: "1304974749",
    statementType: "https://in-toto.io/Statement/v1",
    predicateType: "https://slsa.dev/provenance/v1",
  };
  const bundle = candidate => ({
    bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(candidate)).toString("base64") } },
  });
  const rawRegistryAttestation = { attestations: [bundle(statement)] };
  const wrongAuditStatement = structuredClone(statement);
  wrongAuditStatement.predicate.buildDefinition.externalParameters.workflow.path = "wrong.yml";
  assert.throws(
    () =>
      decodeExactNpmProvenance({
        // This canonical-looking registry response is intentionally ignored.
        attestation: rawRegistryAttestation,
        auditRecord: { name: "create-vireo", version: "1.2.3", attestationBundles: [bundle(wrongAuditStatement)] },
        expected: { name: "create-vireo", version: "1.2.3" },
        integrity,
        releaseTagCommit: commit,
        policy,
      }),
    /no exact approved SLSA provenance/u,
  );
  assert.equal(
    decodeExactNpmProvenance({
      auditRecord: { name: "create-vireo", version: "1.2.3", attestationBundles: [bundle(statement)] },
      expected: { name: "create-vireo", version: "1.2.3" },
      integrity,
      releaseTagCommit: commit,
      policy,
    }).commit,
    commit,
  );
});

test("declared repository aliases preserve provenance continuity but not mixed coordinate commits", () => {
  const commit = "b".repeat(40);
  const integrity = `sha512-${Buffer.alloc(64, 7).toString("base64")}`;
  const statement = {
    _type: provenancePolicy.statementType,
    predicateType: provenancePolicy.predicateType,
    subject: [{ name: "pkg:npm/%40vireocodedev/ui@1.2.3", digest: { sha512: Buffer.alloc(64, 7).toString("hex") } }],
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            repository: "https://github.com/vireocodedev/starter",
            path: provenancePolicy.workflowPath,
            ref: provenancePolicy.workflowRef,
          },
        },
        internalParameters: { github: { repository_id: provenancePolicy.repositoryId } },
        resolvedDependencies: [
          { uri: `git+https://github.com/vireocodedev/starter@${commit}`, digest: { gitCommit: commit } },
        ],
      },
    },
  };
  const auditRecord = {
    name: "@vireocodedev/ui",
    version: "1.2.3",
    attestationBundles: [
      { bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") } } },
    ],
  };
  const expected = { name: "@vireocodedev/ui", version: "1.2.3" };
  const provenance = decodeExactNpmProvenance({
    auditRecord,
    expected,
    integrity,
    releaseTagCommit: commit,
    policy: provenancePolicy,
  });
  assert.equal(provenance.canonicalRepository, provenancePolicy.canonicalRepository);
  assert.equal(provenance.repositoryClassification, "alias");
  assert.equal(provenance.materialRepositoryClassification, "alias");
  const wrongRepositoryId = structuredClone(auditRecord);
  const wrongRepositoryIdStatement = structuredClone(statement);
  wrongRepositoryIdStatement.predicate.buildDefinition.internalParameters.github.repository_id = "999";
  wrongRepositoryId.attestationBundles[0].bundle.dsseEnvelope.payload = Buffer.from(
    JSON.stringify(wrongRepositoryIdStatement),
  ).toString("base64");
  assert.throws(
    () =>
      decodeExactNpmProvenance({
        auditRecord: wrongRepositoryId,
        expected,
        integrity,
        releaseTagCommit: commit,
        policy: provenancePolicy,
      }),
    /unexpected GitHub repository id/u,
  );
  const wrongWorkflowRepository = structuredClone(auditRecord);
  const wrongWorkflowStatement = structuredClone(statement);
  wrongWorkflowStatement.predicate.buildDefinition.externalParameters.workflow.repository =
    "https://evilgithub.com/vireocodedev/starter";
  wrongWorkflowRepository.attestationBundles[0].bundle.dsseEnvelope.payload = Buffer.from(
    JSON.stringify(wrongWorkflowStatement),
  ).toString("base64");
  assert.throws(
    () =>
      decodeExactNpmProvenance({
        auditRecord: wrongWorkflowRepository,
        expected,
        integrity,
        releaseTagCommit: commit,
        policy: provenancePolicy,
      }),
    /approved release workflow/u,
  );
  statement.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit = "c".repeat(40);
  auditRecord.attestationBundles[0].bundle.dsseEnvelope.payload = Buffer.from(JSON.stringify(statement)).toString(
    "base64",
  );
  assert.throws(
    () =>
      decodeExactNpmProvenance({
        auditRecord,
        expected,
        integrity,
        releaseTagCommit: commit,
        policy: provenancePolicy,
      }),
    /peeled coordinate tag/u,
  );
});
