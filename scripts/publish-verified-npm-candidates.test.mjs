import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  inspectExistingTag,
  inspectRegistryCandidate,
  anonymousNpmEnvironment,
  npmPurl,
  publishVerifiedCandidates,
  reconcileCandidateTags,
  registryConfirmationSettings,
  validateAuditedProvenance,
  verifyNpmCandidates,
} from "./publish-verified-npm-candidates.mjs";

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
  assert.match(candidates[0].integrity, /^sha512-/u);
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

test("uses the established bounded npm visibility budget and rejects malformed environment overrides", () => {
  assert.deepEqual(registryConfirmationSettings({}), { retryAttempts: 80, retryDelay: 15_000 });
  assert.deepEqual(
    registryConfirmationSettings({
      NPM_CANDIDATE_CONFIRM_ATTEMPTS: "3",
      NPM_CANDIDATE_CONFIRM_INTERVAL_MS: "25",
    }),
    { retryAttempts: 3, retryDelay: 25 },
  );
  assert.throws(
    () => registryConfirmationSettings({ NPM_CANDIDATE_CONFIRM_ATTEMPTS: "zero" }),
    /NPM_CANDIDATE_CONFIRM_ATTEMPTS must be a positive integer/u,
  );
  assert.throws(
    () => registryConfirmationSettings({ NPM_CANDIDATE_CONFIRM_INTERVAL_MS: "0" }),
    /NPM_CANDIDATE_CONFIRM_INTERVAL_MS must be a positive integer/u,
  );
});

test("anonymous npm provenance audits isolate user, global, and XDG configuration from inherited credentials", () => {
  const environment = anonymousNpmEnvironment("/tmp/vireo-anonymous-audit", {
    NPM_CONFIG_USERCONFIG: "/secret/.npmrc",
    npm_config_globalconfig: "/secret/global",
    NPM_TOKEN: "secret",
  });
  assert.equal(environment.HOME, "/tmp/vireo-anonymous-audit/home");
  assert.equal(environment.XDG_CONFIG_HOME, "/tmp/vireo-anonymous-audit/xdg-config");
  assert.equal(environment.npm_config_userconfig, "/tmp/vireo-anonymous-audit/anonymous-user.npmrc");
  assert.equal(environment.npm_config_globalconfig, "/tmp/vireo-anonymous-audit/anonymous-global.npmrc");
  assert.equal(environment.npm_config_prefix, "/tmp/vireo-anonymous-audit/npm-prefix");
  assert.equal(environment.npm_config_always_auth, "false");
  assert.equal(environment.npm_config_registry, "https://registry.npmjs.org");
  assert.equal(environment.NPM_CONFIG_USERCONFIG, undefined);
  assert.equal(environment.NPM_TOKEN, undefined);
});

function gitFailure(status) {
  return Object.assign(new Error(`git exited ${status}`), { status });
}

test("inspects only an exact annotated release tag ref before peeling it to a commit", () => {
  const tag = "@vireocodedev/ui@0.2.8";
  const calls = [];
  const target = inspectExistingTag(tag, args => {
    calls.push(args);
    if (args[0] === "show-ref") return "";
    if (args[0] === "cat-file") return "tag";
    if (args[0] === "for-each-ref") return tag;
    if (args[0] === "rev-parse") return commit;
    assert.fail(`Unexpected git command: ${args.join(" ")}`);
  });
  assert.equal(target, commit);
  assert.deepEqual(calls, [
    ["show-ref", "--verify", "--quiet", `refs/tags/${tag}`],
    ["cat-file", "-t", `refs/tags/${tag}`],
    ["for-each-ref", "--format=%(contents:subject)", `refs/tags/${tag}`],
    ["rev-parse", "--verify", `refs/tags/${tag}^{commit}`],
  ]);
});

test("treats only an exact absent tag as missing and rejects lightweight, malformed, or corrupt tags", () => {
  const tag = "create-vireo@0.2.1";
  assert.equal(
    inspectExistingTag(tag, () => {
      throw gitFailure(1);
    }),
    null,
  );
  assert.throws(
    () =>
      inspectExistingTag(tag, () => {
        throw gitFailure(128);
      }),
    /Could not verify release tag ref/u,
  );
  assert.throws(
    () =>
      inspectExistingTag(tag, args => {
        if (args[0] === "show-ref") return "";
        if (args[0] === "cat-file") return "commit";
        assert.fail(`Unexpected git command: ${args.join(" ")}`);
      }),
    /annotated tag object/u,
  );
  assert.throws(
    () =>
      inspectExistingTag(tag, args => {
        if (args[0] === "show-ref") return "";
        if (args[0] === "cat-file") return "tag";
        if (args[0] === "for-each-ref") return tag;
        if (args[0] === "rev-parse") throw gitFailure(128);
        assert.fail(`Unexpected git command: ${args.join(" ")}`);
      }),
    /could not be peeled to a commit/u,
  );
});

