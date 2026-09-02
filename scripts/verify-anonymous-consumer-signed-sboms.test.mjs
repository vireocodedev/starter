import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { signedSbomVerificationPlan, verifySignedSbomPlan } from "./verify-anonymous-consumer-signed-sboms.mjs";

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
    modules: [{ name: "example-core", sbomId: "maven-example-core", artifacts: [{ classifier: "", extension: "pom" }] }],
  },
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
  const hash = path => path.includes("npm") ? "a".repeat(64) : "b".repeat(64);
  const sboms = [
    { id: "npm-example", ecosystem: "npm", coordinate: subjects[0].coordinate, path: "sbom/npm-example.cdx.json", checksums: "mappings/npm-example.sha256", subjects: [subjects[0].path] },
    { id: "maven-example-core", ecosystem: "maven", coordinate: subjects[1].coordinate, path: "sbom/maven-example-core.cdx.json", checksums: "mappings/maven-example-core.sha256", subjects: [subjects[1].path] },
  ];
  for (const mapping of sboms) {
    const subject = subjects.find(candidate => candidate.path === mapping.subjects[0]);
    const component = mapping.ecosystem === "npm" ? { name: "example", version: "1.2.3" } : { group: "com.example", name: "example-core", version: "4.5.6" };
    writeFileSync(join(publicRoot, mapping.path), JSON.stringify({ bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component }, components: [] }));
    writeFileSync(join(publicRoot, mapping.checksums), `${subject.sha256}  ${subject.path}\n`);
  }
  writeFileSync(join(root, "evidence.json"), JSON.stringify({ status: "passed", release, releaseTagCommit: "c".repeat(40) }));
  const manifest = { schemaVersion: 2, source: { repository: "https://github.com/vireocodedev/vireo" }, versions: { npm: { example: "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } }, subjects, sboms };
  writeFileSync(join(publicRoot, "public-release-manifest.json"), JSON.stringify(manifest));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, manifest, hash, manifestPath: join(publicRoot, "public-release-manifest.json") };
}

test("plans and verifies every exact npm and Maven subject against the release tag", t => {
  const { root, hash } = fixture(t);
  const plan = signedSbomVerificationPlan({ evidenceRoot: root, release, policy, hash });
  assert.equal(plan.subjects.length, 2);
  assert.equal(plan.releaseTagCommit, "c".repeat(40));
  const calls = [];
  const records = verifySignedSbomPlan({
    plan,
    repository: policy.repository,
    run: { id: "123" },
    execute: (command, arguments_) => calls.push([command, arguments_]),
  });
  assert.equal(calls.length, 2);
  assert.ok(calls.every(([, arguments_]) => arguments_.includes("--predicate-type") && arguments_.includes("https://cyclonedx.org/bom")));
  assert.ok(calls.every(([, arguments_]) => arguments_.includes("--source-digest") && arguments_.includes("c".repeat(40))));
  assert.equal(records[0].verification.certIdentity, "https://github.com/vireocodedev/vireo/.github/workflows/attest-public-release.yml@refs/heads/main");
});

test("rejects missing, extra, cross-coordinate, and digest-drifted subjects", t => {
  const { root, manifest, hash, manifestPath } = fixture(t);
  manifest.sboms[0].subjects = [manifest.subjects[1].path];
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(() => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, hash }), /crosses artifact boundary/u);
  manifest.sboms[0].subjects = [manifest.subjects[0].path];
  manifest.subjects.push({ ecosystem: "npm", coordinate: "example@1.2.3", path: "subjects/npm/extra.tgz", sha256: "d".repeat(64) });
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(() => signedSbomVerificationPlan({ evidenceRoot: root, release, policy, hash }), /missing or extra|no SBOM mapping/u);
});

test("workflow isolates signed-SBOM verification after the token-free gauntlet", () => {
  const workflow = readFileSync(new URL("../.github/workflows/anonymous-consumer-gauntlet.yml", import.meta.url), "utf8");
  const start = workflow.indexOf("  verify-signed-sboms:");
  assert.notEqual(start, -1);
  const job = workflow.slice(start);
  assert.match(job, /needs: gauntlet/u);
  assert.match(job, /github\.event_name != 'pull_request'/u);
  assert.match(job, /attestations: read\n      contents: read/u);
  assert.match(job, /actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8\.0\.1/u);
  assert.match(job, /name: anonymous-consumer-gauntlet-evidence/u);
  assert.match(job, /GH_TOKEN: \$\{\{ github\.token \}\}/u);
  assert.match(job, /anonymous-consumer-signed-sbom-evidence/u);
  assert.match(workflow, /workflow_run:/u);
  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /schedule:/u);
});
