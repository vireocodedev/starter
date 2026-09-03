import assert from "node:assert/strict";
import test from "node:test";
import { finalizeJvmRelease } from "./finalize-jvm-release.mjs";

test("creates an annotated tag then an immutable exact JVM release", async () => {
  const calls = [];
  let reference = null;
  let release = null;
  const request = async (path, options = {}) => {
    calls.push([path, options.method ?? "GET"]);
    if (path.startsWith("/git/ref/")) return reference;
    if (path === "/git/tags") return { sha: "t".repeat(40) };
    if (path === "/git/refs") {
      reference = { object: { type: "tag", sha: "t".repeat(40) } };
      return {};
    }
    if (path.startsWith("/git/tags/"))
      return { tag: "jvm-v0.3.2", message: "Vireo JVM 0.3.2", object: { type: "commit", sha: "a".repeat(40) } };
    if (path.startsWith("/releases/tags/")) return release;
    if (path === "/releases") {
      release = {
        tag_name: "jvm-v0.3.2",
        target_commitish: "a".repeat(40),
        name: "Vireo JVM 0.3.2",
        body: "- A release note.",
        draft: false,
        prerelease: false,
        immutable: true,
        html_url: "https://example.test/release",
      };
      return release;
    }
    throw new Error(path);
  };
  const result = await finalizeJvmRelease({
    version: "0.3.2",
    sha: "a".repeat(40),
    changelog: "# JVM\n\n## 0.3.2\n\n- A release note.\n",
    request,
    sleep: async () => {},
  });
  assert.equal(result.tag, "jvm-v0.3.2");
  assert.deepEqual(
    calls.slice(0, 3).map(item => item[0]),
    ["/git/ref/tags/jvm-v0.3.2", "/git/tags", "/git/refs"],
  );
});

test("public Maven recovery refuses to create a new tag or release", async () => {
  await assert.rejects(
    finalizeJvmRelease({
      version: "0.3.2",
      sha: "a".repeat(40),
      changelog: "# JVM\n\n## 0.3.2\n\n- A release note.\n",
      recoveryOnly: true,
      request: async () => null,
    }),
    /requires existing exact annotated tag/u,
  );
});

test("accepts an existing release whose target_commitish is a branch when its annotated tag is exact", async () => {
  const request = async path => {
    if (path.startsWith("/git/ref/")) return { object: { type: "tag", sha: "t".repeat(40) } };
    if (path.startsWith("/git/tags/"))
      return { tag: "jvm-v0.3.2", message: "Vireo JVM 0.3.2", object: { type: "commit", sha: "a".repeat(40) } };
    if (path.startsWith("/releases/tags/"))
      return {
        tag_name: "jvm-v0.3.2",
        target_commitish: "main",
        name: "Vireo JVM 0.3.2",
        body: "- A release note.",
        draft: false,
        prerelease: false,
        immutable: true,
        html_url: "https://example.test/jvm",
      };
    throw new Error(path);
  };
  const result = await finalizeJvmRelease({
    version: "0.3.2",
    sha: "a".repeat(40),
    changelog: "# JVM\n\n## 0.3.2\n\n- A release note.\n",
    recoveryOnly: true,
    request,
  });
  assert.equal(result.tag, "jvm-v0.3.2");
});

test("rejects immutable draft JVM releases", async () => {
  const request = async path => {
    if (path.startsWith("/git/ref/")) return { object: { type: "tag", sha: "t".repeat(40) } };
    if (path.startsWith("/git/tags/"))
      return { tag: "jvm-v0.3.2", message: "Vireo JVM 0.3.2", object: { type: "commit", sha: "a".repeat(40) } };
    return {
      tag_name: "jvm-v0.3.2",
      name: "Vireo JVM 0.3.2",
      body: "- A release note.",
      draft: true,
      prerelease: false,
      immutable: true,
    };
  };
  await assert.rejects(
    finalizeJvmRelease({
      version: "0.3.2",
      sha: "a".repeat(40),
      changelog: "# JVM\n\n## 0.3.2\n\n- A release note.\n",
      recoveryOnly: true,
      request,
    }),
    /does not exactly match/u,
  );
});
