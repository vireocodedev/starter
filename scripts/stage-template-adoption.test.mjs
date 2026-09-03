import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  assertNoPendingMarkdownChangesets,
  parseStageArguments,
  stageTemplateAdoption,
} from "./stage-template-adoption.mjs";

const root = new URL("..", import.meta.url).pathname;
const plan = {
  action: "stage",
  version: "0.8.8",
  tag: "starter-template@0.8.8",
  commit: "b".repeat(40),
  releaseUrl: "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.8.8",
  ecosystemRelease: "npm-0.8.8_jvm-0.3.1",
  releaseManifestDigest: "c".repeat(64),
  npm: [],
  maven: { group: "com.vireocode", version: "0.3.1", modules: [] },
};

test("staging dry-run is deterministic and does not modify the repository", () => {
  const result = stageTemplateAdoption({ repositoryRoot: root, plan, dryRun: true });
  assert.equal(result.action, "draft");
  assert.equal(readFileSync(join(root, "packages/create-vireo/src/index.ts"), "utf8").includes(plan.commit), false);
});
test("argument parser supports machine-readable dry-runs", () => {
  assert.deepEqual(parseStageArguments(["--plan", "plan.json", "--dry-run", "--json"]), {
    plan: "plan.json",
    dryRun: true,
    json: true,
    help: false,
  });
});

test("staging refuses a pending Markdown Changeset collision while allowing non-markdown configuration", () => {
  const fixture = mkdtempSync(join(tmpdir(), "vireo-template-adoption-changesets-"));
  try {
    mkdirSync(join(fixture, ".changeset"));
    writeFileSync(join(fixture, ".changeset", "config.json"), "{}\n");
    assert.doesNotThrow(() => assertNoPendingMarkdownChangesets(fixture));
    writeFileSync(join(fixture, ".changeset", "human-change.md"), "---\n---\n");
    assert.throws(() => assertNoPendingMarkdownChangesets(fixture), /human-change\.md/u);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