test("rejects an annotated tag with a non-coordinate message", () => {
  const tag = "create-vireo@0.2.1";
  assert.throws(
    () =>
      inspectExistingTag(tag, args => {
        if (args[0] === "show-ref") return "";
        if (args[0] === "cat-file") return "tag";
        if (args[0] === "for-each-ref") return "wrong message";
        assert.fail(`Unexpected git command: ${args.join(" ")}`);
      }),
    /annotation message/u,
  );
});

function metadataResponse(candidate, overrides = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      name: candidate.name,
      version: candidate.version,
      dist: { integrity: candidate.integrity },
      ...overrides,
    }),
  };
}

function alternateIntegrity(candidate) {
  return `sha512-${createHash("sha512").update(`historical:${candidate.coordinate}`).digest("base64")}`;
}

function notFoundResponse() {
  return { ok: false, status: 404 };
}

function candidateFromUrl(candidates, url) {
  const candidate = candidates.find(({ name, version }) =>
    url.endsWith(`/${encodeURIComponent(name)}/${encodeURIComponent(version)}`),
  );
  assert.ok(candidate, `Unexpected registry URL: ${url}`);
  return candidate;
}

function tagOperations({ existingTags = new Map() } = {}) {
  const created = [];
  const logs = [];
  return {
    created,
    logs,
    options: {
      resolveTag: async tag => existingTags.get(tag) ?? null,
      createTag: async (...args) => created.push(args),
      log: line => logs.push(line),
    },
  };
}

function auditedProvenance(commits = new Map()) {
  return async candidates =>
    new Map(
      candidates.map(candidate => [
        candidate.coordinate,
        { commit: commits.get(candidate.coordinate) ?? commit, bundles: [{ retained: true }] },
      ]),
    );
}

function auditedBundle(candidate, registryIntegrity, overrides = {}) {
  const provenanceCommit = overrides.commit ?? commit;
  const statement = {
    _type: "https://in-toto.io/Statement/v1",
    predicateType: "https://slsa.dev/provenance/v1",
    subject: [
      {
        name: npmPurl(candidate),
        digest: { sha512: Buffer.from(registryIntegrity.slice(7), "base64").toString("hex") },
      },
    ],
    predicate: {
      buildDefinition: {
        externalParameters: {
          workflow: {
            repository: overrides.repository ?? "vireocodedev/vireo",
            path: ".github/workflows/release-npm.yml",
            ref: "refs/heads/main",
          },
        },
        internalParameters: {
          github: { repository_id: "1304974749" },
        },
        resolvedDependencies: [
          {
            uri: `git+https://github.com/vireocodedev/vireo@${provenanceCommit}`,
            digest: { gitCommit: provenanceCommit },
          },
        ],
      },
    },
  };
  return {
    verified: [
      {
        name: candidate.name,
        version: candidate.version,
        attestationBundles: [
          { bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") } } },
        ],
      },
    ],
  };
}

test("accepts only audited SLSA bundles that bind the exact PURL, registry SRI, repository identity, workflow, and commit", () => {
  const candidate = { ...verifyNpmCandidates(fixture(), commit)[0], registryIntegrity: undefined };
  candidate.registryIntegrity = candidate.integrity;
  const provenance = validateAuditedProvenance([candidate], auditedBundle(candidate, candidate.integrity));
  assert.equal(provenance.get(candidate.coordinate).commit, commit);

  const wrongIntegrity = auditedBundle(candidate, alternateIntegrity(candidate));
  assert.throws(() => validateAuditedProvenance([candidate], wrongIntegrity), /No audited SLSA provenance/u);
});

test("uses the npm package-url scope form with an encoded at-sign and literal slash", () => {
  const candidate = verifyNpmCandidates(fixture(), commit).find(item => item.name === "@vireocodedev/history");
  assert.equal(npmPurl(candidate), "pkg:npm/%40vireocodedev/history@0.2.2");
});

test("accepts the explicit historical starter repository alias in the live workflow repository URL shape", () => {
  const candidate = { ...verifyNpmCandidates(fixture(), commit)[0], registryIntegrity: undefined };
  candidate.registryIntegrity = candidate.integrity;
  const provenance = validateAuditedProvenance(
    [candidate],
    auditedBundle(candidate, candidate.integrity, { repository: "https://github.com/vireocodedev/starter" }),
  );
  assert.equal(provenance.get(candidate.coordinate).commit, commit);
});

test("publishes a missing candidate, confirms its exact reviewed bytes, then creates its tag", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const published = [];
  const tags = tagOperations();
  let checks = 0;
  const result = await publishVerifiedCandidates([candidate], {
    expectedCommit: commit,
    fetchRegistry: async () => (checks++ === 0 ? notFoundResponse() : metadataResponse(candidate)),
    publish: async ({ coordinate }) => published.push(coordinate),
    sleep: async () => assert.fail("registry confirmation should not need a retry"),
    ...tags.options,
  });
  assert.deepEqual(result, [candidate.coordinate]);
  assert.deepEqual(published, [candidate.coordinate]);
  assert.deepEqual(tags.created, [[candidate.coordinate, candidate.coordinate, commit]]);
  assert.deepEqual(tags.logs, [`New tag: ${candidate.coordinate}`]);
});

