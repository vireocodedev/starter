import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { publishVerifiedCandidates, verifyNpmCandidates } from "./publish-verified-npm-candidates.mjs";

const commit = "a".repeat(40);
const packages = [
  "create-vireo",
  "@vireocodedev/history",
  "@vireocodedev/infrastructure",
  "@vireocodedev/localization",
  "@vireocodedev/query",
  "@vireocodedev/shell",
  "@vireocodedev/sqlite",
  "@vireocodedev/ui",
];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "vireo-candidates-"));
  mkdirSync(join(root, "npm"));
  const subjects = packages.map((name, index) => {
    const version = `0.2.${index + 1}`;
    const filename = `${name.replace(/^@/u, "").replaceAll("/", "-")}-${version}.tgz`;
    const bytes = Buffer.from(`${name}@${version}`);
    writeFileSync(join(root, "npm", filename), bytes);
    return {
      path: `npm/${filename}`,
      kind: "npm-package",
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sha512: createHash("sha512").update(bytes).digest("hex"),
    };
  });
  writeFileSync(
    join(root, "release-manifest.json"),
    `${JSON.stringify({
      schemaVersion: 2,
      evidenceClass: "unsigned-release-candidate",
      source: { commit, clean: true },
      versions: { npm: Object.fromEntries(packages.map((name, index) => [name, `0.2.${index + 1}`])) },
      subjects,
    })}\n`,
  );
  return root;
}

test("binds every expected coordinate to unchanged candidate bytes from the exact commit", () => {
  const candidates = verifyNpmCandidates(fixture(), commit);
  assert.equal(candidates.length, 8);
  assert.equal(candidates[0].coordinate, "@vireocodedev/history@0.2.2");
  assert.equal(candidates.at(-1).coordinate, "create-vireo@0.2.1");
});

test("rejects a candidate assembled for another commit", () => {
  assert.throws(() => verifyNpmCandidates(fixture(), "b".repeat(40)), /does not match/u);
});

test("accepts only the generated release-manifest schema", () => {
  for (const schemaVersion of [1, 3]) {
    const root = fixture();
    const manifestPath = join(root, "release-manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.schemaVersion = schemaVersion;
    writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
    assert.throws(() => verifyNpmCandidates(root, commit), /Unsupported release candidate manifest/u);
  }
});

test("rejects candidate bytes changed after verification", () => {
  const root = fixture();
  writeFileSync(join(root, "npm", "create-vireo-0.2.1.tgz"), "tampered");
  assert.throws(() => verifyNpmCandidates(root, commit), /changed after review/u);
});

test("publishes only missing immutable coordinates and reports the exact set", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const published = [];
  const result = await publishVerifiedCandidates(candidates, {
    fetchRegistry: async url => ({ ok: url.includes("history"), status: url.includes("history") ? 200 : 404 }),
    publish: async candidate => published.push(candidate.coordinate),
  });
  assert.deepEqual(result, ["@vireocodedev/infrastructure@0.2.3"]);
  assert.deepEqual(published, result);
});

test("fails closed on registry errors before publishing", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 1);
  await assert.rejects(
    publishVerifiedCandidates(candidates, {
      fetchRegistry: async () => ({ ok: false, status: 503 }),
      publish: async () => assert.fail("publish must not run"),
    }),
    /HTTP 503/u,
  );
});
