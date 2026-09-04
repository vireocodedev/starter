import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readFileSync as read, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseGitNameStatus,
  planCiChanges,
  readExactChanges,
  validateCiChangePlanPolicy,
  writeGithubOutput,
} from "./ci-change-plan.mjs";

const policy = JSON.parse(readFileSync(new URL("../contracts/ci-change-plan-policy.json", import.meta.url), "utf8"));
const changed = (...paths) => paths.map(path => ({ status: "M", path }));

test("ci change-plan policy is complete", () => {
  assert.deepEqual(validateCiChangePlanPolicy(policy), []);
});

test("rejects a malformed policy before planning", () => {
  assert.ok(validateCiChangePlanPolicy({ schemaVersion: 0, scopes: {} }).length > 0);
  assert.throws(() => planCiChanges(changed("site/app.mjs"), { schemaVersion: 1, scopes: {} }), /must define/u);
});

test("rejects the previous planner schema that lacks new routed outputs", () => {
  const previousSchema = structuredClone(policy);
  delete previousSchema.scopes.publicBetaEvidence;
  delete previousSchema.scopes.documentationPages;
  assert.deepEqual(validateCiChangePlanPolicy(previousSchema), [
    "ci change-plan policy must define publicBetaEvidence",
    "ci change-plan policy must define documentationPages",
  ]);
});

test("parses deletion and rename records from NUL-delimited git output", () => {
  assert.deepEqual(
    parseGitNameStatus(Buffer.from("D\0site/old.png\0R100\0site/app.mjs\0jvm/vireo-core/src/main/java/App.java\0")),
    [
      { status: "D", path: "site/old.png" },
      { status: "R", previousPath: "site/app.mjs", path: "jvm/vireo-core/src/main/java/App.java" },
    ],
  );
  assert.throws(() => parseGitNameStatus(Buffer.from("R100\0old\0")), /Malformed rename/u);
});

test("writes stable GitHub output names and reason", () => {
  const directory = mkdtempSync(join(tmpdir(), "vireo-ci-plan-"));
  const output = join(directory, "github-output");
  try {
    writeGithubOutput(planCiChanges(changed("site/app.mjs"), policy), output);
    const result = read(output, "utf8");
    assert.match(result, /^website=true$/mu);
    assert.match(result, /^codeql-javascript=true$/mu);
    assert.match(result, /^typescript=false$/mu);
    assert.match(result, /^reason=only relevant verification lanes are enabled$/mu);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects a missing exact commit rather than guessing a comparison", () => {
  assert.throws(() => readExactChanges("not-a-commit", "HEAD"), /Unable to resolve exact commit not-a-commit/u);
});

test("routes a website JavaScript change without expensive ecosystem gates", () => {
  const plan = planCiChanges(changed("site/app.mjs"), policy);
  assert.equal(plan.website, true);
  assert.equal(plan.codeqlJavaScript, true);
  for (const name of [
    "typescript",
    "jvm",
    "generatedFrontend",
    "generatedFullstack",
    "projectUpgrade",
    "gauntletPlan",
    "codeqlJava",
    "dependencyReview",
    "publicBetaEvidence",
    "documentationPages",
  ]) {
    assert.equal(plan[name], false, name);
  }
  assert.equal(plan.full, false);
});

test("routes a static website asset without CodeQL", () => {
  const plan = planCiChanges(changed("site/assets/flagship-overview.png"), policy);
  assert.equal(plan.website, true);
  assert.equal(plan.codeqlJavaScript, false);
  assert.equal(plan.typescript, false);
  assert.equal(plan.documentationPages, false);
});

test("routes exact public-beta evidence inputs without forcing unrelated lanes", () => {
  for (const path of [
    "contracts/public-beta-evidence-policy.json",
    "docs/roadmap/phase-5/evidence/aggregate.json",
    ".github/ISSUE_TEMPLATE/public_beta_feedback.yml",
    ".github/ISSUE_TEMPLATE/adopter_check_in.yml",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.publicBetaEvidence, true, path);
    assert.equal(plan.typescript, false, path);
    assert.equal(plan.documentationPages, false, path);
    assert.equal(plan.full, false, path);
  }

  const evidenceScript = planCiChanges(changed("scripts/public-beta-evidence.mjs"), policy);
  assert.equal(evidenceScript.publicBetaEvidence, true);
  assert.equal(evidenceScript.typescript, true);
});

test("keeps unrelated issue templates lightweight and roadmap prose in ordinary documentation lanes", () => {
  for (const path of [".github/ISSUE_TEMPLATE/feature_request.yml", ".github/ISSUE_TEMPLATE/config.yml"]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.full, false, path);
    assert.equal(plan.publicBetaEvidence, false, path);
  }

  const prose = planCiChanges(changed("docs/roadmap/phase-5/public-beta-criteria.md"), policy);
  assert.equal(prose.publicBetaEvidence, false);
  assert.equal(prose.typescript, true);
  assert.equal(prose.documentationPages, true);
});

