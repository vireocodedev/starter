import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  signedSbomVerificationPlan,
  verifiedAttestationRecord,
  verifySignedSbomPlan,
} from "./verify-anonymous-consumer-signed-sboms.mjs";

const commits = {
  floor: "a".repeat(40),
  releaseTag: "c".repeat(40),
  attester: "d".repeat(40),
  verifier: "e".repeat(40),
  future: "f".repeat(40),
};
const release = {
  id: "npm-1.2.3_jvm-4.5.6",
  createVireoVersion: "1.2.3",
  template: { commit: "f".repeat(40) },
  npm: [{ name: "example", version: "1.2.3" }],
  maven: { group: "com.example", version: "4.5.6", modules: ["example-core"] },
};
const policy = {
  schemaVersion: 3,
  repository: "vireocodedev/vireo",
  trust: {
    repositoryId: "1304974749",
    workflowIdentity:
      "https://github.com/vireocodedev/vireo/.github/workflows/attest-public-release.yml@refs/heads/main",
    workflowRef: "refs/heads/main",
    workflowName: "Attest public release SBOMs",
    oidcIssuer: "https://token.actions.githubusercontent.com",
    allowedTriggers: ["workflow_dispatch", "workflow_run"],
    runnerEnvironment: "github-hosted",
    sourceRepositoryVisibility: "public",
    minimumTrustedWorkflowCommit: commits.floor,
  },
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
      releaseTagCommit: commits.releaseTag,
      verifierSourceCommit: commits.verifier,
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
    source: { repository: "https://github.com/vireocodedev/vireo", commit: commits.verifier, clean: true },
    versions: { npm: { example: "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } },
    subjects,
    sboms,
  };
  writeFileSync(join(publicRoot, "public-release-manifest.json"), JSON.stringify(manifest));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, manifest, hash, manifestPath: join(publicRoot, "public-release-manifest.json") };
}

function trustedAncestry(ancestor, descendant) {
  return ancestor[0] <= descendant[0];
}

function verifiedEntry(
  subject,
  { attesterCommit = commits.attester, trigger = "workflow_dispatch", buildTrigger = trigger } = {},
) {
  const component =
    subject.ecosystem === "maven"
      ? { group: "com.example", name: "example-core", version: "4.5.6" }
      : { name: "example", version: "1.2.3" };
  return {
    attestation: { bundle: { mediaType: "application/vnd.dev.sigstore.bundle.v0.3+json" } },
    verificationResult: {
      statement: {
        predicateType: "https://cyclonedx.org/bom",
        subject: [{ name: subject.path, digest: { sha256: subject.sha256 } }],
        predicate: { bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component } },
      },
      signature: {
        certificate: {
          subjectAlternativeName: policy.trust.workflowIdentity,
          issuer: policy.trust.oidcIssuer,
          githubWorkflowRepository: policy.repository,
          githubWorkflowRef: policy.trust.workflowRef,
          githubWorkflowName: policy.trust.workflowName,
          githubWorkflowTrigger: trigger,
          githubWorkflowSHA: attesterCommit,
          buildSignerURI: policy.trust.workflowIdentity,
          buildSignerDigest: attesterCommit,
          runnerEnvironment: policy.trust.runnerEnvironment,
          sourceRepositoryURI: `https://github.com/${policy.repository}`,
          sourceRepositoryDigest: attesterCommit,
          sourceRepositoryRef: policy.trust.workflowRef,
          sourceRepositoryIdentifier: policy.trust.repositoryId,
          sourceRepositoryVisibilityAtSigning: policy.trust.sourceRepositoryVisibility,
          buildConfigURI: policy.trust.workflowIdentity,
          buildConfigDigest: attesterCommit,
          buildTrigger,
          runInvocationURI: "https://github.com/vireocodedev/vireo/actions/runs/123456/attempts/1",
        },
      },
      verifiedTimestamps: [{ type: "Tlog", timestamp: "2026-01-01T00:00:00Z" }],
    },
  };
}

function verifiedOutput(subject, options) {
  return JSON.stringify([verifiedEntry(subject, options)]);
}

