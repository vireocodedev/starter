import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertCandidateLockProvenance,
  assertCandidateManifest,
  assertInstalledCandidateMetadata,
  candidateTarballFilename,
  projectCandidateDependencies,
  runCandidateFixtureLifecycle,
} from "./lib/local-vireo-candidate-fixture.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidate = {
  manifest: { name: "@vireocodedev/ui", version: "0.3.0" },
  tarball: "/candidates/vireocodedev-ui-0.3.0.tgz",
  integrity: "sha512-exact-packed-bytes",
};
const candidates = new Map([[candidate.manifest.name, candidate]]);

function lock(packages) {
  return { lockfileVersion: 3, packages };
}

function packedNode(overrides = {}) {
  return {
    resolved: "file:../candidates/vireocodedev-ui-0.3.0.tgz",
    integrity: candidate.integrity,
    ...overrides,
  };
}

test("projects Vireo dependencies to exact packed candidates without changing other dependencies", () => {
  assert.deepEqual(projectCandidateDependencies({ "@vireocodedev/ui": "^0.3.0", react: "^19.2.8" }, candidates), {
    "@vireocodedev/ui": `file:${candidate.tarball}`,
    react: "^19.2.8",
  });
  assert.throws(
    () => projectCandidateDependencies({ "@vireocodedev/history": "^0.2.2" }, candidates),
    /No packed local candidate/u,
  );
});

test("derives npm tarball names from package identity", () => {
  assert.equal(candidateTarballFilename("@vireocodedev/ui", "0.3.0"), "vireocodedev-ui-0.3.0.tgz");
  assert.equal(candidateTarballFilename("create-vireo", "0.5.0"), "create-vireo-0.5.0.tgz");
});

test("requires packed candidate identity and source directory metadata to match", () => {
  const source = {
    repositoryRoot: "/repo",
    directory: "/repo/packages/ui",
    manifest: candidate.manifest,
    packedManifest: { ...candidate.manifest, repository: { directory: "packages/ui" } },
  };
  assert.doesNotThrow(() => assertCandidateManifest(source));
  assert.throws(
    () => assertCandidateManifest({ ...source, packedManifest: { ...source.packedManifest, version: "0.3.1" } }),
    /identity differs/u,
  );
  assert.throws(
    () =>
      assertCandidateManifest({
        ...source,
        packedManifest: { ...source.packedManifest, repository: { directory: "packages/history" } },
      }),
    /unexpected repository directory/u,
  );
});

test("requires exact file-backed sha512 provenance for every Vireo lock node", () => {
  assert.doesNotThrow(() =>
    assertCandidateLockProvenance(
      lock({ "node_modules/host/node_modules/@vireocodedev/ui": packedNode() }),
      candidates,
      "/fixture",
    ),
  );
  for (const [name, packages, message] of [
    [
      "registry",
      { "node_modules/@vireocodedev/ui": packedNode({ resolved: "https://registry.npmjs.org/ui.tgz" }) },
      /file reference/u,
    ],
    ["missing", {}, /missing packed candidate/u],
    [
      "duplicate",
      {
        "node_modules/@vireocodedev/ui": packedNode(),
        "node_modules/host/node_modules/@vireocodedev/ui": packedNode(),
      },
      /duplicate packed candidates/u,
    ],
    [
      "resolution mismatch",
      { "node_modules/@vireocodedev/ui": packedNode({ resolved: "file:elsewhere.tgz" }) },
      /exact packed candidate/u,
    ],
    [
      "integrity mismatch",
      { "node_modules/@vireocodedev/ui": packedNode({ integrity: "sha512-other" }) },
      /integrity/u,
    ],
  ]) {
    assert.throws(() => assertCandidateLockProvenance(lock(packages), candidates, "/fixture"), message, name);
  }
});

test("rejects linked, outside, and mismatched installed candidate directories", () => {
  const input = {
    projectDirectory: "/fixture",
    directory: "/fixture/node_modules/@vireocodedev/ui",
    stats: { isSymbolicLink: () => false },
    resolved: "/fixture/node_modules/@vireocodedev/ui",
    manifest: candidate.manifest,
    candidate,
  };
  assert.doesNotThrow(() => assertInstalledCandidateMetadata(input));
  assert.throws(() => assertInstalledCandidateMetadata({ ...input, stats: { isSymbolicLink: () => true } }), /linked/u);
  assert.throws(() => assertInstalledCandidateMetadata({ ...input, resolved: "/outside/ui" }), /outside/u);
  assert.throws(
    () => assertInstalledCandidateMetadata({ ...input, manifest: { ...candidate.manifest, version: "9.0.0" } }),
    /identity/u,
  );
});

test("restores source declarations and clears candidates before the fixture callback", async () => {
  const events = [];
  let manifest = "registry";
  let lockfile = "registry-lock";
  let candidatesPresent = true;
  await runCandidateFixtureLifecycle({
    install: async () => {
      events.push("install");
      manifest = "file-candidate";
      lockfile = "candidate-lock";
    },
    assertInstalled: async () => events.push("assert"),
    restore: async () => {
      events.push("restore");
      manifest = "registry";
      lockfile = "registry-lock";
    },
    cleanup: async () => {
      events.push("cleanup");
      candidatesPresent = false;
    },
    callback: async () => {
      events.push("callback");
      assert.equal(manifest, "registry");
      assert.equal(lockfile, "registry-lock");
      assert.equal(candidatesPresent, false);
    },
  });
  assert.deepEqual(events, ["install", "assert", "restore", "cleanup", "callback"]);
});