test("recovers an already-public coordinate after audited provenance matches its current tag", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations({ existingTags: new Map([[candidate.coordinate, commit]]) });
  const result = await publishVerifiedCandidates([candidate], {
    expectedCommit: commit,
    fetchRegistry: async () => metadataResponse(candidate),
    publish: async () => assert.fail("exact existing candidate must not publish"),
    auditHistoricalCandidates: auditedProvenance(),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(tags.created, []);
  assert.deepEqual(tags.logs, []);
});

test("classifies every registry 200 as historical, including matching reviewed SRI", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  assert.equal((await inspectRegistryCandidate(candidate, async () => notFoundResponse())).state, "absent");
  const sameBytes = await inspectRegistryCandidate(candidate, async () => metadataResponse(candidate));
  assert.equal(sameBytes.state, "historical");
  assert.equal(sameBytes.integrityMatchesCandidate, true);
  assert.equal(
    (
      await inspectRegistryCandidate(candidate, async () =>
        metadataResponse(candidate, { dist: { integrity: alternateIntegrity(candidate) } }),
      )
    ).state,
    "historical",
  );
  await assert.rejects(
    inspectRegistryCandidate(candidate, async () => metadataResponse(candidate, { name: "wrong-package" })),
    /unexpected coordinate/u,
  );
  await assert.rejects(
    inspectRegistryCandidate(candidate, async () =>
      metadataResponse(candidate, { dist: { integrity: "sha512-not-sri" } }),
    ),
    /invalid sha512 SRI/u,
  );
  await assert.rejects(
    inspectRegistryCandidate({ ...candidate, coordinate: "wrong" }, async () => notFoundResponse()),
    /valid npm coordinate/u,
  );
  await assert.rejects(
    inspectRegistryCandidate({ ...candidate, integrity: "sha512-not-sri" }, async () => notFoundResponse()),
    /valid sha512 SRI/u,
  );
});

test("retries registry propagation after publish and waits only between unresolved checks", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations();
  const responses = [notFoundResponse(), notFoundResponse(), notFoundResponse(), metadataResponse(candidate)];
  const sleeps = [];
  await publishVerifiedCandidates([candidate], {
    expectedCommit: commit,
    fetchRegistry: async () => responses.shift(),
    publish: async () => {},
    retryAttempts: 3,
    retryDelay: 25,
    sleep: async delay => sleeps.push(delay),
    ...tags.options,
  });
  assert.deepEqual(sleeps, [25, 25]);
  assert.deepEqual(tags.created, [[candidate.coordinate, candidate.coordinate, commit]]);
});

test("defers every tag operation until all candidate registry confirmations succeed", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const tags = tagOperations();
  let firstCandidateChecks = 0;
  await assert.rejects(
    publishVerifiedCandidates(candidates, {
      expectedCommit: commit,
      fetchRegistry: async url => {
        const candidate = candidateFromUrl(candidates, url);
        if (candidate === candidates[0])
          return firstCandidateChecks++ === 0 ? notFoundResponse() : metadataResponse(candidate);
        return { ok: false, status: 503 };
      },
      publish: async () => {},
      sleep: async () => {},
      ...tags.options,
    }),
    /HTTP 503/u,
  );
  assert.deepEqual(tags.created, []);
  assert.deepEqual(tags.logs, []);
});

