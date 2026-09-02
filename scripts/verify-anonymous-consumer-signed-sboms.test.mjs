import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  signedSbomVerificationPlan,
  verifiedAttestationRecord,
  verifySignedSbomPlan,
} from "./verify-anonymous-consumer-signed-sboms.mjs";

const release = {
  id: "npm-1.2.3_jvm-4.5.6",
  createVireoVersion: "1.2.3",
  template: { commit: "f".repeat(40) },
  npm: [{ name: "example", version: "1.2.3" }],
  maven: { group: "com.example", version: "4.5.6", modules: ["example-core"] },
};
const policy = {
  schemaVersion: 2,
  repository: "vireocodedev/vireo",
  npm: { expectedSubjectCount: 1, packages: [{ name: "example", directory: "example", sbomId: "npm-example" }] },
  maven: {
    group: "com.example",
    expectedSubjectCount: 1,
    modules: [
      { name: "example-core", sbomId: "maven-example-core", artifacts: [{ classifier: "", extension: "pom" }] },
    ],
  },
};
const gauntletPolicy = {
  scenarios: [{ id: "public-artifacts", recipe: ["fixture public release evidence"] }],
  requiredScenarios: ["public-artifacts"],
};

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "anonymous-signed-sbom-"));
  const publicRoot = join(root, "public-release-evidence");
  mkdirSync(join(publicRoot, "subjects", "npm"), { recursive: true });
  mkdirSync(join(publicRoot, "subjects", "maven"), { recursive: true });
  mkdirSync(join(publicRoot, "sbom"), { recursive: true });
  mkdirSync(join(publicRoot, "mappings"), { recursive: true });
  const subjects = [
    { ecosystem: "npm", coordinate: "example@1.2.3", path: "subjects/npm/example-1.2.3.tgz" },
    { ecosystem: "maven", coordinate: "com.example:example-core:4.5.6", path: "subjects/maven/example-core-4.5.6.pom" },
  ].map(subject => ({ ...subject, sha256: subject.path.includes("npm") ? "a".repeat(64) : "b".repeat(64) }));
  for (const subject of subjects) writeFileSync(join(publicRoot, subject.path), subject.path);
  const hash = path => (path.includes("npm") ? "a".repeat(64) : "b".repeat(64));
  const sboms = [
    {
      id: "npm-example",
      ecosystem: "npm",
      coordinate: subjects[0].coordinate,
      path: "sbom/npm-example.cdx.json",
      checksums: "mappings/npm-example.sha256",
      subjects: [subjects[0].path],
    },
    {
      id: "maven-example-core",
      ecosystem: "maven",
      coordinate: subjects[1].coordinate,
      path: "sbom/maven-example-core.cdx.json",
      checksums: "mappings/maven-example-core.sha256",
      subjects: [subjects[1].path],
    },
  ];
  for (const mapping of sboms) {
    const subject = subjects.find(candidate => candidate.path === mapping.subjects[0]);
    const component =
      mapping.ecosystem === "npm"
        ? { name: "example", version: "1.2.3" }
        : { group: "com.example", name: "example-core", version: "4.5.6" };
    writeFileSync(
      join(publicRoot, mapping.path),
      JSON.stringify({ bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component }, components: [] }),
    );
    writeFileSync(join(publicRoot, mapping.checksums), `${subject.sha256}  ${subject.path}\n`);
  }
  writeFileSync(
    join(root, "evidence.json"),
    JSON.stringify({
      status: "passed",
      release,
      releaseTagCommit: "c".repeat(40),
      verifierSourceCommit: "e".repeat(40),
      requestedReleaseId: release.id,
      workflow: { run: "fixture" },
      findings: [],
      externalWarnings: [],
      scenarios: [
        {
          id: "public-artifacts",
          recipe: gauntletPolicy.scenarios[0].recipe,
          status: "passed",
          commands: [
            {
              id: "fixture",
              status: "passed",
              stdout: { bytes: 0, sha256: "a".repeat(64) },
              stderr: { bytes: 0, sha256: "b".repeat(64) },
            },
          ],
        },
      ],
    }),
  );
  const manifest = {
    schemaVersion: 2,
    source: { repository: "https://github.com/vireocodedev/vireo", commit: "e".repeat(40), clean: true },
    versions: { npm: { example: "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } },
    subjects,
    sboms,
  };
  writeFileSync(join(publicRoot, "public-release-manifest.json"), JSON.stringify(manifest));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, manifest, hash, manifestPath: join(publicRoot, "public-release-manifest.json") };
}

function verifiedOutput(subject) {
  const commit = "c".repeat(40);
  const identity = "https://github.com/vireocodedev/vireo/.github/workflows/attest-public-release.yml@refs/heads/main";
  const component =
    subject.ecosystem === "maven"
      ? { group: "com.example", name: "example-core", version: "4.5.6" }
      : { name: "example", version: "1.2.3" };
  return JSON.stringify([
    {
      attestation: { bundle: { mediaType: "application/vnd.dev.sigstore.bundle.v0.3+json" } },
      verificationResult: {
        statement: {
          predicateType: "https://cyclonedx.org/bom",
          subject: [{ name: subject.path, digest: { sha256: subject.sha256 } }],
          predicate: { bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component } },
        },
        signature: {
          certificate: {
            subjectAlternativeName: identity,
            issuer: "https://token.actions.githubusercontent.com",
            githubWorkflowRepository: "vireocodedev/vireo",
            githubWorkflowRef: "refs/heads/main",
            githubWorkflowSHA: commit,
            buildSignerURI: identity,
            buildSignerDigest: commit,
            sourceRepositoryURI: "https://github.com/vireocodedev/vireo",
            sourceRepositoryDigest: commit,
            sourceRepositoryRef: "refs/heads/main",
            buildConfigURI: identity,
            buildConfigDigest: commit,
            runInvocationURI: "https://github.com/vireocodedev/vireo/actions/runs/123456/attempts/1",
          },
        },
        verifiedTimestamps: [{ type: "Tlog", timestamp: "2026-01-01T00:00:00Z" }],
      },
    },
  ]);
}

