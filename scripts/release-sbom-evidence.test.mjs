import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateReleaseSbomManifest, validateReleaseSbomPolicy } from "./lib/release-sbom-evidence.mjs";

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
    minimumTrustedWorkflowCommit: "a".repeat(40),
  },
  npm: {
    expectedSubjectCount: 1,
    packages: [{ name: "example", directory: "example", sbomId: "npm-example" }],
  },
  maven: {
    group: "com.example",
    expectedSubjectCount: 2,
    modules: [
      {
        name: "example-core",
        sbomId: "maven-example-core",
        artifacts: [
          { classifier: "", extension: "jar" },
          { classifier: "", extension: "pom" },
        ],
      },
    ],
  },
};

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "release-sbom-test-"));
  mkdirSync(join(root, "sbom"));
  mkdirSync(join(root, "mappings"));
  const subjects = [
    { ecosystem: "npm", coordinate: "example@1.2.3", path: "npm/example-1.2.3.tgz", sha256: "a".repeat(64) },
    {
      ecosystem: "maven",
      coordinate: "com.example:example-core:4.5.6",
      path: "maven/example-core-4.5.6.jar",
      sha256: "b".repeat(64),
    },
    {
      ecosystem: "maven",
      coordinate: "com.example:example-core:4.5.6",
      path: "maven/example-core-4.5.6.pom",
      sha256: "c".repeat(64),
    },
  ];
  const sboms = [
    {
      id: "npm-example",
      ecosystem: "npm",
      coordinate: "example@1.2.3",
      path: "sbom/npm-example.cdx.json",
      checksums: "mappings/npm-example.sha256",
      subjects: [subjects[0].path],
    },
    {
      id: "maven-example-core",
      ecosystem: "maven",
      coordinate: "com.example:example-core:4.5.6",
      path: "sbom/maven-example-core.cdx.json",
      checksums: "mappings/maven-example-core.sha256",
      subjects: subjects.slice(1).map(subject => subject.path),
    },
  ];
  for (const mapping of sboms) {
    const [name, version] = mapping.ecosystem === "npm" ? ["example", "1.2.3"] : ["example-core", "4.5.6"];
    const component = mapping.ecosystem === "maven" ? { group: "com.example", name, version } : { name, version };
    const document = { bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component } };
    if (mapping.ecosystem === "npm") document.components = [];
    writeFileSync(join(root, mapping.path), JSON.stringify(document));
    writeFileSync(
      join(root, mapping.checksums),
      `${mapping.subjects.map(path => `${subjects.find(subject => subject.path === path).sha256}  ${path}`).join("\n")}\n`,
    );
  }
  return {
    root,
    manifest: {
      schemaVersion: 2,
      versions: { npm: { example: "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } },
      subjects,
      sboms,
    },
  };
}

test("accepts one exact subject family per package or Maven module", t => {
  const { root, manifest } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(validateReleaseSbomManifest(manifest, policy, { root }), []);
});

test("policy v3 retains the independently versioned public evidence manifest v2", t => {
  const { root, manifest } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const collector = readFileSync(new URL("./collect-public-release-evidence.mjs", import.meta.url), "utf8");
  assert.match(collector, /schemaVersion: 2,/u);
  assert.doesNotMatch(collector, /schemaVersion: policy\.schemaVersion/u);
  assert.equal(policy.schemaVersion, 3);
  assert.equal(manifest.schemaVersion, 2);
  assert.deepEqual(validateReleaseSbomManifest(manifest, policy, { root }), []);
});

test("rejects unclassified and ambiguously classified subjects", t => {
  const { root, manifest } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  manifest.subjects.push({
    ecosystem: "npm",
    coordinate: "example@1.2.3",
    path: "npm/unclassified.tgz",
    sha256: "d".repeat(64),
  });
  manifest.sboms[1].subjects.push(manifest.subjects[0].path);
  const problems = validateReleaseSbomManifest(manifest, policy, { root });
  assert.ok(problems.some(problem => problem.includes("has no SBOM mapping")));
  assert.ok(problems.some(problem => problem.includes("ambiguously mapped")));
});

test("rejects cross-coordinate mappings and a misleading SBOM root component", t => {
  const { root, manifest } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  manifest.sboms[0].subjects = [manifest.subjects[1].path];
  writeFileSync(
    join(root, manifest.sboms[0].path),
    JSON.stringify({
      bomFormat: "CycloneDX",
      specVersion: "1.6",
      metadata: { component: { name: "different", version: "9.9.9" } },
      components: [],
    }),
  );
  const problems = validateReleaseSbomManifest(manifest, policy, { root });
  assert.ok(problems.some(problem => problem.includes("crosses artifact boundary")));
  assert.ok(problems.some(problem => problem.includes("not example@1.2.3")));
});

test("rejects duplicate SBOM ownership identifiers and Maven artifact declarations", () => {
  const invalid = structuredClone(policy);
  invalid.maven.modules[0].sbomId = "npm-example";
  invalid.maven.modules[0].artifacts.push({ classifier: "", extension: "jar" });
  const problems = validateReleaseSbomPolicy(invalid);
  assert.ok(problems.some(problem => problem.includes("SBOM id npm-example is declared more than once")));
  assert.ok(problems.some(problem => problem.includes("repeats artifact .jar")));
});

test("requires an explicit, internally consistent signed-SBOM attester trust policy", () => {
  const invalid = structuredClone(policy);
  invalid.trust.repositoryId = "not-a-repository-id";
  invalid.trust.workflowIdentity = "https://github.com/other/workflow.yml@refs/heads/main";
  invalid.trust.allowedTriggers = ["workflow_dispatch", "workflow_dispatch"];
  invalid.trust.minimumTrustedWorkflowCommit = "not-a-commit";
  const problems = validateReleaseSbomPolicy(invalid);
  assert.ok(problems.some(problem => problem.includes("exact repository id")));
  assert.ok(problems.some(problem => problem.includes("canonical workflow identity")));
  assert.ok(problems.some(problem => problem.includes("unique supported workflow triggers")));
  assert.ok(problems.some(problem => problem.includes("minimum trusted workflow commit")));
});

test("rejects checksum files containing an unrelated subject", t => {
  const { root, manifest } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, manifest.sboms[0].checksums), `${"f".repeat(64)}  npm/not-the-subject.tgz\n`);
  const problems = validateReleaseSbomManifest(manifest, policy, { root });
  assert.ok(problems.some(problem => problem.includes("does not contain exactly its mapped subjects")));
});

function evidenceGradleInvocation(path, label) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const start = source.indexOf(label);
  assert.notEqual(start, -1, `Could not find the ${label} evidence command`);
  const end = source.indexOf("\n);", start);
  assert.notEqual(end, -1, `Could not find the end of the ${label} evidence command`);
  return source.slice(start, end);
}

test("JVM evidence Gradle invocations bypass both build and configuration caches", () => {
  const candidateInvocation = evidenceGradleInvocation(
    "./generate-release-evidence.mjs",
    'console.log("Publishing JVM release candidates to the evidence repository...");',
  );
  const publicInvocation = evidenceGradleInvocation(
    "./collect-public-release-evidence.mjs",
    'console.log("Generating one CycloneDX SBOM for each published Maven module...");',
  );

  for (const invocation of [candidateInvocation, publicInvocation]) {
    assert.match(invocation, /"--no-build-cache",/u);
    assert.match(invocation, /"--no-configuration-cache",/u);
  }
});
