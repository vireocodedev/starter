import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  assertGeneratedApplicationPackage,
  assertGeneratedMarkdownLinks,
  assertGeneratedVerificationBudgetAlignment,
  assertGeneratedProjectExclusions,
  assertGeneratedProjectIdentity,
  assertGeneratedProjectTemplateMetadata,
  assertGeneratedVerificationSplit,
  assertGeneratedWorkflowPolicy,
} from "./lib/generated-project-projection-assertions.mjs";

test("generated projection assertions reject excluded paths", () => {
  assert.doesNotThrow(() =>
    assertGeneratedProjectExclusions([".env.example", "Dockerfile", "src/app/App.tsx"], "frontend"),
  );
  assert.throws(
    () => assertGeneratedProjectExclusions([".github/CODEOWNERS", "docs/recipes/rehearse-demo-reset.md"], "full-stack"),
    /excluded paths/u,
  );
  assert.throws(
    () =>
      assertGeneratedProjectExclusions(
        [
          ".github/workflows/template-release.yml",
          "contracts/template-release-policy.json",
          "scripts/template-release-policy.mjs",
          "scripts/template-release-policy.test.mjs",
          "scripts/write-template-release-manifest.mjs",
          "contracts/platform-support-policy.json",
          "scripts/platform-support-policy.mjs",
          "scripts/public-contract-policy.mjs",
          "scripts/verification-pipeline-policy.mjs",
          "scripts/vireo-package-compatibility-policy.mjs",
        ],
        "full-stack",
      ),
    /excluded paths/u,
  );
  assert.throws(
    () => assertGeneratedProjectExclusions(["tests/e2e/login.spec.ts", ".vscode/settings.json"], "frontend"),
    /excluded paths/u,
  );
  assert.throws(
    () => assertGeneratedProjectExclusions(["src/main/java/dev/example/App.java", "services/build.gradle"], "frontend"),
    /excluded paths/u,
  );
});