test("routes documentation Pages inputs to their owning lane", () => {
  for (const path of [
    "docs/ARCHITECTURE.md",
    "packages/ui/storybook/VireoStorybookProvider.tsx",
    "scripts/build-documentation-portal.mjs",
    "jvm/vireo-core/api-surface.txt",
    "site/content/getting-started.md",
    "packages/history/src/index.ts",
    "packages/ui/tsconfig.build.json",
    "packages/ui/templates/react-component/files/Component.tsx.template",
    "packages/create-vireo/src/index.ts",
    "jvm/vireo-core/src/main/java/example/Health.java",
    "jvm/vireo-core/build.gradle",
    "jvm/vireo-core/docs/overview.md",
    "contracts/documentation-ownership-contract.json",
    "scripts/documentation-ownership-policy.mjs",
    "scripts/synchronize-documentation-release.mjs",
    "scripts/lib/documentation-ownership-contract.mjs",
    "README.md",
    "tsconfig.base.json",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.documentationPages, true, path);
  }
});

test("routes checked-in API surfaces through the TypeScript policy lane", () => {
  for (const path of ["packages/ui/api-surface.json", "jvm/vireo-core/api-surface.txt"]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.typescript, true, path);
    assert.equal(plan.website, true, path);
    assert.equal(plan.full, false, path);
  }
});

test("routes public and projection contracts through TypeScript while retaining specialized lanes", () => {
  for (const path of [
    "contracts/application-projection-contract.json",
    "contracts/project-upgrade-policy.json",
    "contracts/template-adoption-intent.json",
    "contracts/documentation-release-policy.json",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.typescript, true, path);
    assert.equal(plan.full, false, path);
  }
});

test("does not classify shell scripts as JavaScript CodeQL source", () => {
  const plan = planCiChanges(changed("scripts/secret-scan.sh"), policy);
  assert.equal(plan.typescript, true);
  assert.equal(plan.codeqlJavaScript, false);
  assert.equal(plan.full, false);
});

test("routes JVM source to the JVM, full-stack, and Java analysis lanes", () => {
  const plan = planCiChanges(changed("jvm/vireo-core/src/main/java/example/Health.java"), policy);
  assert.equal(plan.jvm, true);
  assert.equal(plan.generatedFullstack, true);
  assert.equal(plan.codeqlJava, true);
  assert.equal(plan.generatedFrontend, false);
  assert.equal(plan.typescript, false);
});

test("routes a TypeScript package to package and generated-app verification", () => {
  const plan = planCiChanges(changed("packages/ui/src/Button.tsx"), policy);
  assert.equal(plan.typescript, true);
  assert.equal(plan.generatedFrontend, true);
  assert.equal(plan.generatedFullstack, true);
  assert.equal(plan.codeqlJavaScript, true);
  assert.equal(plan.projectUpgrade, true);
});

test("routes package documentation, Storybook, templates, and CLI build inputs through their affected lanes", () => {
  for (const path of [
    "packages/history/docs/examples/primaryWorkflow.example.ts",
    "packages/history/docs/storybook/Overview.mdx",
    "packages/ui/storybook/VireoStorybookProvider.tsx",
    "packages/ui/.storybook-vireo/preview.tsx",
    "packages/ui/templates/react-component/files/Component.tsx.template",
    "packages/ui/run-storybook-contracts.mjs",
    "packages/create-vireo/build.mjs",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.typescript, true, path);
    assert.equal(plan.codeqlJavaScript, true, path);
    assert.equal(plan.full, false, path);
  }

  for (const path of [
    "packages/ui/templates/react-component/template.config.mjs",
    "packages/ui/loading-state-contracts.json",
    "packages/create-vireo/build.mjs",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.generatedFrontend, true, path);
    assert.equal(plan.generatedFullstack, true, path);
    assert.equal(plan.projectUpgrade, true, path);
  }

  const jvmStorybook = planCiChanges(changed("jvm/vireo-core/docs/storybook/Overview.mdx"), policy);
  assert.equal(jvmStorybook.typescript, true);
  assert.equal(jvmStorybook.full, false);
});

test("routes transitive generated-consumer fixture inputs to every affected lane", () => {
  for (const path of [
    "contracts/ecosystem-release-contract.json",
    "scripts/lib/local-vireo-candidate-fixture.mjs",
    "scripts/lib/generated-fixture-template-pin.mjs",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.generatedFrontend, true, path);
    assert.equal(plan.generatedFullstack, true, path);
    assert.equal(plan.projectUpgrade, true, path);
  }
  const projectionPlan = planCiChanges(changed("scripts/lib/generated-project-projection-assertions.mjs"), policy);
  assert.equal(projectionPlan.generatedFrontend, true);
  assert.equal(projectionPlan.generatedFullstack, true);
  assert.equal(projectionPlan.projectUpgrade, false);
});

