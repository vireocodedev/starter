import assert from "node:assert/strict";
import test from "node:test";
import {
  planTemplateAdoption,
  readBoundedBytes,
  selectSuccessorRelease,
  sha256,
  validateAdoptionPolicy,
  validatePublicDependencies,
} from "./template-release-adoption-state.mjs";

const policy = {
  schemaVersion: 1,
  templateRepository: "vireocodedev/vireo-template",
  templateRepositoryUrl: "https://github.com/vireocodedev/vireo-template",
  releaseTagPrefix: "starter-template@",
  releaseManifestAsset: "template-release-manifest.json",
  adoptionBranchPrefix: "automation/template-",
  prMarkerPrefix: "vireo-template-adoption",
  polling: { maximumReleasePages: 5 },
  requiredNpmPackages: [
    "@vireocodedev/history",
    "@vireocodedev/infrastructure",
    "@vireocodedev/localization",
    "@vireocodedev/query",
    "@vireocodedev/shell",
    "@vireocodedev/sqlite",
    "@vireocodedev/ui",
  ],
  requiredMavenModules: ["vireo-bom", "vireo-core", "vireo-auth", "vireo-query", "vireo-offline", "vireo-history"],
  requiredTemplateBoundFiles: [
    "contracts/template-release-policy.json",
    ".vireo/template.json",
    "package.json",
    "frontend/package.json",
    "frontend/package-lock.json",
    "contracts/vireo-package-compatibility.json",
    "contracts/project-upgrade-policy.json",
    "gradle.properties",
  ],
  automaticPublication: {
    onlyPackage: "create-vireo",
    requireExactImmutableTemplate: true,
    requirePublishedLibraries: true,
    requirePublishedMaven: true,
  },
};
const ecosystem = { current: { template: { version: "0.8.7", commit: "a".repeat(40) } } };
const intent = { status: "adopted", template: { commit: "a".repeat(40) } };
const release = {
  tag_name: "starter-template@0.8.8",
  draft: false,
  prerelease: false,
  immutable: true,
  html_url: "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.8.8",
};
const tag = { name: release.tag_name, annotated: true, commit: "b".repeat(40) };
const artifacts = {
  npm: Object.fromEntries(
    policy.requiredNpmPackages.map((name, index) => [
      name,
      { version: `0.2.${index + 1}`, integrity: `sha512-${"A".repeat(86)}==`, attestationBundleSha256: "f".repeat(64) },
    ]),
  ),
  maven: {
    group: "com.vireocode",
    version: "0.3.2",
    modules: Object.fromEntries(
      policy.requiredMavenModules.map(name => [name, { sha256: "d".repeat(64), signatureSha256: "e".repeat(64) }]),
    ),
  },
};
const files = Object.fromEntries(policy.requiredTemplateBoundFiles.toSorted().map(path => [path, "c".repeat(64)]));
const manifest = {
  schemaVersion: 2,
  version: "0.8.8",
  tag: release.tag_name,
  repository: "vireocodedev/vireo-template",
  releaseUrl: release.html_url,
  commit: tag.commit,
  immutableReleasesRequired: true,
  createVireoVersion: "0.8.8",
  ecosystemRelease: "npm-0.8.8_jvm-0.3.2",
  artifacts: {
    ...artifacts,
    files,
    fileDigest: (await import("node:crypto")).createHash("sha256").update(JSON.stringify(files)).digest("hex"),
    coordinateDigest: (await import("node:crypto"))
      .createHash("sha256")
      .update(JSON.stringify(artifacts))
      .digest("hex"),
  },
};

