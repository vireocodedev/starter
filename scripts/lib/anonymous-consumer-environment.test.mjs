import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  anonymousEnvironment,
  assertAnonymousInstallation,
  assertAnonymousVireoLock,
  assertExactPublicNpmConsumer,
  assertNoMavenLocal,
  publicReleaseIdentity,
} from "./anonymous-consumer-environment.mjs";

test("anonymous environment removes credentials and isolates package-manager state", () => {
  const root = mkdtempSync(join(tmpdir(), "anonymous-environment-"));
  const environment = anonymousEnvironment({
    root,
    registry: "https://registry.npmjs.org",
    environment: { PATH: process.env.PATH, NPM_TOKEN: "must-not-survive", API_KEY: "must-not-survive", SAFE: "yes" },
  });
  assert.equal(environment.NPM_TOKEN, undefined);
  assert.equal(environment.API_KEY, undefined);
  assert.equal(environment.SAFE, undefined);
  assert.match(environment.HOME, /home$/u);
  assert.match(environment.COREPACK_HOME, /corepack$/u);
  assert.match(environment.MAVEN_OPTS, /maven-repository/u);
  assert.match(environment.npm_config_cache, /npm-cache$/u);
  assert.match(readFileSync(environment.npm_config_userconfig, "utf8"), /always-auth=false/u);
});

test("public release identity requires exact public coordinates", () => {
  assert.throws(() =>
    publicReleaseIdentity({
      current: { id: "bad", npm: [{ name: "create-vireo", version: "latest" }], maven: { version: "0.1" } },
    }),
  );
  const identity = publicReleaseIdentity({
    current: {
      id: "npm-1.2.3_jvm-4.5.6",
      npm: [{ name: "create-vireo", version: "1.2.3" }],
      maven: { group: "com.example", version: "4.5.6", modules: ["bom"] },
      template: { commit: "a".repeat(40), version: "1.2.3", tag: "starter-template@1.2.3" },
    },
  });
  assert.equal(identity.createVireoVersion, "1.2.3");
  assert.throws(() =>
    publicReleaseIdentity({
      current: {
        id: "wrong",
        npm: [{ name: "create-vireo", version: "1.2.3" }],
        maven: { group: "com.example", version: "4.5.6", modules: [] },
        template: { version: "1.2.3", commit: "a".repeat(40), tag: "starter-template@1.2.3" },
      },
    }),
  );
});

test("anonymous installation refuses links and non-registry lock entries", () => {
  const root = mkdtempSync(join(tmpdir(), "anonymous-installation-"));
  mkdirSync(join(root, "node_modules"), { recursive: true });
  writeFileSync(
    join(root, "package-lock.json"),
    JSON.stringify({ packages: { "node_modules/create-vireo": { resolved: "file:../local" } } }),
  );
  symlinkSync(root, join(root, "node_modules", "create-vireo"));
  assert.throws(() =>
    assertAnonymousInstallation({
      consumerRoot: root,
      packageNames: ["create-vireo"],
      registry: "https://registry.npmjs.org",
    }),
  );
  assert.throws(() =>
    assertNoMavenLocal(
      { executable: "./gradlew", arguments: ["publishToMavenLocal"] },
      { GRADLE_USER_HOME: "/tmp/gradle" },
    ),
  );
});

test("anonymous lockfile accepts only exact public Vireo coordinates", () => {
  const root = mkdtempSync(join(tmpdir(), "anonymous-vireo-lock-"));
  writeFileSync(
    join(root, "package-lock.json"),
    JSON.stringify({
      packages: {
        "node_modules/@vireocodedev/ui": {
          version: "1.2.3",
          resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui-1.2.3.tgz",
          integrity: "sha512-public",
        },
        "node_modules/example/node_modules/@vireocodedev/ui": {
          version: "1.2.3",
          resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui-1.2.3.tgz",
          integrity: "sha512-public-nested",
        },
      },
    }),
  );
  const release = { npm: [{ name: "@vireocodedev/ui", version: "1.2.3" }] };
  assert.doesNotThrow(() =>
    assertAnonymousVireoLock({ consumerRoot: root, release, registry: "https://registry.npmjs.org" }),
  );
  assert.throws(() =>
    assertAnonymousVireoLock({ consumerRoot: root, release: { npm: [] }, registry: "https://registry.npmjs.org" }),
  );
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  lock.packages["node_modules/example/node_modules/@vireocodedev/ui"].resolved = "file:../stale-ui";
  writeFileSync(join(root, "package-lock.json"), JSON.stringify(lock));
  assert.throws(
    () => assertAnonymousVireoLock({ consumerRoot: root, release, registry: "https://registry.npmjs.org" }),
    /public npm registry/u,
  );
  lock.packages["node_modules/example/node_modules/@vireocodedev/ui"].resolved =
    "https://registry.npmjs.org/@vireocodedev/ui/-/ui-1.2.3.tgz";
  lock.packages["node_modules/example/node_modules/@vireocodedev/ui"].link = true;
  writeFileSync(join(root, "package-lock.json"), JSON.stringify(lock));
  assert.throws(
    () => assertAnonymousVireoLock({ consumerRoot: root, release, registry: "https://registry.npmjs.org" }),
    /public npm registry/u,
  );
});

test("exact public npm consumer requires every declared Vireo package", () => {
  const root = mkdtempSync(join(tmpdir(), "anonymous-exact-public-"));
  mkdirSync(join(root, "node_modules", "@vireocodedev", "ui"), { recursive: true });
  writeFileSync(
    join(root, "node_modules", "@vireocodedev", "ui", "package.json"),
    JSON.stringify({ name: "@vireocodedev/ui", version: "1.2.3" }),
  );
  writeFileSync(
    join(root, "package-lock.json"),
    JSON.stringify({
      packages: {
        "node_modules/@vireocodedev/ui": {
          version: "1.2.3",
          resolved: "https://registry.npmjs.org/@vireocodedev/ui/-/ui-1.2.3.tgz",
          integrity: "sha512-public",
        },
      },
    }),
  );
  assert.throws(() =>
    assertExactPublicNpmConsumer({
      consumerRoot: root,
      release: {
        npm: [
          { name: "@vireocodedev/ui", version: "1.2.3" },
          { name: "create-vireo", version: "1.2.3" },
        ],
      },
      registry: "https://registry.npmjs.org",
    }),
  );
});
