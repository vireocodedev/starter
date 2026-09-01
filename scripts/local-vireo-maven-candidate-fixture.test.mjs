import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertJvmCandidateVersion,
  groovySingleQuotedLiteral,
  mavenCandidateAuditCommand,
  mavenCandidateConsumerCommand,
  mavenCandidateInitScript,
  mavenCandidatePublicationCommand,
  readJvmCandidateVersion,
  removeMavenCandidateRoot,
  runMavenCandidateLifecycle,
} from "./lib/local-vireo-maven-candidate-fixture.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const exactMavenVersionPattern = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u;

async function readCurrentEcosystemMavenVersion() {
  const ecosystemContract = JSON.parse(
    await readFile(join(repositoryRoot, "contracts/ecosystem-release-contract.json"), "utf8"),
  );
  const version = ecosystemContract.current?.maven?.version;
  if (typeof version !== "string" || !exactMavenVersionPattern.test(version))
    throw new Error("Ecosystem release contract must declare an exact current Maven version.");
  return version;
}

test("JVM candidate version is read and gated exactly from gradle.properties", () => {
  assert.equal(readJvmCandidateVersion("group=com.vireocode\nversion=0.3.0\n"), "0.3.0");
  assert.equal(assertJvmCandidateVersion({ gradleProperties: "version=0.3.0\n", expectedVersion: "0.3.0" }), "0.3.0");
  assert.throws(
    () => assertJvmCandidateVersion({ gradleProperties: "version=0.3.1\n", expectedVersion: "0.3.0" }),
    /does not match fixture target/u,
  );
  assert.throws(() => readJvmCandidateVersion("version=0.3.0\nversion=0.3.1\n"), /exactly one/u);
});

test("the fixture target equals the current JVM gradle.properties version", async () => {
  const expectedVersion = await readCurrentEcosystemMavenVersion();
  const gradleProperties = await readFile(join(repositoryRoot, "jvm", "gradle.properties"), "utf8");
  assert.equal(assertJvmCandidateVersion({ gradleProperties, expectedVersion }), expectedVersion);
});

