import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyExactBaselineTransforms,
  assertStorybookBaselineContinuity,
  projectedBaselineBytes,
  projectedBaselineSourceBytes,
  templatePathForBaseline,
} from "./project-upgrade-baseline-contract.mjs";

test("frontend managed scripts map to their Template source paths", () => {
  assert.equal(
    templatePathForBaseline("frontend", "scripts/lighthouse-budget.mjs"),
    "frontend/scripts/lighthouse-budget.mjs",
  );
  assert.equal(
    templatePathForBaseline("full-stack", "frontend/scripts/lighthouse-budget.mjs"),
    "frontend/scripts/lighthouse-budget.mjs",
  );
  assert.equal(
    templatePathForBaseline("frontend", "vitest.storybook.config.ts"),
    "frontend/vitest.storybook.config.ts",
  );
});

test("managed Storybook optimizer baseline is an exact projection transform", () => {
  const baseline = {
    path: "vitest.storybook.config.ts",
    projectionTransforms: [
      {
        from: "  defineConfig({\n    test:",
        to: '  defineConfig({\n    optimizeDeps: { include: ["@testing-library/dom"] },\n    test:',
      },
    ],
  };
  assert.equal(
    projectedBaselineBytes("frontend", "  defineConfig({\n    test:", baseline),
    '  defineConfig({\n    optimizeDeps: { include: ["@testing-library/dom"] },\n    test:',
  );
});

test("managed upgrade baselines can bind a prior generated projection source", () => {
  const source = "defineConfig({\n  test:";
  const baseline = {
    path: "vitest.storybook.config.ts",
    sourceProjectionTransforms: [
      { from: "defineConfig({\n  test:", to: "defineConfig({\n  optimizeDeps: {}\n  test:" },
    ],
  };
  assert.equal(
    projectedBaselineSourceBytes(source, baseline),
    "defineConfig({\n  optimizeDeps: {}\n  test:",
  );
});

test("0.8.4 to 0.8.5 Storybook baselines retain predecessor target provenance", () => {
  const policy = JSON.parse(
    readFileSync(new URL("../../packages/create-vireo/schema/vireo-upgrade-policy.json", import.meta.url), "utf8"),
  );
  const edge = "0.8.4->0.8.5";
  assert.doesNotThrow(() => assertStorybookBaselineContinuity(policy.releaseGraph, edge));

  for (const profile of ["full-stack", "frontend"]) {
    const predecessor = policy.releaseGraph.baselines["0.8.3->0.8.4"][profile].find(file =>
      file.path.endsWith("vitest.storybook.config.ts"),
    );
    const current = policy.releaseGraph.baselines[edge][profile].find(file =>
      file.path.endsWith("vitest.storybook.config.ts"),
    );
    assert.equal(current.sourceSha256, predecessor.targetSha256);
    assert.equal(current.sourceContent, predecessor.targetContent);
  }

  const corrupted = structuredClone(policy.releaseGraph);
  corrupted.baselines[edge].frontend.find(file => file.path.endsWith("vitest.storybook.config.ts")).sourceSha256 =
    "0".repeat(64);
  assert.throws(
    () => assertStorybookBaselineContinuity(corrupted, edge),
    /0\.8\.4->0\.8\.5:frontend Storybook source must match 0\.8\.3->0\.8\.4 target provenance/u,
  );
});

test("Storybook provenance continuity ignores empty, unrelated, and first-add edges", () => {
  const edge = "0.8.5->0.8.6";
  const graphWith = files => ({
    edges: [{ from: "0.8.5", to: "0.8.6" }],
    baselines: {
      [edge]: {
        "full-stack": structuredClone(files),
        frontend: structuredClone(files),
      },
    },
  });

  assert.doesNotThrow(() => assertStorybookBaselineContinuity(graphWith([]), edge));
  assert.doesNotThrow(() =>
    assertStorybookBaselineContinuity(
      graphWith([{ operation: "update", path: "scripts/lighthouse-policy.mjs" }]),
      edge,
    ),
  );
  assert.doesNotThrow(() =>
    assertStorybookBaselineContinuity(
      graphWith([{ operation: "add", path: "vitest.storybook.config.ts" }]),
      edge,
    ),
  );
});

test("frontend Lighthouse baselines require the project-local evidence transform", () => {
  const baseline = {
    path: "scripts/lighthouse-budget.mjs",
    projectionTransforms: [
      {
        from: 'path.resolve(frontendRoot, "../.performance-evidence")',
        to: 'path.resolve(frontendRoot, ".performance-evidence")',
      },
    ],
  };
  assert.equal(
    projectedBaselineBytes("frontend", 'path.resolve(frontendRoot, "../.performance-evidence")', baseline),
    'path.resolve(frontendRoot, ".performance-evidence")',
  );
  assert.throws(
    () =>
      projectedBaselineBytes("frontend", 'path.resolve(frontendRoot, "../.performance-evidence")', {
        path: baseline.path,
      }),
    /project-local performance evidence/u,
  );
  assert.throws(
    () => applyExactBaselineTransforms("twice twice", { path: "x", transforms: [{ from: "twice", to: "once" }] }),
    /not exact/u,
  );
});