test("plans and verifies every exact npm and Maven subject against a distinct trusted attester commit", t => {
  const { root, hash } = fixture(t);
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash });
  assert.equal(plan.subjects.length, 2);
  assert.equal(plan.releaseTagCommit, commits.releaseTag);
  assert.equal(plan.verifierSourceCommit, commits.verifier);
  const calls = [];
  let ancestryCalls = 0;
  const records = verifySignedSbomPlan({
    plan,
    repository: policy.repository,
    run: { id: "123" },
    isAncestor: (ancestor, descendant) => {
      ancestryCalls += 1;
      return trustedAncestry(ancestor, descendant);
    },
    execute: (command, arguments_) => {
      calls.push([command, arguments_]);
      return verifiedOutput(plan.subjects.find(subject => subject.absolutePath === arguments_[2]));
    },
  });
  assert.equal(calls.length, 2);
  const hasExactOptionValue = (arguments_, option, value) => {
    const indexes = arguments_.flatMap((argument, index) => (argument === option ? [index] : []));
    return indexes.length === 1 && arguments_[indexes[0] + 1] === value;
  };
  assert.ok(
    calls.every(([, arguments_]) => hasExactOptionValue(arguments_, "--predicate-type", "https://cyclonedx.org/bom")),
  );
  assert.ok(calls.every(([, arguments_]) => hasExactOptionValue(arguments_, "--source-ref", "refs/heads/main")));
  assert.ok(calls.every(([, arguments_]) => !arguments_.includes("--source-digest")));
  assert.ok(calls.every(([, arguments_]) => hasExactOptionValue(arguments_, "--format", "json")));
  assert.equal(records[0].verification.releaseTagCommit, commits.releaseTag);
  assert.equal(records[0].verification.verifierSourceCommit, commits.verifier);
  assert.equal(records[0].verification.attestations[0].certificate.attesterSourceCommit, commits.attester);
  assert.equal(records[0].verification.attestations[0].certificate.run.id, "123456");
  assert.equal(ancestryCalls, 3, "shared attester ancestry must be cached across subjects");
});

test("accepts and records multiple eligible attestations while ignoring only future attestations", t => {
  const { root, hash } = fixture(t);
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash });
  const output = JSON.stringify([
    verifiedEntry(plan.subjects[0], { attesterCommit: commits.attester, trigger: "workflow_dispatch" }),
    verifiedEntry(plan.subjects[0], { attesterCommit: commits.verifier, trigger: "workflow_run" }),
    verifiedEntry(plan.subjects[0], { attesterCommit: commits.future, trigger: "workflow_run" }),
  ]);
  const record = verifiedAttestationRecord({ output, subject: plan.subjects[0], plan, isAncestor: trustedAncestry });
  assert.equal(record.attestations.length, 2);
  assert.equal(record.ignoredFutureAttestationCount, 1);
  assert.deepEqual(
    record.attestations.map(attestation => attestation.certificate.attesterSourceCommit),
    [commits.attester, commits.verifier],
  );
  assert.throws(
    () =>
      verifiedAttestationRecord({
        output: verifiedOutput(plan.subjects[0], { attesterCommit: commits.future }),
        subject: plan.subjects[0],
        plan,
        isAncestor: trustedAncestry,
      }),
    /no eligible attestations/u,
  );
});

