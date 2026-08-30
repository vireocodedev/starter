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
    assert.equal(ecosystem.current.template.commit, "b".repeat(40));
    assert.equal(ecosystem.compatibility.sets[0].release, releaseId);
    assert.deepEqual(ecosystem.compatibility.sets[0].npm, {
      "create-vireo": "0.3.0",
      "@vireocodedev/sqlite": "0.2.2",
    });
    assert.equal(ecosystem.compatibility.sets[0].mavenBom, "com.vireocode:vireo-bom:0.4.0");
    assert.equal(ecosystem.compatibility.sets[0].templateCommit, "b".repeat(40));
    assert.equal(ecosystem.supportLines[0].release, releaseId);

    const documentation = readJson(join(root, "contracts", "documentation-release-policy.json"));
    assert.equal(documentation.currentRelease, releaseId);
    assert.equal(documentation.releases[0].id, releaseId);
    assert.deepEqual(documentation.releases[0].npm, [
      { package: "create-vireo", version: "0.3.0" },
      { package: "@vireocodedev/sqlite", version: "0.2.2" },
    ]);
    assert.equal(documentation.releases[0].jvm.version, "0.4.0");
    assert.equal(documentation.releases[0].template.commit, "b".repeat(40));
    assert.equal(
      documentation.releases[0].releaseLinks.jvmTag,
      "https://github.com/vireocodedev/starter/releases/tag/jvm-v0.4.0",
    );
    assert.equal(readJson(join(root, "contracts", "release-lifecycle-policy.json")).supportLines[0].release, releaseId);
    assert.match(readFileSync(join(root, "README.md"), "utf8"), /create-vireo.*0\.3\.0/u);
    assert.match(readFileSync(join(root, "docs", "COMPATIBILITY.md"), "utf8"), /vireo-\*`.*0\.4\.0/u);
    assert.match(readFileSync(join(root, "docs", "DOCUMENTATION_PORTAL.md"), "utf8"), new RegExp(releaseId, "u"));
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "src", "index.ts"), "utf8"),
      /CREATE_VIREO_PACKAGE_VERSION = "0\.3\.0"/u,
    );
    assert.equal(
      readJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json")).target.rootVireoScript,
      "npx --yes --package=create-vireo@0.3.0 vireo",
    );
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

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "vireo-documentation-release-"));
  mkdirSync(join(root, "contracts"));
  mkdirSync(join(root, "packages", "create-vireo", "src"), { recursive: true });
  mkdirSync(join(root, "packages", "create-vireo", "schema"));
  mkdirSync(join(root, "packages", "sqlite"));
  mkdirSync(join(root, "jvm"));
  mkdirSync(join(root, "docs"));
  writeJson(join(root, "packages", "create-vireo", "package.json"), {
    name: "create-vireo",
    version: "0.3.0",
  });
  writeFileSync(
    join(root, "packages", "create-vireo", "src", "index.ts"),
    `export const TEMPLATE_COMMIT = "${"b".repeat(40)}";\nconst CREATE_VIREO_PACKAGE_VERSION = "0.2.0";\n`,
  );
  writeJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json"), {
    target: { rootVireoScript: "npx --yes --package=create-vireo@0.2.0 vireo" },
  });
  writeJson(join(root, "packages", "sqlite", "package.json"), {
    name: "@vireocodedev/sqlite",
    version: "0.2.2",
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
        releaseLinks: { jvmTag: "https://github.com/vireocodedev/starter/releases/tag/jvm-v0.3.0" },
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
  return root;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
