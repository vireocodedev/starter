import assert from "node:assert/strict";
import test from "node:test";
import {
  applyExactBaselineTransforms,
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
