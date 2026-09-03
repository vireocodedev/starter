import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { planAutomaticTemplatePublication } from "./npm-template-adoption-publication-plan.mjs";
import { stageTemplateAdoption } from "./stage-template-adoption.mjs";
import { planTemplateAdoption } from "./template-release-adoption-state.mjs";

const libraries = [
  "@vireocodedev/history",
  "@vireocodedev/infrastructure",
  "@vireocodedev/localization",
  "@vireocodedev/query",
  "@vireocodedev/shell",
  "@vireocodedev/sqlite",
  "@vireocodedev/ui",
];
const modules = ["vireo-bom", "vireo-core", "vireo-auth", "vireo-query", "vireo-offline", "vireo-history"];
const boundFiles = [
  "contracts/template-release-policy.json",
  ".vireo/template.json",
  "package.json",
  "frontend/package.json",
  "frontend/package-lock.json",
  "contracts/vireo-package-compatibility.json",
  "contracts/project-upgrade-policy.json",
  "gradle.properties",
];
const policy = {
  schemaVersion: 1,
  templateRepository: "vireocodedev/vireo-template",
  templateRepositoryUrl: "https://github.com/vireocodedev/vireo-template",
  releaseTagPrefix: "starter-template@",
  releaseManifestAsset: "template-release-manifest.json",
  adoptionBranchPrefix: "automation/template-",
  prMarkerPrefix: "vireo-template-adoption",
  polling: { maximumReleasePages: 5 },
  requiredNpmPackages: libraries,
  requiredMavenModules: modules,
  requiredTemplateBoundFiles: boundFiles,
  automaticPublication: {
    onlyPackage: "create-vireo",
    requireExactImmutableTemplate: true,
    requirePublishedLibraries: true,
    requirePublishedMaven: true,
  },
};

test("immutable Template manifest produces a draft receipt and a CLI-only automatic publication plan", async () => {
  const artifacts = {
    npm: Object.fromEntries(
      libraries.map(name => [
        name,
        { version: "0.2.8", integrity: `sha512-${"A".repeat(86)}==`, attestationBundleSha256: "f".repeat(64) },
      ]),
    ),
    maven: {
      group: "com.vireocode",
      version: "0.3.2",
      modules: Object.fromEntries(
        modules.map(name => [name, { sha256: "d".repeat(64), signatureSha256: "e".repeat(64) }]),
      ),
    },
  };
  const release = {
    tag_name: "starter-template@0.8.8",
    draft: false,
    prerelease: false,
    immutable: true,
    html_url: "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.8.8",
  };
  const tag = { name: release.tag_name, annotated: true, commit: "b".repeat(40) };
  const files = Object.fromEntries(boundFiles.toSorted().map(path => [path, "c".repeat(64)]));
  const manifest = {
    schemaVersion: 2,
    version: "0.8.8",
    tag: release.tag_name,
    repository: policy.templateRepository,
    releaseUrl: release.html_url,
    commit: tag.commit,
    immutableReleasesRequired: true,
    createVireoVersion: "0.8.8",
    ecosystemRelease: "npm-0.8.8_jvm-0.3.2",
    artifacts: {
      ...artifacts,
      files,
      fileDigest: createHash("sha256").update(JSON.stringify(files)).digest("hex"),
      coordinateDigest: createHash("sha256").update(JSON.stringify(artifacts)).digest("hex"),
    },
  };
  const ecosystem = {
    current: { template: { version: "0.8.7", commit: "a".repeat(40) }, maven: { version: "0.3.2" } },
  };
  const intent = { status: "adopted", template: { commit: "a".repeat(40) } };
  const adoption = planTemplateAdoption({
    ecosystem,
    intent,
    policy,
    releases: [release],
    tag,
    manifest,
    rawManifestDigest: "f".repeat(64),
  });
  assert.equal(adoption.action, "stage");
  const staged = stageTemplateAdoption({ plan: adoption, dryRun: true });
  assert.equal(staged.action, "draft");
  const finalizedIntent = { ...staged.receipt, status: "adopted" };
  const publication = await planAutomaticTemplatePublication({
    ecosystem: {
      current: {
        id: "npm-0.8.8_jvm-0.3.2",
        template: {
          repository: "https://github.com/vireocodedev/vireo-template",
          commit: tag.commit,
          version: "0.8.8",
          tag: release.tag_name,
          releaseUrl: release.html_url,
        },
        npm: [{ name: "create-vireo", version: "0.8.8" }, ...libraries.map(name => ({ name, version: "0.2.8" }))],
        maven: { group: "com.vireocode", version: "0.3.2", modules },
      },
    },
    intent: finalizedIntent,
    manifests: [{ name: "create-vireo", version: "0.8.8" }, ...libraries.map(name => ({ name, version: "0.2.8" }))],
    policy,
    rebind: async () => true,
    fetchResponse: async url => ({
      status: url.includes("create-vireo") ? 404 : 200,
      ok: !url.includes("create-vireo"),
    }),
  });
  assert.equal(publication.action, "publish-create-vireo");
});