test("selects the lowest unique strict successor", () => {
  assert.equal(
    selectSuccessorRelease({
      releases: [{ ...release, tag_name: "starter-template@0.8.9" }, release],
      currentVersion: "0.8.7",
      policy,
    }).tag_name,
    release.tag_name,
  );
});
test("adoption policy rejects identity, collection, polling, and automatic-publication drift", () => {
  for (const [description, drift] of [
    ["repository", { templateRepository: "vireocodedev/other" }],
    ["URL", { templateRepositoryUrl: "https://example.invalid/template" }],
    ["npm", { requiredNpmPackages: [...policy.requiredNpmPackages].reverse() }],
    ["Maven", { requiredMavenModules: [...policy.requiredMavenModules].reverse() }],
    ["files", { requiredTemplateBoundFiles: [...policy.requiredTemplateBoundFiles].reverse() }],
    ["polling", { polling: { maximumReleasePages: 4 } }],
    [
      "automatic",
      {
        automaticPublication: {
          onlyPackage: "create-vireo",
          requireExactImmutableTemplate: false,
          requirePublishedLibraries: true,
          requirePublishedMaven: true,
        },
      },
    ],
  ]) {
    assert.notEqual(validateAdoptionPolicy({ ...policy, ...drift }).length, 0, description);
  }
});
test("plans only a fully immutable manifest-bound successor", () => {
  const result = planTemplateAdoption({
    ecosystem,
    intent,
    policy,
    releases: [release],
    tag,
    manifest,
    rawManifestDigest: "f".repeat(64),
  });
  assert.equal(result.action, "stage");
  assert.equal(result.commit, tag.commit);
});
test("rejects a Template manifest without library integrity", () => {
  const result = planTemplateAdoption({
    ecosystem,
    intent,
    policy,
    releases: [release],
    tag,
    rawManifestDigest: "f".repeat(64),
    manifest: {
      ...manifest,
      artifacts: {
        ...manifest.artifacts,
        npm: Object.fromEntries(
          Object.entries(manifest.artifacts.npm).map(([name, entry]) => [name, { ...entry, integrity: undefined }]),
        ),
      },
    },
  });
  assert.equal(result.action, "fail");
  assert.match(result.reason, /SHA-512 integrity/);
});
test("public dependency audit receives candidates accepted by the real publisher adapter shape", async () => {
  let audited;
  const bundles = [{ bundle: { content: "reviewed" } }];
  const plan = {
    npm: [
      {
        name: "@vireocodedev/history",
        version: "0.2.8",
        integrity: `sha512-${"A".repeat(86)}==`,
        attestationBundleSha256: sha256(bundles),
      },
    ],
    maven: { group: "com.vireocode", version: "0.3.2", modules: [], moduleDigests: {} },
  };
  await validatePublicDependencies({
    plan,
    fetchResponse: async () => ({
      ok: true,
      headers: new Headers(),
      arrayBuffer: async () =>
        Buffer.from(
          JSON.stringify({
            name: plan.npm[0].name,
            version: plan.npm[0].version,
            dist: { integrity: plan.npm[0].integrity, attestations: { url: "x" } },
          }),
        ),
    }),
    audit: async candidates => {
      audited = candidates;
      return new Map([[candidates[0].coordinate, { bundles }]]);
    },
  });
  assert.equal(audited[0].integrity, plan.npm[0].integrity);
  assert.equal(audited[0].registryIntegrity, plan.npm[0].integrity);
});

test("bounded public reads cancel a chunked body before retaining an oversized response", async () => {
  let cancelled = false;
  const response = {
    headers: new Headers(),
    body: {
      getReader: () => ({
        read: async () => ({ done: false, value: new Uint8Array(8) }),
        cancel: async () => {
          cancelled = true;
        },
        releaseLock: () => {},
      }),
    },
  };
  await assert.rejects(readBoundedBytes(response, "fixture", 4), /bounded response size/u);
  assert.equal(cancelled, true);
});

test("public dependency validation rejects attestation bundles that differ from the immutable Template digest", async () => {
  const plan = {
    npm: [
      {
        name: "@vireocodedev/history",
        version: "0.2.8",
        integrity: `sha512-${"A".repeat(86)}==`,
        attestationBundleSha256: "0".repeat(64),
      },
    ],
    maven: { group: "com.vireocode", version: "0.3.2", modules: [], moduleDigests: {} },
  };
  await assert.rejects(
    validatePublicDependencies({
      plan,
      fetchResponse: async () => ({
        ok: true,
        headers: new Headers(),
        arrayBuffer: async () =>
          Buffer.from(
            JSON.stringify({
              name: plan.npm[0].name,
              version: plan.npm[0].version,
              dist: { integrity: plan.npm[0].integrity, attestations: { url: "x" } },
            }),
          ),
      }),
      audit: async candidates =>
        new Map([[candidates[0].coordinate, { bundles: [{ bundle: { content: "different" } }] }]]),
    }),
    /attestation bundles do not match/u,
  );
});