test("JVM candidate commands use an audited file repository and isolated Gradle consumer flags", () => {
  const repository = "/fixture/candidates/repository";
  const initScript = mavenCandidateInitScript(repository);
  assert.match(initScript, /exclusiveContent/u);
  assert.match(initScript, /includeGroup\("com\.vireocode"\)/u);
  assert.match(initScript, /mavenCentral\(\)/u);
  assert.match(initScript, /file:\/\//u);
  assert.doesNotMatch(initScript, /mavenLocal/u);

  assert.equal(
    groovySingleQuotedLiteral("file:///fixture/candidate$repo/quote'and\\slash"),
    "'file:///fixture/candidate$repo/quote\\'and\\\\slash'",
  );
  const specialPathScript = mavenCandidateInitScript("/fixture/candidate$repo/quote'and\\slash");
  assert.match(specialPathScript, /url = uri\('file:.*candidate\$repo/u);
  assert.doesNotMatch(specialPathScript, /url = uri\("|[$][{]/u);

  const publication = mavenCandidatePublicationCommand({ repositoryRoot: "/repo", repository });
  assert.equal(publication.command, "/repo/jvm/gradlew");
  assert.deepEqual(publication.args, [
    "-p",
    "/repo/jvm",
    "-PvireoTestRepository=/fixture/candidates/repository",
    "publishMavenPublicationToVerificationRepository",
    "--no-daemon",
    "--no-build-cache",
    "--no-configuration-cache",
    "--console=plain",
  ]);
  assert.deepEqual(mavenCandidateAuditCommand({ repositoryRoot: "/repo", repository, version: "0.3.0" }), {
    command: "/repo/jvm/scripts/audit-publication-artifacts.sh",
    args: [repository, "0.3.0", "verification"],
  });
  assert.deepEqual(mavenCandidateConsumerCommand({ initScript: "/fixture/candidates/init.gradle" }), {
    command: "./gradlew",
    args: [
      "test",
      "--tests",
      "*PurchaseOrderApiIntegrationTest",
      "--init-script",
      "/fixture/candidates/init.gradle",
      "--refresh-dependencies",
      "--no-daemon",
      "--no-build-cache",
      "--no-configuration-cache",
      "--console=plain",
    ],
  });
});

test("Maven candidate cleanup retries transient filesystem removal races", async () => {
  const calls = [];
  await removeMavenCandidateRoot("/fixture/candidates", async (...args) => calls.push(args));
  assert.deepEqual(calls, [["/fixture/candidates", { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }]]);
});

test("JVM candidate lifecycle cleans up after success and aggregates primary and cleanup failures", async () => {
  const events = [];
  await runMavenCandidateLifecycle({
    publish: async () => events.push("publish"),
    audit: async () => events.push("audit"),
    callback: async () => events.push("consume"),
    cleanup: async () => events.push("cleanup"),
  });
  assert.deepEqual(events, ["publish", "audit", "consume", "cleanup"]);

  await assert.rejects(
    runMavenCandidateLifecycle({
      publish: async () => {
        throw new Error("publication failed");
      },
      audit: async () => assert.fail("audit must not run after publication failure"),
      callback: async () => assert.fail("callback must not run after publication failure"),
      cleanup: () => {
        throw new Error("cleanup failed");
      },
    }),
    error =>
      error instanceof AggregateError &&
      error.errors.some(candidate => candidate.message === "publication failed") &&
      error.errors.some(candidate => candidate.message === "cleanup failed"),
  );

  await assert.rejects(
    runMavenCandidateLifecycle({
      publish: async () => {
        throw new Error("publication failed asynchronously");
      },
      audit: async () => assert.fail("audit must not run after publication failure"),
      callback: async () => assert.fail("callback must not run after publication failure"),
      cleanup: async () => {
        throw new Error("cleanup failed asynchronously");
      },
    }),
    error =>
      error instanceof AggregateError &&
      error.errors.some(candidate => candidate.message === "publication failed asynchronously") &&
      error.errors.some(candidate => candidate.message === "cleanup failed asynchronously"),
  );
});

test("generated and historical backend fixtures isolate Maven verification and retain the PurchaseOrder integration", async () => {
  const fixtures = await Promise.all(
    ["project-upgrade-fixture.mjs", "generated-entity-fixture.mjs"].map(async name => ({
      name,
      source: await readFile(join(repositoryRoot, "scripts", name), "utf8"),
    })),
  );
  const helper = await readFile(
    join(repositoryRoot, "scripts", "lib", "local-vireo-maven-candidate-fixture.mjs"),
    "utf8",
  );
  const sources = [...fixtures.map(fixture => fixture.source), helper].join("\n");
  const generatedEntityFixture = fixtures.find(fixture => fixture.name === "generated-entity-fixture.mjs").source;
  const projectUpgradeFixture = fixtures.find(fixture => fixture.name === "project-upgrade-fixture.mjs").source;
  assert.match(generatedEntityFixture, /withLocalVireoMavenCandidates\(/u);
  assert.match(generatedEntityFixture, /mavenCandidateConsumerCommand\(\{/u);
  assert.match(generatedEntityFixture, /expectedVersion: targetMavenVersion/u);
  assert.match(generatedEntityFixture, /contracts\/ecosystem-release-contract\.json/u);
  assert.match(generatedEntityFixture, /current\?\.maven\?\.version/u);
  assert.match(projectUpgradeFixture, /packages\/create-vireo\/schema\/vireo-upgrade-policy\.json/u);
  assert.match(projectUpgradeFixture, /targetStarterJvmVersion = targetReleaseNode\?\.starterJvmVersion/u);
  assert.match(projectUpgradeFixture, /"\.\/gradlew"/u);
  assert.match(projectUpgradeFixture, /"-PuseLocalStarter=false"/u);
  assert.match(projectUpgradeFixture, /GRADLE_USER_HOME: historicalGradleUserHome/u);
  assert.doesNotMatch(
    projectUpgradeFixture,
    /withLocalVireoMavenCandidates|mavenCandidateConsumerCommand|--init-script/u,
  );
  assert.match(helper, /PurchaseOrderApiIntegrationTest/u);
  assert.doesNotMatch(sources, /publishToMavenLocal|mavenLocal|~\/\.m2/u);
  assert.doesNotMatch(sources, /writeFile\([^\n]*gradle\.properties/u);
});
