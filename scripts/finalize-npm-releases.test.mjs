import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizedNpmReleaseCoordinates,
  npmReleaseIdentity,
  reconcileNpmGitHubReleases,
} from "./finalize-npm-releases.mjs";

const commit = "a".repeat(40);
const coordinate = "@vireocodedev/history@0.2.3";
const changelog = "# history\n\n## 0.2.3\n\n### Patch Changes\n\n- Exact release entry.\n\n## 0.2.2\n\n- Previous.\n";

test("recovers a missing GitHub Release from an exact existing remote npm tag", async () => {
  let release = null;
  const calls = [];
  const request = async (path, options = {}) => {
    calls.push([path, options.method ?? "GET"]);
    if (path.startsWith("/git/ref/")) return { object: { type: "tag", sha: "b".repeat(40) } };
    if (path.startsWith("/git/tags/"))
      return { tag: coordinate, message: coordinate, object: { type: "commit", sha: commit } };
    if (path.startsWith("/releases/tags/")) return release;
    if (path === "/releases") {
      release = {
        tag_name: coordinate,
        name: coordinate,
        body: "### Patch Changes\n\n- Exact release entry.",
        draft: false,
        prerelease: false,
        immutable: true,
        html_url: "https://example.test/npm",
      };
      return release;
    }
    throw new Error(path);
  };
  const result = await reconcileNpmGitHubReleases({
    coordinates: [coordinate],
    sourceCommit: commit,
    changelogs: new Map([[coordinate, changelog]]),
    request,
    sleep: async () => {},
  });
  assert.equal(result[0].coordinate, coordinate);
  assert.ok(calls.some(([path, method]) => path === "/releases" && method === "POST"));
});

test("rejects wrong remote tag target and out-of-scope release results", async () => {
  await assert.rejects(
    reconcileNpmGitHubReleases({
      coordinates: [coordinate],
      sourceCommit: commit,
      changelogs: new Map([[coordinate, changelog]]),
      request: async path =>
        path.startsWith("/git/ref/")
          ? { object: { type: "tag", sha: "b".repeat(40) } }
          : { tag: coordinate, message: coordinate, object: { type: "commit", sha: "c".repeat(40) } },
    }),
    /does not exactly bind/u,
  );
  assert.throws(
    () =>
      authorizedNpmReleaseCoordinates(
        { candidates: [{ coordinate }], published: ["create-vireo@0.8.8"], recoveredTags: [], publishedTags: [] },
        { scope: "classic-libraries", expected: new Set([coordinate]) },
      ),
    /out-of-scope/u,
  );
});

test("accepts an existing matching immutable Changesets GitHub Release and rejects conflicts", async () => {
  const matching = {
    tag_name: coordinate,
    name: coordinate,
    body: "### Patch Changes\n\n- Exact release entry.",
    draft: false,
    prerelease: false,
    immutable: true,
    html_url: "https://example.test/npm",
  };
  const request = async path => {
    if (path.startsWith("/git/ref/")) return { object: { type: "tag", sha: "b".repeat(40) } };
    if (path.startsWith("/git/tags/"))
      return { tag: coordinate, message: coordinate, object: { type: "commit", sha: commit } };
    if (path.startsWith("/releases/tags/")) return matching;
    throw new Error(path);
  };
  await reconcileNpmGitHubReleases({
    coordinates: [coordinate],
    sourceCommit: commit,
    changelogs: new Map([[coordinate, changelog]]),
    request,
  });
  await assert.rejects(
    reconcileNpmGitHubReleases({
      coordinates: [coordinate],
      sourceCommit: commit,
      changelogs: new Map([[coordinate, changelog]]),
      request: async path =>
        path.startsWith("/git/ref/")
          ? { object: { type: "tag", sha: "b".repeat(40) } }
          : path.startsWith("/git/tags/")
            ? { tag: coordinate, message: coordinate, object: { type: "commit", sha: commit } }
            : { ...matching, body: "wrong" },
    }),
    /does not exactly match/u,
  );
});

test("keeps fenced same-depth-looking headings inside the exact Changesets changelog entry", () => {
  const identity = npmReleaseIdentity(
    coordinate,
    "# history\n\n## 0.2.3\n\n### Patch Changes\n\n```md\n## example heading\n```\n\n- Exact release entry.\n\n## 0.2.2\n\n- Previous.\n",
  );
  assert.match(identity.body, /## example heading/u);
  assert.doesNotMatch(identity.body, /Previous/u);
});

test("uses the matched arbitrary heading depth and rejects unstable Releases", () => {
  const identity = npmReleaseIdentity(
    coordinate,
    "# history\n\n### 0.2.3\n\n```\n### example heading\n```\n\n- Exact.\n\n### 0.2.2\n\n- Previous.\n",
  );
  assert.match(identity.body, /example heading/u);
  assert.doesNotMatch(identity.body, /Previous/u);
});

test("does not close a four-backtick fence at an embedded three-backtick line", () => {
  const identity = npmReleaseIdentity(
    coordinate,
    "# history\n\n## 0.2.3\n\n````md\n```\n## fenced same-depth heading\n````\n\n- Exact after fence.\n\n## 0.2.2\n\n- Previous.\n",
  );
  assert.match(identity.body, /fenced same-depth heading/u);
  assert.match(identity.body, /Exact after fence/u);
  assert.doesNotMatch(identity.body, /Previous/u);
});

test("rejects a draft or prerelease GitHub Release for a stable npm coordinate", async () => {
  const request = async path => {
    if (path.startsWith("/git/ref/")) return { object: { type: "tag", sha: "b".repeat(40) } };
    if (path.startsWith("/git/tags/"))
      return { tag: coordinate, message: coordinate, object: { type: "commit", sha: commit } };
    return {
      tag_name: coordinate,
      name: coordinate,
      body: "### Patch Changes\n\n- Exact release entry.",
      draft: true,
      prerelease: false,
      immutable: true,
    };
  };
  await assert.rejects(
    reconcileNpmGitHubReleases({
      coordinates: [coordinate],
      sourceCommit: commit,
      changelogs: new Map([[coordinate, changelog]]),
      request,
    }),
    /does not exactly match/u,
  );
});