test("plans and verifies every exact npm and Maven subject against the release tag", t => {
  const { root, hash } = fixture(t);
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash });
  assert.equal(plan.subjects.length, 2);
  assert.equal(plan.releaseTagCommit, "c".repeat(40));
  const calls = [];
  const records = verifySignedSbomPlan({
    plan,
    repository: policy.repository,
    run: { id: "123" },
    execute: (command, arguments_) => {
      calls.push([command, arguments_]);
      return verifiedOutput(plan.subjects.find(subject => subject.absolutePath === arguments_[2]));
    },
  });
  assert.equal(calls.length, 2);
  assert.ok(
    calls.every(
      ([, arguments_]) => arguments_.includes("--predicate-type") && arguments_.includes("https://cyclonedx.org/bom"),
    ),
  );
  assert.ok(
    calls.every(([, arguments_]) => arguments_.includes("--source-digest") && arguments_.includes("c".repeat(40))),
  );
  assert.ok(calls.every(([, arguments_]) => arguments_.includes("--format") && arguments_.includes("json")));
  assert.equal(
    records[0].verification.certIdentity,
    "https://github.com/vireocodedev/vireo/.github/workflows/attest-public-release.yml@refs/heads/main",
  );
  assert.equal(records[0].verification.attestations[0].certificate.run.id, "123456");
});

test("rejects missing, extra, cross-coordinate, and digest-drifted subjects", t => {
  const { root, manifest, hash, manifestPath } = fixture(t);
  manifest.sboms[0].subjects = [manifest.subjects[1].path];
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /crosses artifact boundary/u,
  );
  manifest.sboms[0].subjects = [manifest.subjects[0].path];
  manifest.subjects.push({
    ecosystem: "npm",
    coordinate: "example@1.2.3",
    path: "subjects/npm/extra.tgz",
    sha256: "d".repeat(64),
  });
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /missing or extra|no SBOM mapping/u,
  );
});

test("rejects source drift and malformed or falsely bound verifier output", t => {
  const { root, manifest, hash, manifestPath } = fixture(t);
  manifest.source.commit = "d".repeat(40);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /source commit/u,
  );
  manifest.source.commit = "e".repeat(40);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash });
  const input = {
    subject: plan.subjects[0],
    repository: policy.repository,
    releaseTagCommit: plan.releaseTagCommit,
    certIdentity: "https://github.com/vireocodedev/vireo/.github/workflows/attest-public-release.yml@refs/heads/main",
  };
  assert.throws(() => verifiedAttestationRecord({ ...input, output: "not-json" }), /malformed JSON/u);
  const falseOutput = JSON.parse(verifiedOutput(plan.subjects[0]));
  falseOutput[0].verificationResult.signature.certificate.sourceRepositoryDigest = "d".repeat(40);
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify(falseOutput) }),
    /sourceRepositoryDigest/u,
  );
  falseOutput[0].verificationResult.signature.certificate.sourceRepositoryDigest = "c".repeat(40);
  falseOutput[0].verificationResult.statement.subject[0].digest.sha256 = "d".repeat(64);
  assert.throws(() => verifiedAttestationRecord({ ...input, output: JSON.stringify(falseOutput) }), /exact SHA-256/u);
  falseOutput[0].verificationResult.statement.subject[0].digest.sha256 = plan.subjects[0].sha256;
  falseOutput[0].verificationResult.statement.predicate.metadata.component.name = "wrong-package";
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify(falseOutput) }),
    /does not describe/u,
  );
});

test("does not trust a passed top-level gauntlet status without complete final evidence", t => {
  const { root, hash } = fixture(t);
  const evidencePath = join(root, "evidence.json");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  evidence.scenarios[0].commands[0].status = "planned";
  writeFileSync(evidencePath, JSON.stringify(evidence));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /final evidence.*not passed/u,
  );
});

test("workflow isolates signed-SBOM verification after the token-free gauntlet", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/anonymous-consumer-gauntlet.yml", import.meta.url),
    "utf8",
  );
  const start = workflow.indexOf("  verify-signed-sboms:");
  assert.notEqual(start, -1);
  const job = workflow.slice(start);
  assert.match(job, /needs: gauntlet/u);
  assert.match(job, /github\.event_name != 'pull_request'/u);
  assert.match(job, /attestations: read\n {6}contents: read/u);
  assert.match(job, /actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8\.0\.1/u);
  assert.match(job, /name: anonymous-consumer-gauntlet-evidence/u);
  assert.match(job, /path: \$\{\{ runner\.temp \}\}\/anonymous-consumer-evidence/u);
  assert.match(job, /GH_TOKEN: \$\{\{ github\.token \}\}/u);
  const verifier = readFileSync(new URL("./verify-anonymous-consumer-signed-sboms.mjs", import.meta.url), "utf8");
  assert.match(verifier, /"--format",\s+"json"/u);
  assert.match(job, /anonymous-consumer-signed-sbom-evidence/u);
  assert.match(job, /Revalidate trusted main ancestry before verifier execution/u);
  assert.match(job, /merge-base --is-ancestor "\$TRUSTED_SOURCE_COMMIT" origin\/main/u);
  assert.match(workflow, /workflow_run:/u);
  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /schedule:/u);
});
