import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  planAutomaticTemplatePublication,
  planNpmPublication,
  rebindImmutableTemplateIntent,
  requireNonFailingPublicationPlan,
} from "./npm-template-adoption-publication-plan.mjs";

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
const template = {
  repository: "vireocodedev/vireo-template",
  commit: "a".repeat(40),
  version: "0.8.8",
  tag: "starter-template@0.8.8",
  releaseUrl: "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.8.8",
};
const npm = libraries.map(name => ({
  name,
  version: "0.2.8",
  integrity: `sha512-${"A".repeat(86)}==`,
  attestationBundleSha256: "b".repeat(64),
}));
const maven = {
  group: "com.vireocode",
  version: "0.3.1",
  modules,
  moduleDigests: Object.fromEntries(
    modules.map(name => [name, { sha256: "c".repeat(64), signatureSha256: "d".repeat(64) }]),
  ),
};
const intent = {
  schemaVersion: 1,
  status: "adopted",
  template,
  createVireoVersion: "0.8.8",
  ecosystemRelease: "npm-0.8.8_jvm-0.3.1",
  releaseManifestSha256: "a".repeat(64),
  npm,
  maven,
  source: "immutable-template-release",
};
const ecosystem = {
  current: {
    id: "npm-0.8.8_jvm-0.3.1",
    template: { ...template, repository: "https://github.com/vireocodedev/vireo-template" },
    npm: [{ name: "create-vireo", version: "0.8.8" }, ...libraries.map(name => ({ name, version: "0.2.8" }))],
    maven: { group: "com.vireocode", version: "0.3.1", modules },
  },
};
const manifests = [{ name: "create-vireo", version: "0.8.8" }, ...libraries.map(name => ({ name, version: "0.2.8" }))];
const rebind = async () => true;

function responseJson(value) {
  return { ok: true, status: 200, json: async () => value };
}
function immutableManifestFixture(commit = template.commit) {
  const publicNpm = Object.fromEntries(
    npm.map(({ name, version, integrity, attestationBundleSha256 }) => [
      name,
      { version, integrity, attestationBundleSha256 },
    ]),
  );
  const publicMaven = { group: maven.group, version: maven.version, modules: maven.moduleDigests };
  const files = Object.fromEntries(policy.requiredTemplateBoundFiles.toSorted().map(path => [path, "e".repeat(64)]));
  return {
    schemaVersion: 2,
    version: template.version,
    tag: template.tag,
    repository: policy.templateRepository,
    releaseUrl: template.releaseUrl,
    commit,
    immutableReleasesRequired: true,
    createVireoVersion: template.version,
    ecosystemRelease: intent.ecosystemRelease,
    artifacts: {
      npm: publicNpm,
      maven: publicMaven,
      files,
      coordinateDigest: createHash("sha256")
        .update(JSON.stringify({ npm: publicNpm, maven: publicMaven }))
        .digest("hex"),
      fileDigest: createHash("sha256").update(JSON.stringify(files)).digest("hex"),
    },
  };
}
function publicTemplateFetch(manifest, commit = template.commit) {
  const bytes = Buffer.from(JSON.stringify(manifest));
  const asset = {
    name: policy.releaseManifestAsset,
    browser_download_url:
      "https://github.com/vireocodedev/vireo-template/releases/download/template-release-manifest.json",
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  };
  const release = {
    tag_name: template.tag,
    html_url: template.releaseUrl,
    draft: false,
    prerelease: false,
    immutable: true,
    assets: [asset],
  };
  return async url => {
    if (url.includes("/releases/tags/")) return responseJson(release);
    if (url.includes("/git/ref/tags/")) return responseJson({ object: { type: "tag", sha: "f".repeat(40) } });
    if (url.includes("/git/tags/")) return responseJson({ object: { type: "commit", sha: commit } });
    if (url.includes("/compare/")) return responseJson({ status: "identical" });
    if (url === asset.browser_download_url)
      return { ok: true, status: 200, headers: new Headers(), arrayBuffer: async () => bytes };
    throw new Error(`Unexpected URL ${url}`);
  };
}
test("automatic mode permits exactly an absent create-vireo coordinate", async () => {
  const result = await planAutomaticTemplatePublication({
    ecosystem,
    intent,
    manifests,
    policy,
    rebind,
    fetchResponse: async url => ({
      status: url.includes("create-vireo") ? 404 : 200,
      ok: !url.includes("create-vireo"),
    }),
  });
  assert.deepEqual(result, { action: "publish-create-vireo", coordinate: "create-vireo@0.8.8" });
});
test("automatic mode fails closed when any library is absent", async () => {
  const result = await planAutomaticTemplatePublication({
    ecosystem,
    intent,
    manifests,
    policy,
    rebind,
    fetchResponse: async () => ({ status: 404, ok: false }),
  });
  assert.equal(result.action, "fail");
});
test("a failed automatic publication plan exits the workflow command nonzero", () => {
  assert.throws(
    () => requireNonFailingPublicationPlan({ action: "fail", reason: "registry drift" }),
    /registry drift/u,
  );
  assert.equal(requireNonFailingPublicationPlan({ action: "no-op" }).action, "no-op");
});