test("restores and cleans independently after install or assertion failures, and preserves cleanup failures", async () => {
  for (const failingStep of ["install", "assert"]) {
    const events = [];
    await assert.rejects(
      runCandidateFixtureLifecycle({
        install: async () => {
          events.push("install");
          if (failingStep === "install") throw new Error("install failed");
        },
        assertInstalled: async () => {
          events.push("assert");
          if (failingStep === "assert") throw new Error("assert failed");
        },
        restore: async () => events.push("restore"),
        cleanup: async () => events.push("cleanup"),
        callback: async () => events.push("callback"),
      }),
      new RegExp(`${failingStep} failed`, "u"),
    );
    assert.deepEqual(
      events,
      failingStep === "install" ? ["install", "restore", "cleanup"] : ["install", "assert", "restore", "cleanup"],
    );
  }
  await assert.rejects(
    runCandidateFixtureLifecycle({
      install: async () => {
        throw new Error("primary");
      },
      assertInstalled: async () => {},
      restore: async () => {
        throw new Error("restore");
      },
      cleanup: async () => {
        throw new Error("cleanup");
      },
      callback: async () => {},
    }),
    error => error instanceof AggregateError && error.errors.length === 3,
  );
});

test("does not rerun cleanup after callback failure because cleanup completed before callback", async () => {
  const events = [];
  await assert.rejects(
    runCandidateFixtureLifecycle({
      install: async () => events.push("install"),
      assertInstalled: async () => events.push("assert"),
      restore: async () => events.push("restore"),
      cleanup: async () => events.push("cleanup"),
      callback: async () => {
        events.push("callback");
        throw new Error("callback failed");
      },
    }),
    /callback failed/u,
  );
  assert.deepEqual(events, ["install", "assert", "restore", "cleanup", "callback"]);
});

test("keeps fixture commands self-preparing on Corepack and guards their template pin", async () => {
  const [
    workflow,
    packageJson,
    testScript,
    verifyScript,
    entityFixture,
    frontendFixture,
    upgradeFixture,
    legacySchema,
  ] = await Promise.all([
    readFile(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8"),
    readFile(join(repositoryRoot, "package.json"), "utf8"),
    readFile(join(repositoryRoot, "scripts/test.sh"), "utf8"),
    readFile(join(repositoryRoot, "scripts/verify.sh"), "utf8"),
    readFile(join(repositoryRoot, "scripts/generated-entity-fixture.mjs"), "utf8"),
    readFile(join(repositoryRoot, "scripts/generated-frontend-fixture.mjs"), "utf8"),
    readFile(join(repositoryRoot, "scripts/project-upgrade-fixture.mjs"), "utf8"),
    readFile(join(repositoryRoot, "packages/create-vireo/fixtures/purchase-order.0.2.0.entity.json"), "utf8"),
  ]);
  const fixtureCommands = [
    ["generate:entity:fixture", "generated-entity-fixture.mjs", entityFixture, true],
    ["generate:frontend:fixture", "generated-frontend-fixture.mjs", frontendFixture, true],
    ["upgrade:project:fixture", "project-upgrade-fixture.mjs", upgradeFixture, false],
  ];
  const scripts = JSON.parse(packageJson).scripts;
  for (const [command, script, fixture, requiresExactProjection] of fixtureCommands) {
    assert.equal(scripts[command], `corepack npm run build && node scripts/${script}`);
    assert.match(workflow, new RegExp(`- run: corepack npm run ${command}`, "u"));
    assert.doesNotMatch(workflow, new RegExp(`corepack npm run build\\n\\s*- run: corepack npm run ${command}`, "u"));
    assert.match(fixture, /TEMPLATE_COMMIT/u);
    assert.match(fixture, /assertGeneratedFixtureTemplatePinFromRepository/u);
    assert.ok(
      fixture.indexOf("await assertGeneratedFixtureTemplatePinFromRepository") < fixture.indexOf("await createVireo"),
      `${command} must validate TEMPLATE_COMMIT before scaffolding.`,
    );
    if (requiresExactProjection) {
      assert.match(fixture, /assertExactGeneratedProject/u);
      assert.ok(
        fixture.indexOf("await assertExactGeneratedProject") > fixture.indexOf("await createVireo") &&
          fixture.indexOf("await assertExactGeneratedProject") < fixture.indexOf("await generateEntity"),
        `${command} must validate its exact generated projection before capability generation.`,
      );
      assert.ok(
        fixture.indexOf('"identity:check:release"') > fixture.indexOf("await assertExactGeneratedProject") &&
          fixture.indexOf('"identity:check:release"') < fixture.indexOf("await generateEntity"),
        `${command} must prove resolved release identity before capability generation.`,
      );
    }
  }
  assert.ok(
    upgradeFixture.indexOf("await assertGeneratedFixtureTemplatePinFromRepository") <
      upgradeFixture.indexOf("await fetch"),
    "Project upgrade must validate TEMPLATE_COMMIT before downloading its source scaffold.",
  );
  assert.doesNotMatch(workflow, /npm run build --workspace=create-vireo/u);
  assert.doesNotMatch(testScript, /(?<!corepack )npm run/u);
  assert.match(verifyScript, /corepack npm --version/u);
  assert.match(upgradeFixture, /generatorVersion !== sourceRelease/u);
  assert.match(upgradeFixture, /checkGeneratedEntities\(projectRoot\)/u);
  assert.doesNotMatch(legacySchema, /"example"/u);
});
