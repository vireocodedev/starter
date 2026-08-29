import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { applyJvmReleaseImpact, bumpSemver } from "./release-impact-version.mjs";

test("applies the highest JVM bump, writes changelog intent, and consumes release records", () => {
  const root = mkdtempSync(join(tmpdir(), "vireo-release-impact-"));
  try {
    mkdirSync(join(root, ".release-impact"));
    mkdirSync(join(root, "jvm"));
    mkdirSync(join(root, "contracts"));
    writeFileSync(
      join(root, "contracts", "release-impact-policy.json"),
      JSON.stringify({
        minimumSummaryLength: 12,
        artifacts: [
          { id: "jvm:vireo-auth", kind: "jvm" },
          { id: "jvm:vireo-offline", kind: "jvm" },
        ],
      }),
    );
    writeFileSync(join(root, "jvm", "gradle.properties"), "group=com.vireocode\nversion=0.2.0\n");
    writeFileSync(join(root, "jvm", "CHANGELOG.md"), "# Vireo JVM changelog\n\n## 0.2.0\n\n- Initial release.\n");
    writeRecord(root, "offline.json", {
      schemaVersion: 1,
      artifact: "jvm:vireo-offline",
      decision: "release",
      bump: "patch",
      summary: "Remove credential-bearing loopback replay.",
    });
    writeRecord(root, "auth.json", {
      schemaVersion: 1,
      artifact: "jvm:vireo-auth",
      decision: "release",
      bump: "minor",
      summary: "Add a compatible authentication extension point.",
    });
    writeRecord(root, "site.json", {
      schemaVersion: 1,
      artifact: "application:documentation-site",
      decision: "release",
      bump: "deploy",
      summary: "Publish current documentation.",
    });

    const result = applyJvmReleaseImpact(root);

    assert.equal(result.version, "0.3.0");
    assert.match(readFileSync(join(root, "jvm", "gradle.properties"), "utf8"), /^version=0\.3\.0$/mu);
    const changelog = readFileSync(join(root, "jvm", "CHANGELOG.md"), "utf8");
    assert.match(changelog, /## 0\.3\.0/u);
    assert.match(changelog, /vireo-auth.*compatible authentication/u);
    assert.match(changelog, /vireo-offline.*loopback replay/u);
    assert.equal(exists(root, "offline.json"), false);
    assert.equal(exists(root, "auth.json"), false);
    assert.equal(exists(root, "site.json"), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("bumps strict semantic versions", () => {
  assert.equal(bumpSemver("0.2.3", "patch"), "0.2.4");
  assert.equal(bumpSemver("0.2.3", "minor"), "0.3.0");
  assert.equal(bumpSemver("0.2.3", "major"), "1.0.0");
  assert.throws(() => bumpSemver("0.2.3-beta.1", "patch"), /Cannot apply/u);
});

test("rejects an unknown JVM artifact before changing version files", () => {
  const root = mkdtempSync(join(tmpdir(), "vireo-release-impact-"));
  try {
    mkdirSync(join(root, ".release-impact"));
    mkdirSync(join(root, "jvm"));
    mkdirSync(join(root, "contracts"));
    writeFileSync(join(root, "jvm", "gradle.properties"), "version=0.2.0\n");
    writeFileSync(
      join(root, "contracts", "release-impact-policy.json"),
      JSON.stringify({
        minimumSummaryLength: 12,
        artifacts: [{ id: "jvm:vireo-auth", kind: "jvm" }],
      }),
    );
    writeRecord(root, "unknown.json", {
      schemaVersion: 1,
      artifact: "jvm:not-real",
      decision: "release",
      bump: "patch",
      summary: "This artifact is outside the release contract.",
    });

    assert.throws(() => applyJvmReleaseImpact(root), /not a valid JVM release-impact record/u);
    assert.match(readFileSync(join(root, "jvm", "gradle.properties"), "utf8"), /version=0\.2\.0/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function writeRecord(root, name, value) {
  writeFileSync(join(root, ".release-impact", name), `${JSON.stringify(value, null, 2)}\n`);
}

function exists(root, name) {
  try {
    readFileSync(join(root, ".release-impact", name));
    return true;
  } catch {
    return false;
  }
}