test("routes package configuration and JVM wrapper changes to their transitive consumers", () => {
  for (const path of [
    "packages/ui/tsconfig.build.json",
    "packages/ui/vitest.storybook.config.ts",
    "tsconfig.base.json",
  ]) {
    const packagePlan = planCiChanges(changed(path), policy);
    assert.equal(packagePlan.generatedFrontend, true, path);
    assert.equal(packagePlan.generatedFullstack, true, path);
    assert.equal(packagePlan.projectUpgrade, true, path);
    assert.equal(packagePlan.codeqlJavaScript, true, path);
  }

  const wrapperPlan = planCiChanges(changed("jvm/gradlew"), policy);
  assert.equal(wrapperPlan.generatedFullstack, true);
  assert.equal(wrapperPlan.codeqlJava, true);

  for (const path of [
    "jvm/vireo-core/build.gradle",
    "jvm/build.gradle",
    "jvm/settings.gradle",
    "jvm/gradle.properties",
  ]) {
    const groovyPlan = planCiChanges(changed(path), policy);
    assert.equal(groovyPlan.jvm, true, path);
    assert.equal(groovyPlan.generatedFullstack, true, path);
    assert.equal(groovyPlan.codeqlJava, true, path);
    assert.equal(groovyPlan.dependencyReview, true, path);
  }
});

test("routes nested dependency manifests and container definitions to dependency review", () => {
  for (const path of [
    "packages/ui/package.json",
    "jvm/buildSrc/build.gradle.kts",
    "jvm/vireo-core/build.gradle.kts",
    "deploy/Dockerfile.production",
    "deploy/docker-compose.dev.yml",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.dependencyReview, true, path);
  }
});

test("routes create-vireo upgrade code to the adjacent-upgrade fixture", () => {
  const plan = planCiChanges(changed("packages/create-vireo/src/project-upgrade.ts"), policy);
  assert.equal(plan.projectUpgrade, true);
  assert.equal(plan.typescript, true);
  assert.equal(plan.generatedFrontend, true);
  assert.equal(plan.generatedFullstack, true);
});

test("routes anonymous-consumer and JVM license-policy inputs to their owning lanes", () => {
  for (const path of [
    "contracts/application-projection-contract.json",
    "scripts/lib/application-projection-contract.mjs",
    "scripts/lib/release-sbom-evidence.mjs",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.gauntletPlan, true, path);
    assert.equal(plan.full, false, path);
  }

  for (const path of [
    "contracts/third-party-license-policy.json",
    "scripts/third-party-license-policy.mjs",
    "scripts/lib/third-party-license-policy.mjs",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.jvm, true, path);
    assert.equal(plan.full, false, path);
  }
});

test("considers both sides of a rename", () => {
  const plan = planCiChanges(
    [{ status: "R", previousPath: "site/app.mjs", path: "jvm/vireo-core/src/main/java/example/Health.java" }],
    policy,
  );
  assert.equal(plan.website, true);
  assert.equal(plan.codeqlJavaScript, true);
  assert.equal(plan.jvm, true);
  assert.equal(plan.codeqlJava, true);
});

test("keeps only root Changeset metadata lightweight and routes documentation through the TypeScript policy lane", () => {
  for (const path of [".changeset/docs-only.md", ".release-impact/docs-only.md"]) {
    const metadataPlan = planCiChanges(changed(path), policy);
    assert.equal(metadataPlan.full, false, path);
    assert.ok(
      Object.entries(metadataPlan)
        .filter(([name]) => !["full", "changedPaths", "unclassifiedPaths"].includes(name))
        .every(([, enabled]) => enabled === false),
      path,
    );
  }

  const changesetConfig = planCiChanges(changed(".changeset/config.json"), policy);
  assert.equal(changesetConfig.full, true);

  for (const path of [".changeset/nested/docs-only.md", ".changeset/pre.json", ".changeset/config.yaml"]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.full, true, path);
  }

  const plan = planCiChanges(changed("docs/ARCHITECTURE.md"), policy);
  assert.equal(plan.full, false);
  assert.equal(plan.typescript, true);
  assert.ok(
    Object.entries(plan)
      .filter(
        ([name]) => !["typescript", "documentationPages", "full", "changedPaths", "unclassifiedPaths"].includes(name),
      )
      .every(([, enabled]) => enabled === false),
  );
  assert.equal(plan.documentationPages, true);
});

test("fails closed for unknown and CI-control paths", () => {
  for (const path of [
    "new-top-level-file",
    ".prettierrc",
    ".github/workflows/ci.yml",
    "contracts/ci-change-plan-policy.json",
    "scripts/unclassified-helper.sh",
  ]) {
    const plan = planCiChanges(changed(path), policy);
    assert.equal(plan.full, true, path);
    assert.ok(
      Object.entries(plan)
        .filter(([name]) => !["full", "changedPaths", "unclassifiedPaths"].includes(name))
        .every(([, enabled]) => enabled === true),
      path,
    );
  }
});
