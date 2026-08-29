import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildJvmInventory,
  buildNpmInventory,
  classifyLicenseExpression,
  evaluateLicenseInventory,
  validateLicensePolicy,
} from "./lib/third-party-license-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(join(root, "contracts", "third-party-license-policy.json"), "utf8"));
const activeNow = new Date("2026-08-30T00:00:00Z");

function dependency(licenses, overrides = {}) {
  return {
    ecosystem: "npm",
    package: "example",
    version: "1.0.0",
    direct: true,
    releaseRoots: ["fixture"],
    licenses,
    ...overrides,
  };
}

test("SPDX expressions apply OR and AND semantics", () => {
  assert.equal(classifyLicenseExpression("MIT OR EPL-2.0", policy).classification, "allowed");
  assert.equal(classifyLicenseExpression("MIT AND EPL-2.0", policy).classification, "review");
  assert.equal(classifyLicenseExpression("GPL-2.0-only WITH Classpath-exception-2.0", policy).classification, "review");
});

test("unknown and denied licenses fail even when an attacker supplies an exception", () => {
  const poisoned = {
    ...policy,
    exceptions: [
      ...policy.exceptions,
      {
        id: "cannot-mask-denied",
        ecosystem: "npm",
        package: "example",
        version: "1.0.0",
        licenses: ["AGPL-3.0-only"],
        owner: "@security",
        tracking: "docs/security/review.md",
        rationale: "A deliberately invalid override used by this adversarial policy test.",
        obligationsAccepted: ["publication-blocked"],
        expiresAt: "2027-01-01T00:00:00Z",
      },
    ],
  };
  const denied = evaluateLicenseInventory({ entries: [dependency(["AGPL-3.0-only"])] }, poisoned, {
    now: activeNow,
  });
  const unknown = evaluateLicenseInventory({ entries: [dependency(["Mystery-1.0"])] }, policy, { now: activeNow });
  assert.match(denied.problems.join("\n"), /uses denied license/u);
  assert.match(unknown.problems.join("\n"), /unclassified licenses/u);
});

test("review approval is exact, owned, and expires", () => {
  const reviewed = dependency(["EPL-2.0"], {
    ecosystem: "jvm",
    package: "org.aspectj:aspectjweaver",
    version: "1.9.25.1",
  });
  const accepted = evaluateLicenseInventory({ entries: [reviewed] }, policy, { now: activeNow });
  assert.equal(accepted.problems.length, 0);
  assert.equal(accepted.entries[0].classification, "review-exception");
  assert.equal(accepted.entries[0].exception, "jvm-aspectjweaver-1.9.25.1");

  const drift = evaluateLicenseInventory({ entries: [{ ...reviewed, version: "1.9.26" }] }, policy, { now: activeNow });
  assert.match(drift.problems.join("\n"), /requires license review/u);
  assert.match(validateLicensePolicy(policy, new Date("2027-03-01T00:00:00Z")).join("\n"), /expired at/u);

  const unowned = structuredClone(policy);
  delete unowned.exceptions[0].owner;
  assert.match(validateLicensePolicy(unowned, activeNow).join("\n"), /accountable @owner/u);
});

test("npm inventory follows public dependencies and optional dependencies but excludes peers", () => {
  const lock = {
    lockfileVersion: 3,
    packages: {
      "packages/public": {
        dependencies: { direct: "1.0.0" },
        optionalDependencies: { optional: "1.0.0" },
        peerDependencies: { consumerOwned: "1.0.0" },
      },
      "node_modules/direct": { version: "1.0.0", license: "MIT", dependencies: { transitive: "2.0.0" } },
      "node_modules/optional": { version: "1.0.0", license: "ISC" },
      "node_modules/transitive": { version: "2.0.0", license: "Apache-2.0" },
      "node_modules/consumerOwned": { version: "1.0.0", license: "AGPL-3.0-only" },
    },
  };
  const inventory = buildNpmInventory({ lock, roots: [{ name: "public", path: "packages/public" }] });
  assert.deepEqual(
    inventory.entries.map(entry => [entry.package, entry.direct]),
    [
      ["direct", true],
      ["optional", true],
      ["transitive", false],
    ],
  );
  assert.equal(inventory.problems.length, 0);
});