test("rejects malformed trusted-window certificates, lower-bound drift, and incorrect identity claims", t => {
  const { root, hash } = fixture(t);
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash });
  const input = { subject: plan.subjects[0], plan, isAncestor: trustedAncestry };
  assert.throws(() => verifiedAttestationRecord({ ...input, output: "not-json" }), /malformed JSON/u);
  const inconsistent = verifiedEntry(plan.subjects[0]);
  inconsistent.verificationResult.signature.certificate.sourceRepositoryDigest = commits.verifier;
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([inconsistent]) }),
    /self-consistent/u,
  );
  const malformed = verifiedEntry(plan.subjects[0]);
  malformed.verificationResult.signature.certificate.githubWorkflowSHA = "not-a-commit";
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([malformed]) }),
    /malformed attester source commit/u,
  );
  assert.throws(
    () =>
      verifiedAttestationRecord({
        ...input,
        output: verifiedOutput(plan.subjects[0], { attesterCommit: "9".repeat(40) }),
      }),
    /outside the trusted workflow ancestry window/u,
  );
  const wrongRepositoryId = verifiedEntry(plan.subjects[0]);
  wrongRepositoryId.verificationResult.signature.certificate.sourceRepositoryIdentifier = "999";
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([wrongRepositoryId]) }),
    /sourceRepositoryIdentifier/u,
  );
  const wrongTrigger = verifiedEntry(plan.subjects[0], { trigger: "push" });
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([wrongTrigger]) }),
    /allowed attester trigger/u,
  );
  const mixedAllowedTriggers = verifiedEntry(plan.subjects[0], {
    trigger: "workflow_dispatch",
    buildTrigger: "workflow_run",
  });
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([mixedAllowedTriggers]) }),
    /trigger fields are not self-consistent/u,
  );
  const wrongSubjectDigest = verifiedEntry(plan.subjects[0]);
  wrongSubjectDigest.verificationResult.statement.subject[0].digest.sha256 = "d".repeat(64);
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([wrongSubjectDigest]) }),
    /exact SHA-256/u,
  );
  const wrongComponent = verifiedEntry(plan.subjects[0]);
  wrongComponent.verificationResult.statement.predicate.metadata.component.name = "wrong-package";
  assert.throws(
    () => verifiedAttestationRecord({ ...input, output: JSON.stringify([wrongComponent]) }),
    /does not describe/u,
  );
});

test("rejects missing, extra, cross-coordinate, digest-drifted, and source-drifted evidence", t => {
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
    path: "subjects/npm/unmapped.tgz",
    sha256: "d".repeat(64),
  });
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /missing or extra|no SBOM mapping/u,
  );
  manifest.subjects.pop();
  manifest.source.commit = commits.attester;
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash }),
    /source commit/u,
  );
});

test("rejects actual on-disk exact-subject digest drift", t => {
  const { root, manifest, manifestPath } = fixture(t);
  const evidenceRoot = join(root, "public-release-evidence");
  const diskHash = path => createHash("sha256").update(readFileSync(path)).digest("hex");
  for (const subject of manifest.subjects) subject.sha256 = diskHash(join(evidenceRoot, subject.path));
  for (const mapping of manifest.sboms) {
    writeFileSync(
      join(evidenceRoot, mapping.checksums),
      `${mapping.subjects
        .map(path => `${manifest.subjects.find(subject => subject.path === path).sha256}  ${path}`)
        .join("\n")}\n`,
    );
  }
  writeFileSync(manifestPath, JSON.stringify(manifest));
  writeFileSync(join(evidenceRoot, manifest.subjects[0].path), "drifted exact public bytes");
  assert.throws(
    () => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, gauntletPolicy, hash: diskHash }),
    /exact public subject digest drifted/u,
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

test("workflow isolates signed-SBOM verification after the token-free gauntlet with complete history", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/anonymous-consumer-gauntlet.yml", import.meta.url),
    "utf8",
  );
  const start = workflow.indexOf("  verify-signed-sboms:");
  assert.notEqual(start, -1);
  const job = workflow.slice(start);
  assert.match(job, /needs: \[gauntlet, trusted-source\]/u);
  assert.match(job, /needs\.gauntlet\.result == 'success'/u);
  assert.match(job, /needs\.trusted-source\.result == 'success'/u);
  assert.match(job, /github\.event_name != 'pull_request'/u);
  assert.match(job, /attestations: read\n {6}contents: read/u);
  assert.match(job, /fetch-depth: 0/u);
  assert.match(job, /actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8\.0\.1/u);
  assert.match(job, /name: anonymous-consumer-gauntlet-evidence/u);
  assert.match(job, /GH_TOKEN: \$\{\{ github\.token \}\}/u);
  const verifier = readFileSync(new URL("./verify-anonymous-consumer-signed-sboms.mjs", import.meta.url), "utf8");
  assert.match(verifier, /"--format",\s+"json"/u);
  assert.doesNotMatch(verifier, /"--source-digest"/u);
  assert.match(verifier, /merge-base", "--is-ancestor"/u);
  assert.match(verifier, /cwd: repositoryRoot/u);
  assert.match(job, /anonymous-consumer-signed-sbom-evidence/u);
  assert.match(job, /Revalidate trusted main ancestry before verifier execution/u);
  assert.match(workflow, /workflow_run:/u);
  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /schedule:/u);
});