test("a confirmed manual dispatch preserves the ordinary release path while an automatic shallow receipt fails closed", async () => {
  const manual = await planNpmPublication({
    confirmation: "publish",
    ecosystem: {},
    intent: {},
    manifests: [],
    fetchResponse: async () => assert.fail("manual release must not consult adoption evidence"),
  });
  assert.equal(manual.action, "manual-confirmed");
  const automatic = await planNpmPublication({
    ecosystem: {},
    intent: {},
    manifests: [],
    fetchResponse: async () => assert.fail("shallow automatic receipt must fail before networking"),
  });
  assert.equal(automatic.action, "fail");
});

test("automatic planning rejects a synthesized finalized receipt with missing immutable evidence before registry reads", async () => {
  const result = await planAutomaticTemplatePublication({
    ecosystem,
    intent: { ...intent, npm: intent.npm.map(entry => ({ ...entry, attestationBundleSha256: undefined })) },
    manifests,
    policy,
    fetchResponse: async () => assert.fail("registry or provider reads must not start for incomplete receipt evidence"),
  });
  assert.equal(result.action, "fail");
  assert.match(result.reason, /npm evidence is invalid/u);
});

test("public Template rebinding rejects a changed receipt and ecosystem commit when the immutable public tag remains unchanged", async () => {
  const changed = "9".repeat(40);
  const changedIntent = { ...intent, template: { ...intent.template, commit: changed } };
  const changedEcosystem = {
    ...ecosystem,
    current: { ...ecosystem.current, template: { ...ecosystem.current.template, commit: changed } },
  };
  await assert.rejects(
    rebindImmutableTemplateIntent({
      ecosystem: changedEcosystem,
      intent: changedIntent,
      policy,
      fetchResponse: publicTemplateFetch(immutableManifestFixture()),
    }),
    /tag commit does not exactly match/u,
  );
});

test("public Template rebinding rejects a manifest asset whose reviewed npm evidence differs", async () => {
  const manifest = immutableManifestFixture();
  manifest.artifacts.npm[libraries[0]].integrity = `sha512-${"B".repeat(86)}==`;
  manifest.artifacts.coordinateDigest = createHash("sha256")
    .update(JSON.stringify({ npm: manifest.artifacts.npm, maven: manifest.artifacts.maven }))
    .digest("hex");
  const bytes = Buffer.from(JSON.stringify(manifest));
  const boundIntent = { ...intent, releaseManifestSha256: createHash("sha256").update(bytes).digest("hex") };
  await assert.rejects(
    rebindImmutableTemplateIntent({
      ecosystem,
      intent: boundIntent,
      policy,
      fetchResponse: publicTemplateFetch(manifest),
    }),
    /npm evidence does not match/u,
  );
});
test("recovery is emitted for an exact immutable manifest receipt once all packages are public", async () => {
  const result = await planAutomaticTemplatePublication({
    ecosystem,
    intent,
    manifests,
    policy,
    rebind,
    fetchResponse: async url => {
      const isGitHubApi = new URL(url).hostname === "api.github.com";
      return { status: isGitHubApi ? 404 : 200, ok: !isGitHubApi };
    },
  });
  assert.equal(result.action, "recover-create-vireo");
});
test("recovery converges to no-op only after the exact tag has a successful release workflow", async () => {
  const result = await planAutomaticTemplatePublication({
    ecosystem,
    intent,
    manifests,
    policy,
    rebind,
    fetchResponse: async url => {
      if (url.includes("git/ref"))
        return { status: 200, ok: true, json: async () => ({ object: { type: "tag", sha: "b".repeat(40) } }) };
      if (url.includes("git/tags"))
        return { status: 200, ok: true, json: async () => ({ object: { type: "commit", sha: "c".repeat(40) } }) };
      if (url.includes("/deployments?"))
        return { status: 200, ok: true, json: async () => [{ id: 1, sha: "c".repeat(40) }] };
      if (url.includes("/deployments/1/statuses"))
        return { status: 200, ok: true, json: async () => [{ state: "success" }] };
      if (url.includes("template-adoption-intent"))
        return {
          status: 200,
          ok: true,
          json: async () => ({
            encoding: "base64",
            content: Buffer.from(JSON.stringify({ ...intent, releaseManifestSha256: "a".repeat(64) })).toString(
              "base64",
            ),
          }),
        };
      if (url.includes("packages/create-vireo"))
        return {
          status: 200,
          ok: true,
          json: async () => ({
            encoding: "base64",
            content: Buffer.from(JSON.stringify({ version: "0.8.8" })).toString("base64"),
          }),
        };
      if (url.includes("ecosystem-release"))
        return {
          status: 200,
          ok: true,
          json: async () => ({
            encoding: "base64",
            content: Buffer.from(JSON.stringify({ current: { template: { commit: "a".repeat(40) } } })).toString(
              "base64",
            ),
          }),
        };
      return { status: 200, ok: true };
    },
  });
  assert.equal(result.action, "no-op");
});
