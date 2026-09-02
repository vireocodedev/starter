import assert from "node:assert/strict";
import test from "node:test";
import {
  peelGitHubTag,
  validateReleasePreflightIdentity,
  verifyPublicReleasePreflight,
  vireoReleaseImmutabilityFinding,
} from "./anonymous-consumer-release-preflight.mjs";

const release = { id: "npm-0.8.1_jvm-0.3.1", template: { commit: "a".repeat(40) } };
test("release preflight binds exact release and source coordinates", () => {
  assert.deepEqual(
    validateReleasePreflightIdentity({
      release,
      requestedReleaseId: release.id,
      requestedSourceCommit: "b".repeat(40),
      verifierSourceCommit: "b".repeat(40),
    }),
    [],
  );
  assert.deepEqual(
    validateReleasePreflightIdentity({
      release,
      requestedReleaseId: "npm-0.8.0_jvm-0.3.1",
      verifierSourceCommit: "b".repeat(40),
    }),
    ["requested release id does not match ecosystem current release"],
  );
  assert.deepEqual(
    validateReleasePreflightIdentity({
      release,
      requestedReleaseId: "npm-0.8.1_jvm-0.3.1-extra",
      verifierSourceCommit: "b".repeat(40),
    }),
    ["requested release id is not an exact npm-x.y.z_jvm-x.y.z release id"],
  );
});
test("only the historical Template release immutability warning is narrow", () => {
  assert.equal(vireoReleaseImmutabilityFinding({ version: "0.8.1", immutable: false }).category, "external-warning");
  assert.throws(() => vireoReleaseImmutabilityFinding({ version: "0.8.2", immutable: false }));
});
test("annotated GitHub tags are peeled to an exact commit", async () => {
  const responses = [
    { ok: true, json: async () => ({ object: { type: "tag", url: "https://example.invalid/tag" } }) },
    { ok: true, json: async () => ({ object: { type: "commit", sha: "c".repeat(40) } }) },
  ];
  assert.equal(
    await peelGitHubTag({ repository: "vireo/template", tag: "v1", fetchImpl: async () => responses.shift() }),
    "c".repeat(40),
  );
  await assert.rejects(
    peelGitHubTag({
      repository: "vireo/template",
      tag: "v1",
      fetchImpl: async () => ({ ok: true, json: async () => ({ object: { type: "commit", sha: "wrong" } }) }),
    }),
  );
});
test("provider preflight accepts only the exact immutable Template manifest", async () => {
  const commit = "c".repeat(40);
  const release = {
    id: "npm-1.2.3_jvm-4.5.6",
    createVireoVersion: "1.2.3",
    npm: [{ name: "create-vireo", version: "1.2.3" }],
    maven: { group: "com.vireocode", version: "4.5.6", modules: ["vireo-core"] },
    template: { version: "1.2.3", tag: "starter-template@1.2.3", commit },
  };
  const manifest = {
    schemaVersion: 1,
    version: "1.2.3",
    tag: release.template.tag,
    createVireoVersion: "1.2.3",
    ecosystemRelease: release.id,
    repository: "vireocodedev/vireo-template",
    immutableReleasesRequired: true,
    commit,
  };
  const fetchImpl = async url => ({
    ok: true,
    json: async () => {
      if (url.includes("registry.npmjs"))
        return {
          name: "create-vireo",
          version: "1.2.3",
          dist: { integrity: "sha512-x", attestations: { url: "https://attestation" } },
        };
      if (url.includes("releases/tags/starter"))
        return {
          tag_name: release.template.tag,
          immutable: true,
          assets: [{ name: "release-manifest.json", browser_download_url: "https://asset" }],
        };
      if (url === "https://asset") return manifest;
      if (url.includes("releases/tags/create")) return { tag_name: "create-vireo@1.2.3", immutable: true };
      return { object: { type: "commit", sha: commit } };
    },
  });
  assert.equal((await verifyPublicReleasePreflight({ release, fetchImpl })).releaseTagCommit, commit);
  manifest.repository = "wrong";
  await assert.rejects(verifyPublicReleasePreflight({ release, fetchImpl }), /manifest/u);
});
