import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  consumeJvmOnlyReleaseTrigger,
  prepareJvmOnlyReleaseTrigger,
  sentinelContents,
  sentinelPath,
} from "./prepare-jvm-only-release-trigger.mjs";

test("creates then consumes only the exact untracked JVM sentinel", () => {
  const root = mkdtempSync(join(tmpdir(), "vireo-jvm-sentinel-"));
  try {
    mkdirSync(join(root, ".changeset"));
    mkdirSync(join(root, ".release-impact"));
    writeFileSync(
      join(root, ".release-impact", "jvm.json"),
      JSON.stringify({ schemaVersion: 1, decision: "release", artifact: "jvm:vireo-core" }),
    );
    const git = () => {
      const error = new Error("not tracked");
      error.status = 1;
      throw error;
    };
    assert.equal(prepareJvmOnlyReleaseTrigger({ repositoryRoot: root, git }).action, "created");
    assert.equal(readFileSync(join(root, sentinelPath), "utf8"), sentinelContents);
    assert.equal(consumeJvmOnlyReleaseTrigger({ repositoryRoot: root, git }), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