test("generated projection assertions reject inherited public identity routes", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-identity-"));
  try {
    await mkdir(join(root, ".vireo"), { recursive: true });
    await mkdir(join(root, ".github", "ISSUE_TEMPLATE"), { recursive: true });
    const identity = {
      projectName: "projection-app",
      displayName: "Projection App",
      ownerName: "Example Team",
      repositoryUrl: "https://example.test/projection-app",
      supportUrl: "https://support.example.test/projection-app",
      securityContact: "https://security.example.test/projection-app",
    };
    await writeFile(join(root, ".vireo", "project.json"), JSON.stringify({ profile: "frontend", ...identity }));
    await writeFile(join(root, "README.md"), `${identity.repositoryUrl}\n`);
    await writeFile(join(root, "SECURITY.md"), `${identity.securityContact}\n`);
    await writeFile(
      join(root, "SUPPORT.md"),
      `${identity.supportUrl}\nhttps://github.com/vireocodedev/vireo-template\n`,
    );
    await writeFile(
      join(root, ".github", "ISSUE_TEMPLATE", "config.yml"),
      `${identity.supportUrl}\n${identity.securityContact}\n`,
    );
    assert.throws(() => assertGeneratedProjectIdentity(root, "frontend", identity), /inherits a Vireo/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated projection assertions reject incoherent template metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-template-metadata-"));
  try {
    await mkdir(join(root, ".vireo"), { recursive: true });
    const template = {
      commit: "a".repeat(40),
      version: "0.6.0",
      tag: "starter-template@0.6.0",
    };
    await writeFile(
      join(root, ".vireo", "project.json"),
      JSON.stringify({
        templateCommit: template.commit,
        templateVersion: template.version,
        templateTag: template.tag,
        createdBy: "create-vireo@0.6.0",
      }),
    );
    assert.doesNotThrow(() => assertGeneratedProjectTemplateMetadata(root, template));
    await writeFile(
      join(root, ".vireo", "project.json"),
      JSON.stringify({
        templateCommit: template.commit,
        templateVersion: template.version,
        templateTag: "starter-template@0.5.0",
        createdBy: "create-vireo@0.6.0",
      }),
    );
    assert.throws(() => assertGeneratedProjectTemplateMetadata(root, template), /templateTag/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated projection assertions report broken Markdown links", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-links-"));
  try {
    await writeFile(join(root, "README.md"), "[missing](missing.md)\n");
    assert.throws(() => assertGeneratedMarkdownLinks(root), /README\.md -> missing\.md/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated projection assertions identify template-only verifier references by path and token", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-verifier-reference-"));
  try {
    await writeFile(join(root, "README.md"), "Run ./scripts/verify-template.sh silent.\n");
    assert.throws(() => assertGeneratedVerificationSplit(root, "frontend"), /README\.md -> verify-template\.sh/u);
    await writeFile(
      join(root, "package.json"),
      '{"scripts":{"release:policy":"node scripts/template-release-policy.mjs"}}\n',
    );
    assert.throws(() => assertGeneratedVerificationSplit(root, "frontend"), /package\.json -> release:policy/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated projection assertions require application package and workflow normalization", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-package-"));
  try {
    await mkdir(join(root, ".vireo"), { recursive: true });
    await mkdir(join(root, "frontend"), { recursive: true });
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "contracts"), { recursive: true });
    await mkdir(join(root, ".github", "workflows"), { recursive: true });
    await writeFile(join(root, ".vireo", "project.json"), JSON.stringify({ createdBy: "create-vireo@0.6.0" }));
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        version: "0.1.0",
        scripts: { vireo: "npx --yes --package=create-vireo@0.6.0 vireo" },
      }),
    );
    await writeFile(
      join(root, "gradle.properties"),
      "org.gradle.caching=true\nstarterVersion=0.3.1\norg.gradle.jvmargs=-Xmx2g\n",
    );
    await writeFile(
      join(root, "frontend", "package.json"),
      JSON.stringify({ scripts: { "toolchain:check": "node ../scripts/toolchain-policy.mjs" } }),
    );
    await writeFile(join(root, "scripts", "toolchain-policy.mjs"), "export {};\n");
    await writeFile(
      join(root, ".github", "workflows", "ci.yml"),
      "concurrency:\n  group: verify-${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true\n",
    );
    await writeFile(
      join(root, "contracts", "github-actions-policy.json"),
      JSON.stringify({
        requiredConcurrencyWorkflows: {
          "ci.yml": { group: "verify-${{ github.workflow }}-${{ github.ref }}", cancelInProgress: true },
        },
      }),
    );
    assert.doesNotThrow(() => assertGeneratedApplicationPackage(root, "full-stack", "0.3.1"));
    assert.doesNotThrow(() => assertGeneratedWorkflowPolicy(root, "full-stack"));

    for (const ciPolicy of [
      {},
      { group: "verify-${{ github.workflow }}-${{ github.ref }}" },
      { group: "different", cancelInProgress: true },
    ]) {
      await writeFile(
        join(root, "contracts", "github-actions-policy.json"),
        JSON.stringify({ requiredConcurrencyWorkflows: { "ci.yml": ciPolicy } }),
      );
      assert.throws(() => assertGeneratedWorkflowPolicy(root, "full-stack"), /ci\.yml concurrency policy/u);
    }

    await writeFile(
      join(root, "contracts", "github-actions-policy.json"),
      JSON.stringify({
        requiredConcurrencyWorkflows: {
          "ci.yml": { group: "verify-${{ github.workflow }}-${{ github.ref }}", cancelInProgress: true },
          "template-release.yml": {},
        },
      }),
    );
    assert.throws(() => assertGeneratedWorkflowPolicy(root, "full-stack"), /template-release\.yml/u);
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        version: "0.6.0",
        scripts: {
          vireo: "npx --yes --package=create-vireo@0.6.0 vireo",
          "release:policy": "node scripts/template-release-policy.mjs",
        },
      }),
    );
    assert.throws(() => assertGeneratedApplicationPackage(root, "full-stack", "0.3.1"), /package version/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated projection assertions reject verifier and budget stage drift", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-projection-budget-"));
  try {
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "contracts"), { recursive: true });
    await writeFile(join(root, "scripts", "verify.sh"), 'steps=(\n  "development-database|Database|node test"\n)\n');
    await writeFile(join(root, "contracts", "verification-budget-policy.json"), JSON.stringify({ stages: {} }));
    assert.throws(() => assertGeneratedVerificationBudgetAlignment(root), /stages disagree/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