test("npm inventory treats unresolved lock edges as a blocking graph problem", () => {
  const inventory = buildNpmInventory({
    lock: { lockfileVersion: 3, packages: { "packages/public": { dependencies: { missing: "1.0.0" } } } },
    roots: [{ name: "public", path: "packages/public" }],
  });
  assert.match(inventory.problems.join("\n"), /cannot resolve missing/u);
});

test("JVM inventory traverses direct and transitive release components", () => {
  const sbom = {
    bomFormat: "CycloneDX",
    components: [
      { "bom-ref": "root", group: "com.vireocode", name: "vireo-core", version: "1" },
      {
        "bom-ref": "direct",
        group: "org.example",
        name: "direct",
        version: "1",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        "bom-ref": "transitive",
        group: "org.example",
        name: "transitive",
        version: "2",
        licenses: [{ expression: "Apache-2.0" }],
      },
    ],
    dependencies: [
      { ref: "root", dependsOn: ["direct"] },
      { ref: "direct", dependsOn: ["transitive"] },
      { ref: "transitive", dependsOn: [] },
    ],
  };
  const inventory = buildJvmInventory({ sbom, roots: ["vireo-bom", "vireo-core"], group: "com.vireocode" });
  assert.deepEqual(
    inventory.entries.map(entry => [entry.package, entry.direct]),
    [
      ["org.example:direct", true],
      ["org.example:transitive", false],
    ],
  );
});

test("repository npm release graph is fully classified", () => {
  const contract = JSON.parse(readFileSync(join(root, "contracts", "ecosystem-release-contract.json"), "utf8"));
  const expected = new Set(contract.current.npm.map(artifact => artifact.name));
  const roots = readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      path: `packages/${entry.name}`,
      manifest: JSON.parse(readFileSync(join(root, "packages", entry.name, "package.json"), "utf8")),
    }))
    .filter(({ manifest }) => expected.has(manifest.name))
    .map(({ path, manifest }) => ({ name: manifest.name, path }));
  const inventory = buildNpmInventory({
    lock: JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")),
    roots,
  });
  const result = evaluateLicenseInventory(inventory, policy, { now: activeNow });
  assert.equal(result.problems.length, 0);
  assert.equal(roots.length, expected.size);
  assert.ok(result.entries.length > 0);
});

test("license gate is wired into contracts, verification, CI, and release evidence", () => {
  const packageManifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const contract = JSON.parse(readFileSync(join(root, "contracts", "ecosystem-release-contract.json"), "utf8"));
  assert.equal(contract.policySources.thirdPartyLicenses, "contracts/third-party-license-policy.json");
  assert.match(packageManifest.scripts["license:check:npm"], /--ecosystem npm/u);
  assert.match(packageManifest.scripts["license:check:jvm"], /--ecosystem jvm/u);
  assert.match(readFileSync(join(root, "scripts", "verify.sh"), "utf8"), /license:check:npm/u);
  assert.match(readFileSync(join(root, "scripts", "verify-all.sh"), "utf8"), /license:check:jvm/u);
  assert.match(
    readFileSync(join(root, "scripts", "generate-release-evidence.mjs"), "utf8"),
    /third-party-license-inventory\.json/u,
  );
  assert.match(
    readFileSync(join(root, ".github", "workflows", "ci.yml"), "utf8"),
    /third-party-license-policy\.mjs --ecosystem jvm/u,
  );
  assert.match(
    readFileSync(join(root, ".github", "workflows", "release-maven-central.yml"), "utf8"),
    /third-party-license-policy\.mjs --ecosystem jvm/u,
  );
});
