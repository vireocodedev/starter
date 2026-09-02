import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeExactNpmProvenance,
  validateAnonymousPublicEvidence,
  validateExactNpmRecord,
} from "./anonymous-public-evidence.mjs";

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
    inventorySafe: true,
    exportsSafe: true,
    binSafe: true,
    attestationUrl: "https://registry.example/attestation",
    registrySignaturesValid: true,
    provenance: {
      repository: "vireocodedev/vireo",
      workflow: ".github/workflows/release-npm.yml",
      ref: "refs/heads/main",
      commit: "b".repeat(40),
      statementType: "https://in-toto.io/Statement/v1",
      predicateType: "https://slsa.dev/provenance/v1",
    },
  };
  assert.deepEqual(validateExactNpmRecord({ record, expected: record, releaseTagCommit: "b".repeat(40) }), []);
  record.provenance.workflow = "wrong.yml";
  assert.match(
    validateExactNpmRecord({
      record,
      expected: { name: "create-vireo", version: "1.2.3" },
      releaseTagCommit: "b".repeat(40),
    }).join("\n"),
    /provenance/u,
  );
});

test("decoded registry provenance binds its exact npm subject and peeled release tag commit", () => {
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
    attestation: {
      attestations: [
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
        attestation: {
          attestations: [
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
    /peeled create-vireo tag/u,
  );
});
