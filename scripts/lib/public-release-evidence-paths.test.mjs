import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  manifestEvidencePath,
  manifestEvidenceRoot,
  outputRelativePathsOption,
  parsePublicEvidenceCollectorArguments,
} from "./public-release-evidence-paths.mjs";
import { validateReleaseSbomManifest } from "./release-sbom-evidence.mjs";

test("collector defaults to repository-relative paths for release attestation", () => {
  const repositoryRoot = "/workspace/vireo";
  const outputRoot = join(repositoryRoot, ".public-release-evidence");
  const subject = join(outputRoot, "subjects", "npm", "create-vireo-0.8.1.tgz");

  assert.deepEqual(parsePublicEvidenceCollectorArguments([".public-release-evidence"]), {
    outputArgument: ".public-release-evidence",
    outputRelativePaths: false,
  });
  assert.equal(
    manifestEvidencePath({ repositoryRoot, outputRoot, path: subject, outputRelativePaths: false }),
    ".public-release-evidence/subjects/npm/create-vireo-0.8.1.tgz",
  );
  assert.equal(manifestEvidenceRoot({ repositoryRoot, outputRoot, outputRelativePaths: false }), repositoryRoot);
});

test("nested collector output records paths relative to its evidence root and validates", t => {
  const root = mkdtempSync(join(tmpdir(), "vireo-public-evidence-paths-"));
  const repositoryRoot = join(root, "checkout");
  const outputRoot = join(root, "anonymous", "public-release-evidence");
  const subjectFile = join(outputRoot, "subjects", "npm", "example-1.2.3.tgz");
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(outputRoot, "subjects", "npm"), { recursive: true });
  mkdirSync(join(outputRoot, "sbom"), { recursive: true });
  mkdirSync(join(outputRoot, "mappings"), { recursive: true });
  writeFileSync(subjectFile, "exact public bytes");

  const subjectPath = manifestEvidencePath({ repositoryRoot, outputRoot, path: subjectFile, outputRelativePaths: true });
  assert.equal(subjectPath, "subjects/npm/example-1.2.3.tgz");
  assert.equal(manifestEvidenceRoot({ repositoryRoot, outputRoot, outputRelativePaths: true }), outputRoot);
  assert.ok(existsSync(join(outputRoot, subjectPath)), "nested evidence resolves the subject exactly once");
  assert.deepEqual(parsePublicEvidenceCollectorArguments(["nested", outputRelativePathsOption]), {
    outputArgument: "nested",
    outputRelativePaths: true,
  });

  const policy = {
    schemaVersion: 2,
    npm: { expectedSubjectCount: 1, packages: [{ name: "example", directory: "example", sbomId: "npm-example" }] },
    maven: { group: "com.example", expectedSubjectCount: 0, modules: [] },
  };
  const manifest = {
    schemaVersion: 2,
    versions: { npm: { example: "1.2.3" }, maven: { group: "com.example", version: "1.2.3" } },
    subjects: [{ ecosystem: "npm", coordinate: "example@1.2.3", path: subjectPath, sha256: "a".repeat(64) }],
    sboms: [
      {
        id: "npm-example",
        ecosystem: "npm",
        coordinate: "example@1.2.3",
        path: "sbom/npm-example.cdx.json",
        checksums: "mappings/npm-example.sha256",
        subjects: [subjectPath],
      },
    ],
  };
  writeFileSync(
    join(outputRoot, "sbom", "npm-example.cdx.json"),
    JSON.stringify({ bomFormat: "CycloneDX", specVersion: "1.6", metadata: { component: { name: "example", version: "1.2.3" } } }),
  );
  writeFileSync(join(outputRoot, "mappings", "npm-example.sha256"), `${"a".repeat(64)}  ${subjectPath}\n`);
  assert.deepEqual(validateReleaseSbomManifest(manifest, policy, { root: outputRoot }), []);
});

test("collector rejects ambiguous path modes", () => {
  assert.throws(() => parsePublicEvidenceCollectorArguments(["output", "--unknown"]), /Usage:/u);
});