test("preserves an immutable historical tag for a registry-existing candidate", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const tags = tagOperations({ existingTags: new Map([[candidates[1].coordinate, "b".repeat(40)]]) });
  const result = await publishVerifiedCandidates(candidates, {
    expectedCommit: commit,
    fetchRegistry: async url => {
      const candidate = candidateFromUrl(candidates, url);
      return metadataResponse(
        candidate,
        candidate === candidates[1] ? { dist: { integrity: alternateIntegrity(candidate) } } : {},
      );
    },
    publish: async () => assert.fail("existing candidates must not publish"),
    auditHistoricalCandidates: auditedProvenance(new Map([[candidates[1].coordinate, "b".repeat(40)]])),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(tags.created, [[candidates[0].coordinate, candidates[0].coordinate, commit]]);
  assert.deepEqual(tags.logs, [`New tag: ${candidates[0].coordinate}`]);
});

test("treats matching registry bytes as historical when their audited provenance points to a prior tag commit", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const provenanceCommit = "b".repeat(40);
  const tags = tagOperations({ existingTags: new Map([[candidate.coordinate, provenanceCommit]]) });
  const result = await publishVerifiedCandidates([candidate], {
    expectedCommit: commit,
    fetchRegistry: async () => metadataResponse(candidate),
    publish: async () => assert.fail("matching historical bytes must not republish"),
    auditHistoricalCandidates: auditedProvenance(new Map([[candidate.coordinate, provenanceCommit]])),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(tags.created, []);
});

test("automatic Template adoption rejects a historical CLI whose registry integrity differs from reviewed bytes", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit).at(-1);
  const tags = tagOperations({ existingTags: new Map([[candidate.coordinate, "b".repeat(40)]]) });
  await assert.rejects(
    publishVerifiedCandidates([candidate], {
      expectedCommit: commit,
      automaticTemplateAdoption: true,
      fetchRegistry: async () => metadataResponse(candidate, { dist: { integrity: alternateIntegrity(candidate) } }),
      publish: async () => assert.fail("mismatched historical CLI must not publish"),
      auditHistoricalCandidates: auditedProvenance(new Map([[candidate.coordinate, "b".repeat(40)]])),
      ...tags.options,
    }),
    /Automatic Template adoption requires registry integrity/u,
  );
  assert.deepEqual(tags.created, []);
});

test("creates a missing historical tag only at its audited provenance commit", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations();
  const provenanceCommit = "b".repeat(40);
  const result = await publishVerifiedCandidates([candidate], {
    expectedCommit: commit,
    fetchRegistry: async () => metadataResponse(candidate, { dist: { integrity: alternateIntegrity(candidate) } }),
    publish: async () => assert.fail("historical candidates must not publish"),
    auditHistoricalCandidates: auditedProvenance(new Map([[candidate.coordinate, provenanceCommit]])),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(tags.created, [[candidate.coordinate, candidate.coordinate, provenanceCommit]]);
});

test("fails before publication when an unpublished candidate tag belongs to another commit", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations({ existingTags: new Map([[candidate.coordinate, "b".repeat(40)]]) });
  await assert.rejects(
    publishVerifiedCandidates([candidate], {
      expectedCommit: commit,
      fetchRegistry: async () => notFoundResponse(),
      publish: async () => assert.fail("conflicting tag must block publication"),
      ...tags.options,
    }),
    /not expected commit/u,
  );
  assert.deepEqual(tags.created, []);
  assert.deepEqual(tags.logs, []);
});

