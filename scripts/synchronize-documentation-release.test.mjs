import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { synchronizeDocumentationRelease } from "./synchronize-documentation-release.mjs";

test("synchronizes release contracts and public version documentation from source", async () => {
  const root = makeFixture();
  try {
    await synchronizeDocumentationRelease(root);

    const releaseId = "npm-0.3.0_jvm-0.4.0";
    const ecosystem = readJson(join(root, "contracts", "ecosystem-release-contract.json"));
    assert.equal(ecosystem.current.id, releaseId);
    assert.deepEqual(
      ecosystem.current.npm.map(({ name, version }) => ({ name, version })),
      [
        { name: "create-vireo", version: "0.3.0" },
        { name: "@vireocodedev/sqlite", version: "0.2.2" },
      ],
    );
    assert.equal(ecosystem.current.maven.version, "0.4.0");
    assert.equal(ecosystem.current.template.version, "0.3.0");
    assert.equal(ecosystem.current.template.tag, "starter-template@0.3.0");
    assert.equal(ecosystem.current.template.commit, "b".repeat(40));
    assert.equal(
      ecosystem.current.template.releaseUrl,
      "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.3.0",
    );
    assert.equal(ecosystem.compatibility.sets[0].release, releaseId);
    assert.deepEqual(ecosystem.compatibility.sets[0].npm, {
      "create-vireo": "0.3.0",
      "@vireocodedev/sqlite": "0.2.2",
    });
    assert.equal(ecosystem.compatibility.sets[0].mavenBom, "com.vireocode:vireo-bom:0.4.0");
    assert.equal(ecosystem.compatibility.sets[0].templateVersion, "0.3.0");
    assert.equal(ecosystem.compatibility.sets[0].templateTag, "starter-template@0.3.0");
    assert.equal(ecosystem.compatibility.sets[0].templateCommit, "b".repeat(40));
    assert.equal(
      ecosystem.compatibility.sets[0].templateReleaseUrl,
      "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.3.0",
    );
    assert.equal(ecosystem.supportLines[0].release, releaseId);

    const documentation = readJson(join(root, "contracts", "documentation-release-policy.json"));
    assert.equal(documentation.currentRelease, releaseId);
    assert.equal(documentation.releases[0].id, releaseId);
    assert.deepEqual(documentation.releases[0].npm, [
      { package: "create-vireo", version: "0.3.0" },
      { package: "@vireocodedev/sqlite", version: "0.2.2" },
    ]);
    assert.equal(documentation.releases[0].jvm.version, "0.4.0");
    assert.equal(documentation.releases[0].template.version, "0.3.0");
    assert.equal(documentation.releases[0].template.tag, "starter-template@0.3.0");
    assert.equal(documentation.releases[0].template.commit, "b".repeat(40));
    assert.equal(
      documentation.releases[0].template.releaseUrl,
      "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.3.0",
    );
    assert.equal(
      documentation.releases[0].releaseLinks.jvmTag,
      "https://github.com/vireocodedev/vireo/releases/tag/jvm-v0.4.0",
    );
    assert.equal(
      documentation.releases[0].releaseLinks.template,
      "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.3.0",
    );
    assert.equal(readJson(join(root, "contracts", "release-lifecycle-policy.json")).supportLines[0].release, releaseId);
    assert.match(readFileSync(join(root, "README.md"), "utf8"), /create-vireo.*0\.3\.0/u);
    assert.match(readFileSync(join(root, "docs", "COMPATIBILITY.md"), "utf8"), /vireo-\*`.*0\.4\.0/u);
    assert.match(readFileSync(join(root, "docs", "DOCUMENTATION_PORTAL.md"), "utf8"), new RegExp(releaseId, "u"));
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "src", "index.ts"), "utf8"),
      /CREATE_VIREO_PACKAGE_VERSION = "0\.3\.0"/u,
    );
    const upgradePolicy = readJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json"));
    assert.equal(
      upgradePolicy.releaseGraph.releases.find(
        release =>
          release.release === (upgradePolicy.releaseGraph.candidateRelease ?? upgradePolicy.releaseGraph.publicRelease),
      ).rootVireoScript,
      "npx --yes --package=create-vireo@0.3.0 vireo",
    );
    const packageLock = readJson(join(root, "package-lock.json"));
    assert.equal(packageLock.packages["packages/create-vireo"].version, "0.3.0");
    assert.equal(packageLock.packages["packages/sqlite"].version, "0.2.2");
    for (const path of ["site/content/current.md", "site/content/manifest.json", "site/verify.mjs"]) {
      const source = readFileSync(join(root, path), "utf8");
      assert.ok(source.includes("b".repeat(40)), path);
      assert.ok(!source.includes("a".repeat(40)), path);
    }
    assert.ok(readFileSync(join(root, "site/dist/current.md"), "utf8").includes("a".repeat(40)));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails closed when release artifacts drift from public workspaces", async () => {
  const root = makeFixture();
  try {
    const ecosystemPath = join(root, "contracts", "ecosystem-release-contract.json");
    const ecosystem = readJson(ecosystemPath);
    ecosystem.current.npm.pop();
    writeJson(ecosystemPath, ecosystem);

    await assert.rejects(
      synchronizeDocumentationRelease(root),
      /Ecosystem release npm artifacts do not match the public workspaces/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails closed when a public workspace is missing from the root package lock", async () => {
  const root = makeFixture();
  try {
    const packageLockPath = join(root, "package-lock.json");
    const packageLock = readJson(packageLockPath);
    delete packageLock.packages["packages/create-vireo"];
    writeJson(packageLockPath, packageLock);

    await assert.rejects(
      synchronizeDocumentationRelease(root),
      /Root package-lock\.json is missing public workspace entry packages\/create-vireo/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "vireo-documentation-release-"));
  mkdirSync(join(root, "contracts"));
  mkdirSync(join(root, "packages", "create-vireo", "src"), { recursive: true });
  mkdirSync(join(root, "packages", "create-vireo", "schema"));
  mkdirSync(join(root, "packages", "sqlite"));
  mkdirSync(join(root, "jvm"));
  mkdirSync(join(root, "docs"));
  mkdirSync(join(root, "site", "content"), { recursive: true });
  mkdirSync(join(root, "site", "dist"), { recursive: true });
  writeJson(join(root, "packages", "create-vireo", "package.json"), {
    name: "create-vireo",
    version: "0.3.0",
  });
  writeFileSync(
    join(root, "packages", "create-vireo", "src", "index.ts"),
    `export const TEMPLATE_COMMIT = "${"b".repeat(40)}";\nconst CREATE_VIREO_PACKAGE_VERSION = "0.2.0";\n`,
  );
  writeJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json"), {
    schemaVersion: 2,
    releaseGraph: {
      publicRelease: "0.2.0",
      candidateRelease: "0.3.0",
      previousRelease: "0.2.0",
      releases: [
        { release: "0.2.0", status: "upgrade-source" },
        { release: "0.3.0", status: "current", rootVireoScript: "npx --yes --package=create-vireo@0.2.0 vireo" },
      ],
      edges: [{ from: "0.2.0", to: "0.3.0", applicationOwnedActions: [] }],
    },
  });
  writeJson(join(root, "packages", "sqlite", "package.json"), {
    name: "@vireocodedev/sqlite",
    version: "0.2.2",
  });
  writeJson(join(root, "package-lock.json"), {
    lockfileVersion: 3,
    packages: {
      "": { name: "fixture" },
      "packages/create-vireo": { version: "0.2.0" },
      "packages/sqlite": { version: "0.2.1" },
    },
  });
  writeFileSync(join(root, "jvm", "gradle.properties"), "group=com.vireocode\nversion=0.4.0\n");
  writeJson(join(root, "contracts", "ecosystem-release-contract.json"), {
    current: {
      id: "npm-0.2.0_jvm-0.3.0",
      npm: [
        { name: "create-vireo", version: "0.2.0", role: "scaffolder" },
        { name: "@vireocodedev/sqlite", version: "0.2.1", role: "offline" },
      ],
      maven: { group: "com.vireocode", version: "0.3.0" },
      template: { commit: "a".repeat(40) },
    },
    compatibility: {
      defaultSet: "current",
      sets: [
        {
          id: "current",
          release: "npm-0.2.0_jvm-0.3.0",
          npm: { "create-vireo": "0.2.0", "@vireocodedev/sqlite": "0.2.1" },
          mavenBom: "com.vireocode:vireo-bom:0.3.0",
          templateCommit: "a".repeat(40),
        },
      ],
    },
    supportLines: [{ id: "current", release: "npm-0.2.0_jvm-0.3.0" }],
  });
  writeJson(join(root, "contracts", "documentation-release-policy.json"), {
    currentRelease: "npm-0.2.0_jvm-0.3.0",
    releases: [
      {
        id: "npm-0.2.0_jvm-0.3.0",
        npm: [
          { package: "create-vireo", version: "0.2.0" },
          { package: "@vireocodedev/sqlite", version: "0.2.1" },
        ],
        jvm: { version: "0.3.0" },
        template: { commit: "a".repeat(40) },
        releaseLinks: { jvmTag: "https://github.com/vireocodedev/vireo/releases/tag/jvm-v0.3.0" },
      },
    ],
  });
  writeJson(join(root, "contracts", "release-lifecycle-policy.json"), {
    supportLines: [{ id: "current", release: "npm-0.2.0_jvm-0.3.0" }],
  });
  writeFileSync(
    join(root, "README.md"),
    "| Package | Version |\n| --- | --- |\n| `create-vireo` | 0.2.0 |\n| `@vireocodedev/sqlite` | 0.2.1 |\n",
  );
  writeFileSync(
    join(root, "docs", "COMPATIBILITY.md"),
    "| Artifact | Version |\n| --- | --- |\n| `create-vireo` | 0.2.0 |\n| `@vireocodedev/sqlite` | 0.2.1 |\n| `com.vireocode:vireo-*` | 0.3.0 |\n",
  );
  writeFileSync(join(root, "docs", "DOCUMENTATION_PORTAL.md"), "Current snapshot: `npm-0.2.0_jvm-0.3.0`.\n");
  writeFileSync(join(root, "site/content/current.md"), `Current Template: ${"a".repeat(40)}\n`);
  writeFileSync(join(root, "site/content/manifest.json"), JSON.stringify({ currentTemplate: "a".repeat(40) }));
  writeFileSync(join(root, "site/verify.mjs"), `export const currentTemplate = "${"a".repeat(40)}";\n`);
  writeFileSync(join(root, "site/dist/current.md"), `Archived Template: ${"a".repeat(40)}\n`);
  return root;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
