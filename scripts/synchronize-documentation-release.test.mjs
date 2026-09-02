import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateReleaseImpact } from "./release-impact-policy.mjs";
import { synchronizeDocumentationRelease } from "./synchronize-documentation-release.mjs";

test("synchronizes release contracts and public version documentation from source", async () => {
  const root = makeFixture();
  try {
    await synchronizeFixtureDocumentationRelease(root);

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
    assert.equal(
      documentation.releases.length,
      1,
      "a patch promotion keeps the current friendly documentation line in place",
    );
    assert.equal(documentation.releases[0].id, releaseId);
    assert.equal(documentation.releases[0].documentationVersion, "0.2");
    assert.equal(documentation.releases[0].documentationLabel, "Vireo 0.2");
    assert.equal(documentation.releases[0].status, "current");
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
    assert.match(readFileSync(join(root, "README.md"), "utf8"), /adjacent 0\.2\.0→0\.3\.0/u);
    assert.match(
      readFileSync(join(root, "README.md"), "utf8"),
      /0\.1\.0→0\.2\.0 remains retained historical evidence/u,
    );
    const compatibilityMarkdown = readFileSync(join(root, "docs", "COMPATIBILITY.md"), "utf8");
    assert.match(compatibilityMarkdown, /vireo-\*`.*0\.4\.0/u);
    assert.match(compatibilityMarkdown, /edge is 0\.2\.0→0\.3\.0/u);
    assert.match(compatibilityMarkdown, /starter-template@0\.3\.0/u);
    assert.doesNotMatch(compatibilityMarkdown, /JVM release\.\./u);
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "README.md"), "utf8"),
      /0\.2\.0 upgraded to 0\.3\.0/u,
    );
    assert.match(readFileSync(join(root, "packages", "create-vireo", "README.md"), "utf8"), /--to 0\.3\.0 --dry-run/u);
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "README.md"), "utf8"),
      /historical 0\.1\.0→0\.2\.0 edge/u,
    );
    assert.match(
      readFileSync(join(root, "docs", "NPM_RELEASE.md"), "utf8"),
      /starter-template@0\.3\.0` release is already published/u,
    );
    assert.match(
      readFileSync(join(root, "docs", "architecture", "frontend-only-profile.md"), "utf8"),
      /create-vireo@0\.3\.0/u,
    );
    assert.match(
      readFileSync(join(root, "docs", "architecture", "generated-code-ownership.md"), "utf8"),
      /current supported 0\.2\.0-to-0\.3\.0 project upgrade/u,
    );
    assert.match(
      readFileSync(join(root, "docs", "roadmap", "phase-4", "backlog.md"), "utf8"),
      /create-vireo@0\.3\.0.*0\.2\.0→0\.3\.0/su,
    );
    assert.match(
      readFileSync(join(root, "docs", "roadmap", "phase-4", "production-readiness-criteria.md"), "utf8"),
      /current 0\.2\.0→0\.3\.0 edge/u,
    );
    assert.match(readFileSync(join(root, "docs", "DOCUMENTATION_PORTAL.md"), "utf8"), new RegExp(releaseId, "u"));
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "src", "index.ts"), "utf8"),
      /CREATE_VIREO_PACKAGE_VERSION = "0\.3\.0"/u,
    );
    assert.match(
      readFileSync(join(root, "packages", "create-vireo", "src", "index.ts"), "utf8"),
      /TEMPLATE_STARTER_JVM_BASELINE = "0\.4\.0"/u,
    );
    const upgradePolicy = readJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json"));
    assert.equal(
      upgradePolicy.releaseGraph.releases.find(
        release =>
          release.release === (upgradePolicy.releaseGraph.candidateRelease ?? upgradePolicy.releaseGraph.publicRelease),
      ).rootVireoScript,
      "npx --yes --package=create-vireo@0.3.0 vireo",
    );
    assert.equal(
      upgradePolicy.releaseGraph.releases.find(
        release =>
          release.release === (upgradePolicy.releaseGraph.candidateRelease ?? upgradePolicy.releaseGraph.publicRelease),
      ).starterJvmVersion,
      "0.4.0",
    );
    assert.equal(upgradePolicy.releaseGraph.publicRelease, "0.3.0");
    assert.equal(upgradePolicy.releaseGraph.previousRelease, "0.2.0");
    assert.equal(upgradePolicy.releaseGraph.candidateRelease, undefined);
    assert.equal(upgradePolicy.releaseGraph.releases.find(release => release.release === "0.2.0").status, "historical");
    assert.equal(upgradePolicy.releaseGraph.releases.find(release => release.release === "0.3.0").status, "current");
    const finalizedUpgrade = readJson(join(root, "contracts", "project-upgrade-policy.json"));
    assert.equal(finalizedUpgrade.publicationState, "final");
    assert.equal(finalizedUpgrade.publicRelease, "0.3.0");
    assert.equal(finalizedUpgrade.previousRelease, "0.2.0");
    assert.equal(finalizedUpgrade.candidateRelease, undefined);
    assert.equal(finalizedUpgrade.finalization, undefined);
    assert.equal(finalizedUpgrade.releaseCoordinates["0.2.0"].status, "historical");
    assert.equal(finalizedUpgrade.releaseCoordinates["0.3.0"].status, "current");
    assert.equal(
      readJson(join(root, "contracts", "project-upgrade-policy.json")).releaseCoordinates["0.3.0"].starterJvmVersion,
      "0.4.0",
    );
    const packageLock = readJson(join(root, "package-lock.json"));
    assert.equal(packageLock.packages["packages/create-vireo"].version, "0.3.0");
    assert.equal(packageLock.packages["packages/sqlite"].version, "0.2.2");
    for (const path of [
      "site/content/offline.md",
      "site/content/design-system-overview.md",
      "site/content/manifest.json",
      "site/verify.mjs",
      "site/build.test.mjs",
    ]) {
      const source = readFileSync(join(root, path), "utf8");
      assert.ok(source.includes("b".repeat(40)), path);
      assert.ok(!source.includes("a".repeat(40)), path);
    }
    assert.match(readFileSync(join(root, "site", "content", "offline.md"), "utf8"), /pinned 0\.3\.0 Template/u);
    assert.match(
      readFileSync(join(root, "site", "content", "design-system-overview.md"), "utf8"),
      /current 0\.3\.0 Template/u,
    );
    const historicalSiteSource = readFileSync(join(root, "site", "content", "snapshots", "historical.md"), "utf8");
    assert.ok(historicalSiteSource.includes("a".repeat(40)));
    assert.match(historicalSiteSource, /pinned 0\.2\.0 Template/u);
    assert.ok(readFileSync(join(root, "site/dist/current.md"), "utf8").includes("a".repeat(40)));

    const snapshotPath = join(root, "site", "content", "snapshots", "0.2.json");
    const snapshot = readJson(snapshotPath);
    assert.equal(snapshot.documentationVersion, "0.2");
    assert.equal(snapshot.payload.releaseId, releaseId);
    assert.match(snapshot.payload.currentOfflineGuide, /b{40}/u);

    const impactRecords = generatedDocumentationSiteImpactRecords(root);
    assert.equal(impactRecords.length, 1);
    assert.deepEqual(impactRecords, ["documentation-site-current-release.json"]);
    const impactRecord = readJson(join(root, ".release-impact", impactRecords[0]));
    assert.deepEqual(
      { ...impactRecord, summary: undefined },
      {
        schemaVersion: 1,
        artifact: "application:documentation-site",
        decision: "release",
        bump: "deploy",
        summary: undefined,
      },
    );
    assert.match(
      impactRecord.summary,
      /^Deploy the synchronized Vireo documentation snapshot for npm-0\.3\.0_jvm-0\.4\.0 \([a-f0-9]{64}\)\.$/u,
    );
    const humanRecordPath = join(root, ".release-impact", "documentation-site-human-release.json");
    const humanRecord = readFileSync(humanRecordPath, "utf8");

    const firstSnapshot = readFileSync(snapshotPath, "utf8");
    const firstImpact = readFileSync(join(root, ".release-impact", impactRecords[0]), "utf8");
    await synchronizeFixtureDocumentationRelease(root);
    assert.equal(readFileSync(snapshotPath, "utf8"), firstSnapshot, "reruns keep the current snapshot byte-stable");
    assert.equal(
      readFileSync(join(root, ".release-impact", impactRecords[0]), "utf8"),
      firstImpact,
      "reruns keep the generated deploy decision byte-stable",
    );
    assert.deepEqual(
      generatedDocumentationSiteImpactRecords(root),
      impactRecords,
      "reruns do not add duplicate deploy records",
    );
    assert.equal(
      readFileSync(humanRecordPath, "utf8"),
      humanRecord,
      "generated intent preserves unrelated human records",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails closed when an allowlisted current site reference changes form", async () => {
  const root = makeFixture();
  try {
    const offlinePath = join(root, "site", "content", "offline.md");
    writeFileSync(
      offlinePath,
      readFileSync(offlinePath, "utf8").replace("pinned 0.2.0 Template", "pinned Template 0.2.0"),
    );
    await assert.rejects(
      synchronizeFixtureDocumentationRelease(root),
      /site\/content\/offline\.md current Template version must contain exactly 1 current-state reference/u,
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
      synchronizeFixtureDocumentationRelease(root),
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
      synchronizeFixtureDocumentationRelease(root),
      /Root package-lock\.json is missing public workspace entry packages\/create-vireo/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("documentation-site deploy intent reuses one canonical record for every public package coordinate", async () => {
  const root = makeFixture();
  try {
    await synchronizeFixtureDocumentationRelease(root);
    const [recordName] = generatedDocumentationSiteImpactRecords(root);
    const recordPath = join(root, ".release-impact", recordName);
    const firstRecord = readFileSync(recordPath, "utf8");

    const sqliteManifestPath = join(root, "packages", "sqlite", "package.json");
    const sqliteManifest = readJson(sqliteManifestPath);
    sqliteManifest.version = "0.2.3";
    writeJson(sqliteManifestPath, sqliteManifest);
    await synchronizeFixtureDocumentationRelease(root);

    assert.deepEqual(generatedDocumentationSiteImpactRecords(root), ["documentation-site-current-release.json"]);
    assert.notEqual(readFileSync(recordPath, "utf8"), firstRecord, "the full-coordinate digest updates the record");
    const releaseImpact = validateReleaseImpact({
      policy: readJson(new URL("../contracts/release-impact-policy.json", import.meta.url)),
      ecosystemContract: readJson(new URL("../contracts/ecosystem-release-contract.json", import.meta.url)),
      changes: [
        { path: "site/content/snapshots/0.2.json", status: "M" },
        {
          path: ".release-impact/documentation-site-current-release.json",
          status: "M",
          headContent: readFileSync(recordPath, "utf8"),
        },
      ],
    });
    assert.deepEqual(
      releaseImpact.problems,
      [],
      "the canonical generated record satisfies the release-impact policy without duplicate decisions",
    );
    assert.equal(releaseImpact.decisions.length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects unsafe documentation snapshot versions before writing release outputs", async () => {
  const root = makeFixture();
  try {
    const documentationPath = join(root, "contracts", "documentation-release-policy.json");
    const documentation = readJson(documentationPath);
    documentation.releases[0].documentationVersion = "../escaped";
    writeJson(documentationPath, documentation);
    const readme = readFileSync(join(root, "README.md"), "utf8");

    await assert.rejects(
      synchronizeFixtureDocumentationRelease(root),
      /Current documentation release must declare a friendly 0\.x documentationVersion/u,
    );

    assert.equal(existsSync(join(root, "site", "content", "escaped.json")), false);
    assert.equal(existsSync(join(root, "site", "content", "snapshots", "0.2.json")), false);
    assert.deepEqual(generatedDocumentationSiteImpactRecords(root), []);
    assert.equal(readFileSync(join(root, "README.md"), "utf8"), readme);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects unsafe documentation release IDs before writing release outputs", async () => {
  const root = makeFixture();
  try {
    const documentationPath = join(root, "contracts", "documentation-release-policy.json");
    const documentation = readJson(documentationPath);
    const unsafeId = "npm-0.3.0_jvm-0.4.0/../../escaped";
    documentation.currentRelease = unsafeId;
    documentation.releases[0].id = unsafeId;
    writeJson(documentationPath, documentation);
    const readme = readFileSync(join(root, "README.md"), "utf8");

    await assert.rejects(
      synchronizeFixtureDocumentationRelease(root),
      /Current documentation release must declare a safe npm-<version>_jvm-<version> ID/u,
    );

    assert.equal(existsSync(join(root, ".release-impact", "escaped.json")), false);
    assert.equal(existsSync(join(root, "site", "content", "snapshots", "0.2.json")), false);
    assert.deepEqual(generatedDocumentationSiteImpactRecords(root), []);
    assert.equal(readFileSync(join(root, "README.md"), "utf8"), readme);
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
  mkdirSync(join(root, "docs", "architecture"));
  mkdirSync(join(root, "docs", "roadmap", "phase-4"), { recursive: true });
  mkdirSync(join(root, "site", "content"), { recursive: true });
  mkdirSync(join(root, "site", "content", "snapshots"), { recursive: true });
  mkdirSync(join(root, "site", "dist"), { recursive: true });
  mkdirSync(join(root, ".release-impact"));
  writeJson(join(root, ".release-impact", "documentation-site-human-release.json"), {
    schemaVersion: 1,
    artifact: "application:documentation-site",
    decision: "release",
    bump: "deploy",
    summary: "Reviewed human deployment record that must remain untouched.",
  });
  writeJson(join(root, "packages", "create-vireo", "package.json"), {
    name: "create-vireo",
    version: "0.3.0",
  });
  writeFileSync(
    join(root, "packages", "create-vireo", "src", "index.ts"),
    `export const TEMPLATE_COMMIT = "${"a".repeat(40)}";\nconst CREATE_VIREO_PACKAGE_VERSION = "0.2.0";\nconst TEMPLATE_STARTER_JVM_BASELINE = "0.3.0";\n`,
  );
  writeJson(join(root, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json"), {
    schemaVersion: 2,
    releaseGraph: {
      publicRelease: "0.2.0",
      candidateRelease: "0.3.0",
      previousRelease: "0.2.0",
      releases: [
        {
          release: "0.1.0",
          status: "historical",
          templateCommit: "a".repeat(40),
          rootVireoScript: "npx --yes --package=create-vireo@0.1.0 vireo",
          starterJvmVersion: "0.3.0",
        },
        {
          release: "0.2.0",
          status: "current",
          templateCommit: "a".repeat(40),
          rootVireoScript: "npx --yes --package=create-vireo@0.2.0 vireo",
          starterJvmVersion: "0.3.0",
        },
        {
          release: "0.3.0",
          status: "candidate",
          templateCommit: "b".repeat(40),
          rootVireoScript: "npx --yes --package=create-vireo@0.2.0 vireo",
          starterJvmVersion: "0.3.0",
        },
      ],
      edges: [
        { from: "0.1.0", to: "0.2.0", applicationOwnedActions: [] },
        { from: "0.2.0", to: "0.3.0", applicationOwnedActions: [] },
      ],
    },
  });
  writeJson(join(root, "contracts", "project-upgrade-policy.json"), {
    publicRelease: "0.2.0",
    candidateRelease: "0.3.0",
    previousRelease: "0.2.0",
    publicationState: "candidate",
    finalization: { targetTemplateCommit: "b".repeat(40) },
    releaseCoordinates: {
      "0.2.0": {
        createVireo: "0.2.0",
        templateVersion: "0.2.0",
        templateCommit: "a".repeat(40),
        starterJvmVersion: "0.3.0",
        status: "current",
      },
      "0.3.0": {
        createVireo: "0.3.0",
        templateVersion: "0.3.0",
        templateCommit: "b".repeat(40),
        starterJvmVersion: "0.3.0",
        status: "candidate",
      },
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
      template: { commit: "a".repeat(40), version: "0.2.0" },
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
        documentationVersion: "0.2",
        documentationLabel: "Vireo 0.2",
        status: "current",
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
    `| Package | Version |\n| --- | --- |\n| \`create-vireo\` | 0.2.0 |\n| \`@vireocodedev/sqlite\` | 0.2.1 |\n\nThis is current in \`create-vireo@0.2.0\`. Its version-aware\nproject upgrade currently supports the explicit adjacent 0.1.0→0.2.0 release\npair; other historical edges remain retained. Template evidence: ${"a".repeat(40)}.\n`,
  );
  writeFileSync(
    join(root, "docs", "COMPATIBILITY.md"),
    "| Artifact | Version |\n| --- | --- |\n| `create-vireo` | 0.2.0 |\n| `@vireocodedev/sqlite` | 0.2.1 |\n| `com.vireocode:vireo-*` | 0.3.0 |\n\nThe current supported project-upgrade\nedge is 0.1.0→0.2.0; other historical evidence remains retained.\n\nThe immutable `starter-template@0.2.0` source baseline retains\n`starterVersion=0.3.0`; `create-vireo@0.2.0` normalizes generated and upgraded\nfull-stack consumers to the coordinated `0.4.0` JVM release.\n",
  );
  writeFileSync(
    join(root, "packages", "create-vireo", "README.md"),
    `The current supported adjacent release pair is a project created by \`create-vireo\`\n0.1.0 upgraded to 0.2.0.\n\n\`\`\`bash\nvireo upgrade --to 0.2.0 --dry-run\nvireo upgrade --to 0.2.0 --apply --accept-application-owned\n\`\`\`\n\nReview the target Template commit ${"a".repeat(40)}. For the current 0.1.0→0.2.0\nedge, Vireo adds the six managed application-skill files under\n\`.agents/skills/\`; it never overwrites the application-owned root\n\`AGENTS.md\`, source, deployment descriptors, or \`.github\`\nreview policy.\n\nThe immutable \`starter-template@0.2.0\` source commit intentionally retains its\n\`starterVersion=0.3.0\` baseline. Full-stack creation and the 0.1.0→0.2.0 upgrade\nnormalize that managed declaration to the current Vireo JVM release, \`0.4.0\`, before\nrecording managed hashes.\n`,
  );
  writeFileSync(
    join(root, "docs", "NPM_RELEASE.md"),
    "Publish the Template first (the `starter-template@0.2.0` release is already published), then continue.\n",
  );
  writeFileSync(
    join(root, "docs", "architecture", "frontend-only-profile.md"),
    "The current profile is `create-vireo@0.2.0`.\nThe public `create-vireo@0.2.0` CLI unit suite covers the profile.\n",
  );
  writeFileSync(
    join(root, "docs", "architecture", "generated-code-ownership.md"),
    "The current supported 0.1.0-to-0.2.0 project upgrade admits declared manifests without\nregeneration.\n",
  );
  writeFileSync(
    join(root, "docs", "roadmap", "phase-4", "backlog.md"),
    "The current public `create-vireo@0.2.0` line and its supported 0.1.0→0.2.0\nadjacent upgrade fixture are complete.\n",
  );
  writeFileSync(
    join(root, "docs", "roadmap", "phase-4", "production-readiness-criteria.md"),
    "Public `create-vireo` 0.2.0 declares the current 0.1.0→0.2.0 edge with dry run, explicit apply, refusal, ownership and rollback guidance; frontend/full-stack unit fixtures exercise the six managed application-skill additions for both profiles.\n",
  );
  writeFileSync(join(root, "docs", "DOCUMENTATION_PORTAL.md"), "Current snapshot: `npm-0.2.0_jvm-0.3.0`.\n");
  writeFileSync(
    join(root, "site", "content", "offline.md"),
    `The pinned 0.2.0 Template offline guide uses ${"a".repeat(40)} and ${"a".repeat(40)}.\n`,
  );
  writeFileSync(
    join(root, "site", "content", "design-system-overview.md"),
    `The current 0.2.0 Template reference composition uses ${Array.from({ length: 7 }, () => "a".repeat(40)).join(" ")}.\n`,
  );
  writeFileSync(
    join(root, "site/content/manifest.json"),
    JSON.stringify({ currentTemplateReferences: Array.from({ length: 9 }, () => "a".repeat(40)) }),
  );
  writeFileSync(
    join(root, "site/verify.mjs"),
    `export const currentTemplate = ["${"a".repeat(40)}", "${"a".repeat(40)}"];\n`,
  );
  writeFileSync(
    join(root, "site/build.test.mjs"),
    `export const currentTemplate = ["${"a".repeat(40)}", "${"a".repeat(40)}"];\n`,
  );
  writeFileSync(
    join(root, "site", "content", "snapshots", "historical.md"),
    `The pinned 0.2.0 Template archive uses ${"a".repeat(40)}.\n`,
  );
  writeFileSync(join(root, "site/dist/current.md"), `Archived Template: ${"a".repeat(40)}\n`);
  return root;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function synchronizeFixtureDocumentationRelease(root) {
  return synchronizeDocumentationRelease(root, {
    createSnapshotArchive: ({ root: snapshotRoot }) => {
      const documentation = readJson(join(snapshotRoot, "contracts", "documentation-release-policy.json"));
      const release = documentation.releases.find(candidate => candidate.id === documentation.currentRelease);
      return {
        documentationVersion: release.documentationVersion,
        payload: {
          releaseId: release.id,
          currentOfflineGuide: readFileSync(join(snapshotRoot, "site", "content", "offline.md"), "utf8"),
        },
      };
    },
    serializeSnapshot: archive => archive,
  });
}

function generatedDocumentationSiteImpactRecords(root) {
  return readdirSync(join(root, ".release-impact"))
    .filter(name => name === "documentation-site-current-release.json")
    .sort();
}