test("recovers all registry-existing candidates by creating only missing tags", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const tags = tagOperations();
  const result = await publishVerifiedCandidates(candidates, {
    expectedCommit: commit,
    fetchRegistry: async url => metadataResponse(candidateFromUrl(candidates, url)),
    publish: async () => assert.fail("existing candidates must not publish"),
    auditHistoricalCandidates: auditedProvenance(),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(
    tags.created,
    candidates.map(candidate => [candidate.coordinate, candidate.coordinate, commit]),
  );
  assert.deepEqual(
    tags.logs,
    candidates.map(candidate => `New tag: ${candidate.coordinate}`),
  );
});

test("returns only candidates actually published when an exact retry and an absent candidate are mixed", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const tags = tagOperations({ existingTags: new Map([[candidates[1].coordinate, commit]]) });
  let firstCandidateChecks = 0;
  const result = await publishVerifiedCandidates(candidates, {
    expectedCommit: commit,
    fetchRegistry: async url => {
      const candidate = candidateFromUrl(candidates, url);
      if (candidate === candidates[0]) {
        return firstCandidateChecks++ === 0 ? notFoundResponse() : metadataResponse(candidate);
      }
      return metadataResponse(candidate);
    },
    publish: async candidate => assert.equal(candidate.coordinate, candidates[0].coordinate),
    auditHistoricalCandidates: auditedProvenance(),
    ...tags.options,
  });
  assert.deepEqual(result, [candidates[0].coordinate]);
  assert.deepEqual(tags.created, [[candidates[0].coordinate, candidates[0].coordinate, commit]]);
});

test("preflights every registry and tag state before publishing any absent candidate", async () => {
  const candidates = verifyNpmCandidates(fixture(), commit).slice(0, 2);
  const provenanceCommit = "b".repeat(40);
  const tags = tagOperations({ existingTags: new Map([[candidates[1].coordinate, "c".repeat(40)]]) });
  await assert.rejects(
    publishVerifiedCandidates(candidates, {
      expectedCommit: commit,
      fetchRegistry: async url => {
        const candidate = candidateFromUrl(candidates, url);
        return candidate === candidates[0]
          ? notFoundResponse()
          : metadataResponse(candidate, { dist: { integrity: alternateIntegrity(candidate) } });
      },
      publish: async () => assert.fail("preflight failure must occur before publication"),
      auditHistoricalCandidates: auditedProvenance(new Map([[candidates[1].coordinate, provenanceCommit]])),
      ...tags.options,
    }),
    /not audited provenance commit/u,
  );
  assert.deepEqual(tags.created, []);
});

test("fails strict post-publish confirmation when a raced registry version has historical bytes", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations();
  let checks = 0;
  await assert.rejects(
    publishVerifiedCandidates([candidate], {
      expectedCommit: commit,
      fetchRegistry: async () =>
        checks++ === 0
          ? notFoundResponse()
          : metadataResponse(candidate, { dist: { integrity: alternateIntegrity(candidate) } }),
      publish: async () => {},
      sleep: async () => assert.fail("historical bytes must not be retried"),
      ...tags.options,
    }),
    /does not match reviewed candidate bytes/u,
  );
  assert.deepEqual(tags.created, []);
});

test("keeps an exact duplicate without tags markers", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  const tags = tagOperations({ existingTags: new Map([[candidate.coordinate, commit]]) });
  const created = await reconcileCandidateTags([candidate], commit, tags.options);
  assert.deepEqual(created, []);
  assert.deepEqual(tags.logs, []);
});

test("recovers an all-published release without moving historical tags or emitting new tags", async () => {
  const allCandidates = verifyNpmCandidates(fixture(), commit);
  const candidates = [allCandidates[0], allCandidates.at(-1)];
  const tags = tagOperations({
    existingTags: new Map([
      [candidates[0].coordinate, "b".repeat(40)],
      [candidates[1].coordinate, commit],
    ]),
  });
  const result = await publishVerifiedCandidates(candidates, {
    expectedCommit: commit,
    fetchRegistry: async url => {
      const candidate = candidateFromUrl(candidates, url);
      return metadataResponse(
        candidate,
        candidate === candidates[0] ? { dist: { integrity: alternateIntegrity(candidate) } } : {},
      );
    },
    publish: async () => assert.fail("all-published recovery must not republish"),
    auditHistoricalCandidates: auditedProvenance(new Map([[candidates[0].coordinate, "b".repeat(40)]])),
    ...tags.options,
  });
  assert.deepEqual(result, []);
  assert.deepEqual(tags.created, []);
  assert.deepEqual(tags.logs, []);
});

test("fails closed on registry errors before publishing", async () => {
  const candidate = verifyNpmCandidates(fixture(), commit)[0];
  await assert.rejects(
    publishVerifiedCandidates([candidate], {
      expectedCommit: commit,
      fetchRegistry: async () => ({ ok: false, status: 503 }),
      publish: async () => assert.fail("publish must not run"),
    }),
    /HTTP 503/u,
  );
});
