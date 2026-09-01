import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createVireo, findExampleReferences, removeExample, TEMPLATE_COMMIT } from "../dist/index.js";

const createVireoVersion = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")).version;
const applicationSkillNames = ["vireo-app-feature-author", "vireo-app-upgrader", "vireo-app-production-readiness"];

async function writeApplicationSkill(template, name) {
  const skill = join(template, ".vireo", "application", ".agents", "skills", name);
  await mkdir(join(skill, "agents"), { recursive: true });
  await writeFile(join(skill, "SKILL.md"), `---\nname: ${name}\ndescription: Fixture consumer skill.\n---\n`);
  await writeFile(
    join(skill, "agents", "openai.yaml"),
    `interface:\n  display_name: "Fixture App Skill"\n  short_description: "Fixture consumer skill"\n  default_prompt: "Use $${name} for fixture work."\n`,
  );
}

async function assertProjectedApplicationGuidance(target) {
  assert.match(await readFile(join(target, "AGENTS.md"), "utf8"), /Application guidance/u);
  const managed = JSON.parse(await readFile(join(target, ".vireo", "managed-files.json"), "utf8"));
  const managedPaths = new Set(managed.files.map(file => file.path));
  assert.equal(managedPaths.has("AGENTS.md"), false, "application-owned AGENTS.md is not managed");
  for (const name of applicationSkillNames) {
    assert.match(await readFile(join(target, ".agents", "skills", name, "SKILL.md"), "utf8"), new RegExp(name, "u"));
    assert.equal(managedPaths.has(`.agents/skills/${name}/SKILL.md`), true, `${name} skill is managed`);
    assert.equal(managedPaths.has(`.agents/skills/${name}/agents/openai.yaml`), true, `${name} metadata is managed`);
  }
  await assert.rejects(readFile(join(target, ".agents", "skills", "vireo-template-maintainer", "SKILL.md")), /ENOENT/u);
}

async function fixture(root) {
  const template = join(root, "template");
  await mkdir(join(template, ".vireo"), { recursive: true });
  await mkdir(join(template, ".vireo", "application"), { recursive: true });
  await mkdir(join(template, ".agents", "skills", "vireo-template-maintainer", "agents"), { recursive: true });
  await mkdir(join(template, "src/main/java/com/vireocode/startertemplate"), { recursive: true });
  await writeFile(join(template, ".vireo/template.json"), "{}\n");
  await writeFile(join(template, "AGENTS.md"), "# Template maintainer guidance\n");
  await writeFile(
    join(template, ".agents", "skills", "vireo-template-maintainer", "SKILL.md"),
    "---\nname: vireo-template-maintainer\ndescription: Fixture maintainer skill.\n---\n",
  );
  await writeFile(
    join(template, ".agents", "skills", "vireo-template-maintainer", "agents", "openai.yaml"),
    'interface:\n  display_name: "Fixture Template Maintainer"\n  short_description: "Fixture maintainer skill"\n  default_prompt: "Use $vireo-template-maintainer for fixture work."\n',
  );
  await writeFile(join(template, ".vireo", "application", "AGENTS.md"), "# Application guidance\n");
  for (const name of applicationSkillNames) await writeApplicationSkill(template, name);
  await mkdir(join(template, ".github"), { recursive: true });
  await mkdir(join(template, ".github", "workflows"), { recursive: true });
  await mkdir(join(template, "contracts"), { recursive: true });
  await mkdir(join(template, "scripts"), { recursive: true });
  await mkdir(join(template, ".vscode"), { recursive: true });
  await writeFile(
    join(template, ".github/dependabot.yml"),
    "version: 2\nupdates:\n  - package-ecosystem: npm\n    directory: /frontend\n",
  );
  await writeFile(
    join(template, ".github/workflows/ci.yml"),
    "concurrency:\n  group: verify-${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true\nsteps:\n  - run: ./scripts/verify-template.sh silent\n",
  );
  await writeFile(
    join(template, "contracts/github-actions-policy.json"),
    JSON.stringify({
      requiredConcurrencyWorkflows: {
        "ci.yml": { group: "verify-${{ github.workflow }}-${{ github.ref }}", cancelInProgress: true },
        "template-release.yml": {},
      },
    }),
  );
  await writeFile(
    join(template, "scripts/verify.sh"),
    '#!/usr/bin/env bash\nset -euo pipefail\nsteps=(\n  "development-database|Development database modes|true"\n)\n',
  );
  await writeFile(
    join(template, "scripts/toolchain-policy.mjs"),
    `const policy = readJson("contracts/toolchain-policy.json");
const platformPolicy = readJson("contracts/platform-support-policy.json");
expectEqual(
  "platform Node exact",
  policy.node,
  platformPolicy.toolchains.node.exact,
);
expectEqual(
  "platform Node range",
  policy.nodeRange,
  platformPolicy.toolchains.node.range,
);
expectEqual("platform npm", policy.npm, platformPolicy.toolchains.npm.exact);
expectEqual(
  "platform Java",
  policy.java,
  platformPolicy.toolchains.java.compile,
);
expectEqual("platform Gradle", policy.gradle, platformPolicy.toolchains.gradle);
expectEqual(
  "platform Spring Boot",
  policy.springBoot,
  platformPolicy.toolchains.springBoot,
);
expectEqual(
  "platform canonical runner",
  policy.canonicalRunner,
  platformPolicy.canonicalHost.os,
);

export {};
`,
  );
  await writeFile(
    join(template, ".vscode/settings.json"),
    '{"java.import.gradle.enabled":true,"files.exclude":{"frontend/dist":true}}\n',
  );
  await writeFile(join(template, "settings.gradle"), "rootProject.name = 'starter-template'\n");
  await writeFile(
    join(template, "gradle.properties"),
    "org.gradle.caching=true\nstarterVersion=0.3.0\norg.gradle.jvmargs=-Xmx2g\n",
  );
  await writeFile(join(template, "README.md"), "# Vireo Starter Template\n");
  await writeFile(
    join(template, "package.json"),
    JSON.stringify({
      name: "starter-template",
      version: "0.6.0",
      scripts: {
        vireo: "npx --yes --package=create-vireo@0.3.0 vireo",
        "release:policy": "node scripts/template-release-policy.mjs",
      },
    }),
  );
  await mkdir(join(template, "frontend/src/app/ui/localization/resources"), { recursive: true });
  await mkdir(join(template, "frontend/public/icons"), { recursive: true });
  await mkdir(join(template, "frontend/tests/pwa"), { recursive: true });
  await mkdir(join(template, "frontend/tests/demo"), { recursive: true });
  await mkdir(join(template, "frontend/tests/deployment"), { recursive: true });
  await mkdir(join(template, "frontend/tests/e2e"), { recursive: true });
  await mkdir(join(template, "frontend/scripts"), { recursive: true });
  await mkdir(join(template, "frontend/docs/architecture"), { recursive: true });
  await writeFile(
    join(template, "frontend/package.json"),
    JSON.stringify({
      name: "starter-template-frontend",
      version: "0.6.0",
      scripts: {
        dev: "vite",
        build: "vite build",
        typecheck: "tsc --noEmit",
        lint: "eslint src",
        format: "prettier --write .",
        "format:check": "prettier --check .",
        test: "vitest run",
        "test:storybook": "vitest --run",
        storybook: "storybook dev",
        "build-storybook": "storybook build",
        "starter:mode:published": "node scripts/mode.mjs",
        "starter:boundary:check": "node scripts/boundary.mjs",
        "architecture:check": "node scripts/architecture.mjs",
        "bundle:check": "node scripts/bundle.mjs",
        "pwa:check:source": "node scripts/check-pwa-contract.mjs --source --require-nginx",
        "pwa:check:built": "node scripts/check-pwa-contract.mjs --built",
        "pretest:pwa": "node scripts/prepare-pwa-update-fixture.mjs",
        "test:pwa": "playwright test --config=playwright.pwa.config.ts",
        "toolchain:check": "node ../scripts/toolchain-policy.mjs && node ../scripts/platform-support-policy.mjs",
        preview: "vite preview",
      },
      dependencies: { "@vireocodedev/ui": "^0.2.2" },
    }),
  );
  await writeFile(
    join(template, "frontend/package-lock.json"),
    JSON.stringify({
      name: "starter-template-frontend",
      version: "0.6.0",
      lockfileVersion: 3,
      packages: { "": { name: "starter-template-frontend", version: "0.6.0" } },
    }),
  );
  await writeFile(join(template, "frontend/vite.config.ts"), 'import { createPwaManifest } from "./pwa-policy.mjs";\n');
  await writeFile(
    join(template, "frontend/pwa-policy.mjs"),
    `export const APP_IDENTITY = Object.freeze({
  id: "/vireo-starter",
  name: "Vireo Starter",
  shortName: "Vireo",
  description: "A production-oriented full-stack PWA built on Vireo Starter.",
});
`,
  );
  await writeFile(
    join(template, "frontend/scripts/pwa-contract.mjs"),
    "export const checkPwaSourceContract = () => []; export const formatPwaContractProblems = () => '';\n",
  );
  await writeFile(join(template, "frontend/scripts/check-pwa-contract.mjs"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/prepare-pwa-update-fixture.mjs"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/serve-pwa-update-fixture.mjs"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/pwa-update-fixture.mjs"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/pwa-update-fixture.d.mts"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/app-identity-html.mjs"), "export {};\n");
  await writeFile(join(template, "frontend/scripts/verify.sh"), "#!/usr/bin/env bash\nset -euo pipefail\n");
  await writeFile(join(template, "frontend/tests/pwa/production-pwa.spec.ts"), "export {};\n");
  await writeFile(join(template, "frontend/tests/demo/flagship-demo.spec.ts"), "export {};\n");
  await writeFile(join(template, "frontend/tests/deployment/smoke.spec.ts"), "export {};\n");
  await writeFile(join(template, "frontend/tests/e2e/login.spec.ts"), "export {};\n");
  await writeFile(join(template, "frontend/playwright.demo.config.ts"), "export {};\n");
  await writeFile(join(template, "frontend/playwright.deployment.config.ts"), "export {};\n");
  await writeFile(join(template, "frontend/public/icons/icon-192x192.png"), "fixture\n");
  await mkdir(join(template, "frontend/src/features/item"), { recursive: true });
  await writeFile(join(template, "frontend/src/features/item/public.ts"), "export type Item = { id: number };\n");
  await writeFile(
    join(template, "src/main/java/com/vireocode/startertemplate/App.java"),
    "package com.vireocode.startertemplate;\n",
  );
  return template;
}

test("creates and customizes a project atomically from a local fixture", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "sample-app");
    const result = await createVireo({
      directory: target,
      javaPackage: "dev.example.sample",
      database: "h2",
      git: false,
      templateDirectory: template,
    });
    assert.equal(result.templateCommit, TEMPLATE_COMMIT);
    assert.match(await readFile(join(target, "settings.gradle"), "utf8"), /sample-app/u);
    assert.match(await readFile(join(target, "README.md"), "utf8"), /^# Sample App$/mu);
    await assertProjectedApplicationGuidance(target);
    const identity = await readFile(join(target, "frontend/pwa-policy.mjs"), "utf8");
    assert.match(identity, /id: "\/sample-app"/u);
    assert.match(identity, /name: "Sample App"/u);
    assert.match(identity, /shortName: "Sample App"/u);
    assert.match(identity, /description: "Sample App is a production-oriented application\."/u);
    assert.doesNotMatch(identity, /Vireo Starter/u);
    assert.ok((await readFile(join(target, "package.json"), "utf8")).includes(`create-vireo@${createVireoVersion}`));
    assert.equal(
      await readFile(join(target, "gradle.properties"), "utf8"),
      "org.gradle.caching=true\nstarterVersion=0.3.1\norg.gradle.jvmargs=-Xmx2g\n",
    );
    assert.match(
      await readFile(join(target, "src/main/java/dev/example/sample/App.java"), "utf8"),
      /package dev\.example\.sample/u,
    );
    const metadata = JSON.parse(await readFile(join(target, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.createdBy, `create-vireo@${createVireoVersion}`);
    assert.deepEqual(
      {
        templateCommit: metadata.templateCommit,
        templateVersion: metadata.templateVersion,
        templateTag: metadata.templateTag,
      },
      {
        templateCommit: TEMPLATE_COMMIT,
        templateVersion: createVireoVersion,
        templateTag: `starter-template@${createVireoVersion}`,
      },
    );
    assert.deepEqual(
      { projectName: metadata.projectName, javaPackage: metadata.javaPackage, database: metadata.database },
      { projectName: "sample-app", javaPackage: "dev.example.sample", database: "h2" },
    );
    assert.deepEqual(
      {
        displayName: metadata.displayName,
        ownerName: metadata.ownerName,
        repositoryUrl: metadata.repositoryUrl,
        supportUrl: metadata.supportUrl,
        securityContact: metadata.securityContact,
      },
      {
        displayName: "Sample App",
        ownerName: "UNRESOLVED_VIREO_OWNER_NAME",
        repositoryUrl: "UNRESOLVED_VIREO_REPOSITORY_URL",
        supportUrl: "UNRESOLVED_VIREO_SUPPORT_URL",
        securityContact: "UNRESOLVED_VIREO_SECURITY_CONTACT",
      },
    );
    const runIdentityCheck = args =>
      execFileSync(process.execPath, ["scripts/project-identity-policy.mjs", ...args], {
        cwd: target,
        encoding: "utf8",
        stdio: "pipe",
      });
    const assertIdentityFailure = (args, expected) =>
      assert.throws(
        () => runIdentityCheck(args),
        error => expected.test(String(error.stderr)),
      );
    assert.doesNotThrow(() => runIdentityCheck([]));
    assertIdentityFailure(["--release"], /ownerName is unresolved/u);
    const resolvedIdentity = {
      ...metadata,
      ownerName: "Example Application Team",
      repositoryUrl: "https://example.test/sample-app",
      supportUrl: "mailto:support@example.test",
      securityContact: "https://security.example.test/sample-app",
    };
    await writeFile(join(target, ".vireo/project.json"), `${JSON.stringify(resolvedIdentity, null, 2)}\n`);
    assert.doesNotThrow(() => runIdentityCheck(["--release", "--json"]));
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify({ ...resolvedIdentity, schemaVersion: 2 }, null, 2)}\n`,
    );
    assertIdentityFailure([], /schemaVersion must be 1/u);
    assertIdentityFailure(["--release"], /schemaVersion must be 1/u);
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify({ ...resolvedIdentity, profile: "frontend" }, null, 2)}\n`,
    );
    assertIdentityFailure([], /profile must be full-stack/u);
    assertIdentityFailure(["--release"], /profile must be full-stack/u);
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify(
        {
          ...resolvedIdentity,
          supportUrl: "https://support.example.test/sample-app",
          securityContact: "https://support.example.test/sample-app/",
        },
        null,
        2,
      )}\n`,
    );
    assertIdentityFailure(["--release"], /supportUrl and securityContact must be distinct/u);
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify(
        {
          ...resolvedIdentity,
          supportUrl: "mailto:Security@example.test",
          securityContact: "mailto:security@example.test",
        },
        null,
        2,
      )}\n`,
    );
    assertIdentityFailure(["--release"], /supportUrl and securityContact must be distinct/u);
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify({ ...resolvedIdentity, repositoryUrl: "https://github.com/vireocodedev/vireo" }, null, 2)}\n`,
    );
    assertIdentityFailure(["--release"], /repositoryUrl must not inherit a Vireo/u);
    await writeFile(
      join(target, ".vireo/project.json"),
      `${JSON.stringify({ ...resolvedIdentity, securityContact: resolvedIdentity.supportUrl }, null, 2)}\n`,
    );
    assertIdentityFailure(["--release"], /supportUrl and securityContact must be distinct/u);
    const generatedPackage = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
    assert.equal(generatedPackage.scripts["identity:check"], "node scripts/project-identity-policy.mjs");
    assert.equal(
      generatedPackage.scripts["identity:check:release"],
      "node scripts/project-identity-policy.mjs --release",
    );
    assert.equal(
      generatedPackage.scripts["verify:release"],
      "corepack npm run identity:check:release && corepack npm run verify",
    );
    assert.equal(generatedPackage.version, "0.1.0");
    assert.equal(generatedPackage.scripts["release:policy"], undefined);
    const generatedFrontendPackage = JSON.parse(await readFile(join(target, "frontend", "package.json"), "utf8"));
    assert.equal(generatedFrontendPackage.scripts["toolchain:check"], "node ../scripts/toolchain-policy.mjs");
    assert.doesNotMatch(
      await readFile(join(target, "scripts", "toolchain-policy.mjs"), "utf8"),
      /platform-support-policy/u,
    );
    const generatedWorkflowPolicy = JSON.parse(
      await readFile(join(target, "contracts", "github-actions-policy.json"), "utf8"),
    );
    assert.deepEqual(Object.keys(generatedWorkflowPolicy.requiredConcurrencyWorkflows).sort(), ["ci.yml"]);
    const fullStackIdentityPolicy = await readFile(join(target, "scripts/project-identity-policy.mjs"), "utf8");
    assert.match(fullStackIdentityPolicy, /IDENTITY_CONTRACT/u);
    assert.match(fullStackIdentityPolicy, /EXPECTED_PROFILE = "full-stack"/u);
    assert.doesNotThrow(() =>
      execFileSync(process.execPath, ["--check", "scripts/project-identity-policy.mjs"], {
        cwd: target,
        encoding: "utf8",
        stdio: "pipe",
      }),
    );
    assert.match(await readFile(join(target, "scripts/verify.sh"), "utf8"), /project-identity\|Project identity/u);
    for (const path of ["README.md", "SECURITY.md", "SUPPORT.md"]) {
      assert.doesNotMatch(await readFile(join(target, path), "utf8"), /vireocodedev\/starter(?:-template)?/u);
    }
    const issueConfig = await readFile(join(target, ".github/ISSUE_TEMPLATE/config.yml"), "utf8");
    assert.match(issueConfig, /contact_links: \[\]/u);
    assert.doesNotMatch(issueConfig, /UNRESOLVED_VIREO_|mailto:/u);
    assert.match(await readFile(join(target, ".github/dependabot.yml"), "utf8"), /directory: \/frontend/u);
    assert.match(await readFile(join(target, ".vscode/settings.json"), "utf8"), /java\.import\.gradle/u);
    for (const path of [
      "frontend/playwright.demo.config.ts",
      "frontend/playwright.deployment.config.ts",
      "frontend/tests/demo/flagship-demo.spec.ts",
      "frontend/tests/deployment/smoke.spec.ts",
      "frontend/tests/e2e/login.spec.ts",
    ]) {
      assert.match(await readFile(join(target, path), "utf8"), /export/u);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("normalizes the immutable Template JVM baseline only for full-stack projects", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-jvm-release-"));
  try {
    const template = await fixture(root);
    const fullStack = join(root, "full-stack-app");
    const frontend = join(root, "frontend-app");
    await createVireo({ directory: fullStack, git: false, templateDirectory: template });
    await createVireo({ directory: frontend, profile: "frontend", git: false, templateDirectory: template });
    assert.equal(
      await readFile(join(template, "gradle.properties"), "utf8"),
      "org.gradle.caching=true\nstarterVersion=0.3.0\norg.gradle.jvmargs=-Xmx2g\n",
    );
    assert.equal(
      await readFile(join(fullStack, "gradle.properties"), "utf8"),
      "org.gradle.caching=true\nstarterVersion=0.3.1\norg.gradle.jvmargs=-Xmx2g\n",
    );
    await assert.rejects(readFile(join(frontend, "gradle.properties")), /ENOENT/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("refuses malformed, missing, duplicate, or drifted Template starterVersion baselines", async () => {
  const cases = [
    "",
    "starterVersion=not-a-version\n",
    "starterVersion=0.2.0\n",
    "starterVersion=0.3.0\nstarterVersion=0.3.0\n",
  ];
  for (const [index, gradleProperties] of cases.entries()) {
    const root = await mkdtemp(join(tmpdir(), `create-vireo-jvm-baseline-${index}-`));
    try {
      const template = await fixture(root);
      await writeFile(join(template, "gradle.properties"), gradleProperties);
      await assert.rejects(
        createVireo({ directory: join(root, "invalid-app"), git: false, templateDirectory: template }),
        /exactly one starterVersion=0\.3\.0 baseline/u,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("never overwrites an existing target", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "existing-app");
    await mkdir(target);
    await assert.rejects(createVireo({ directory: target, templateDirectory: template }), /already exists/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("derives historical ci workflow concurrency when the policy predates it", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-historical-workflow-policy-test-"));
  try {
    const template = await fixture(root);
    await writeFile(join(template, "contracts", "github-actions-policy.json"), "{}\n");
    await writeFile(
      join(template, ".github", "workflows", "ci.yml"),
      "name: Verify\nconcurrency:\n  group: verify-${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true\njobs: {}\n",
    );

    const target = join(root, "historical-workflow-policy-app");
    await createVireo({ directory: target, git: false, templateDirectory: template });
    const policy = JSON.parse(await readFile(join(target, "contracts", "github-actions-policy.json"), "utf8"));
    assert.deepEqual(policy.requiredConcurrencyWorkflows, {
      "ci.yml": {
        group: "verify-${{ github.workflow }}-${{ github.ref }}",
        cancelInProgress: true,
      },
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects declared ci workflow concurrency that drifts from ci.yml", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-workflow-policy-drift-test-"));
  try {
    const template = await fixture(root);
    await writeFile(
      join(template, "contracts", "github-actions-policy.json"),
      JSON.stringify({
        requiredConcurrencyWorkflows: {
          "ci.yml": { group: "verify-different", cancelInProgress: true },
        },
      }),
    );
    await assert.rejects(
      createVireo({ directory: join(root, "workflow-policy-drift-app"), git: false, templateDirectory: template }),
      /ci\.yml concurrency policy must exactly match ci\.yml/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects historical workflow policies without parseable ci concurrency", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-malformed-workflow-policy-test-"));
  try {
    const template = await fixture(root);
    await writeFile(join(template, "contracts", "github-actions-policy.json"), "{}\n");
    await writeFile(join(template, ".github", "workflows", "ci.yml"), "name: Verify\njobs: {}\n");
    await assert.rejects(
      createVireo({ directory: join(root, "missing-concurrency-app"), git: false, templateDirectory: template }),
      /ci\.yml must declare a concurrency block/u,
    );
    await writeFile(
      join(template, ".github", "workflows", "ci.yml"),
      "name: Verify\nconcurrency:\n  group: verify-${{ github.workflow }}-${{ github.ref }}\njobs: {}\n",
    );
    await assert.rejects(
      createVireo({ directory: join(root, "malformed-concurrency-app"), git: false, templateDirectory: template }),
      /concurrency block must declare one group and cancel-in-progress value/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("normalizes historical public-contract budgets from retained verifier stages", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-historical-budget-test-"));
  try {
    const template = await fixture(root);
    await writeFile(
      join(template, "scripts", "verify.sh"),
      '#!/usr/bin/env bash\nset -euo pipefail\nsteps=(\n  "public-contract|Public contract|true"\n)\n',
    );
    await writeFile(
      join(template, "contracts", "verification-budget-policy.json"),
      JSON.stringify({
        stages: {
          "public-contract": {
            label: "Public contract",
            baselineMs: 500,
            warningMs: 5000,
            failureMs: 10000,
            baselineRssKiB: 80000,
            warningRssKiB: 262144,
            failureRssKiB: 524288,
          },
        },
      }),
    );

    const target = join(root, "historical-budget-app");
    await createVireo({ directory: target, git: false, templateDirectory: template });
    const verify = await readFile(join(target, "scripts", "verify.sh"), "utf8");
    const budget = JSON.parse(await readFile(join(target, "contracts", "verification-budget-policy.json"), "utf8"));
    assert.match(verify, /project-identity\|Project identity/u);
    assert.doesNotMatch(verify, /public-contract/u);
    assert.deepEqual(Object.keys(budget.stages).sort(), ["project-identity"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("local template directories ignore ordinary checkout artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-artifacts-test-"));
  try {
    const template = await fixture(root);
    await mkdir(join(template, ".gradle", "cache"), { recursive: true });
    await mkdir(join(template, "frontend", "dist"), { recursive: true });
    await mkdir(join(template, "operations", "evidence"), { recursive: true });
    await writeFile(join(template, ".gradle", "cache", "state.bin"), "local\n");
    await writeFile(join(template, "frontend", "dist", "bundle.js"), "local\n");
    await writeFile(join(template, "operations", "evidence", "run.json"), "local\n");
    await writeFile(join(template, ".env.local"), "LOCAL_ONLY=true\n");
    await writeFile(join(template, "frontend", "scratch.iml"), "local\n");

    const target = join(root, "artifact-safe-app");
    await createVireo({ directory: target, git: false, templateDirectory: template });
    for (const path of [
      ".gradle/cache/state.bin",
      "frontend/dist/bundle.js",
      "operations/evidence/run.json",
      ".env.local",
      "frontend/scratch.iml",
    ]) {
      await assert.rejects(readFile(join(target, path)), /ENOENT/u);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("local template directories reject symbolic links", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-link-test-"));
  try {
    const template = await fixture(root);
    await symlink("README.md", join(template, "linked-readme.md"));
    await assert.rejects(
      createVireo({ directory: join(root, "linked-app"), git: false, templateDirectory: template }),
      /unsupported link/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("creates a standalone frontend profile without Java, Gradle, or database files", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-frontend-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "operations-ui");
    const result = await createVireo({
      directory: target,
      profile: "frontend",
      git: false,
      templateDirectory: template,
    });

    assert.equal(result.profile, "frontend");
    assert.equal(result.javaPackage, undefined);
    assert.equal(result.database, undefined);
    const identity = await readFile(join(target, "pwa-policy.mjs"), "utf8");
    assert.match(identity, /id: "\/operations-ui"/u);
    assert.match(identity, /name: "Operations Ui"/u);
    assert.match(identity, /shortName: "Operations"/u);
    assert.doesNotMatch(identity, /Vireo Starter/u);
    await assertProjectedApplicationGuidance(target);
    const environment = await readFile(join(target, ".env.development"), "utf8");
    assert.match(environment, /VITE_API_MODE=mock/u);
    assert.doesNotMatch(environment, /VITE_APP_NAME/u);
    assert.match(await readFile(join(target, ".gitignore"), "utf8"), /^\.pwa-update-fixture\/$/mu);
    assert.match(await readFile(join(target, ".gitignore"), "utf8"), /^!\.env\.development$/mu);
    const packageJson = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
    assert.equal(packageJson.version, "0.1.0");
    assert.equal(packageJson.scripts["release:policy"], undefined);
    for (const script of ["pwa:check:source", "pwa:check:built", "pretest:pwa", "test:pwa"]) {
      assert.equal(typeof packageJson.scripts[script], "string", `${script} is retained`);
    }
    assert.equal(packageJson.scripts["identity:check"], "node scripts/project-identity-policy.mjs");
    assert.equal(packageJson.scripts["identity:check:release"], "node scripts/project-identity-policy.mjs --release");
    assert.equal(
      packageJson.scripts["verify:release"],
      "corepack npm run identity:check:release && corepack npm run verify",
    );
    const lock = JSON.parse(await readFile(join(target, "package-lock.json"), "utf8"));
    assert.equal(lock.version, "0.1.0");
    assert.equal(lock.packages[""].version, "0.1.0");
    const verify = await readFile(join(target, "scripts/verify-frontend-profile.sh"), "utf8");
    assert.match(verify, /Project identity[\s\S]*pwa:check:source[\s\S]*Application build[\s\S]*pwa:check:built/u);
    const frontendIdentityPolicy = await readFile(join(target, "scripts/project-identity-policy.mjs"), "utf8");
    assert.match(frontendIdentityPolicy, /IDENTITY_CONTRACT/u);
    assert.match(frontendIdentityPolicy, /EXPECTED_PROFILE = "frontend"/u);
    const doctor = await readFile(join(target, "scripts/vireo-frontend-doctor.mjs"), "utf8");
    assert.match(doctor, /Frontend profile/u);
    assert.match(doctor, /VIR-VERIFY-001/u);
    assert.match(doctor, /checkPwaSourceContract/u);
    assert.match(await readFile(join(target, "scripts/pwa-contract.mjs"), "utf8"), /checkPwaSourceContract/u);
    assert.match(await readFile(join(target, "scripts/pwa-update-fixture.mjs"), "utf8"), /export/u);
    assert.match(await readFile(join(target, "tests/pwa/production-pwa.spec.ts"), "utf8"), /export/u);
    assert.match(await readFile(join(target, "README.md"), "utf8"), /Ubuntu 24\.04 x86-64/u);
    const metadata = JSON.parse(await readFile(join(target, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.profile, "frontend");
    assert.deepEqual(
      {
        templateCommit: metadata.templateCommit,
        templateVersion: metadata.templateVersion,
        templateTag: metadata.templateTag,
        createdBy: metadata.createdBy,
      },
      {
        templateCommit: TEMPLATE_COMMIT,
        templateVersion: createVireoVersion,
        templateTag: `starter-template@${createVireoVersion}`,
        createdBy: `create-vireo@${createVireoVersion}`,
      },
    );
    await assert.rejects(readFile(join(target, ".github/dependabot.yml")), /ENOENT/u);
    await assert.rejects(readFile(join(target, "scripts/verify.sh")), /ENOENT/u);
    await assert.rejects(readFile(join(target, ".vscode/settings.json")), /ENOENT/u);
    for (const path of [
      "playwright.demo.config.ts",
      "playwright.deployment.config.ts",
      "tests/demo/flagship-demo.spec.ts",
      "tests/deployment/smoke.spec.ts",
      "tests/e2e/login.spec.ts",
    ]) {
      await assert.rejects(readFile(join(target, path)), /ENOENT/u);
    }
    await assert.rejects(readFile(join(target, "settings.gradle")), /ENOENT/u);
    await assert.rejects(readFile(join(target, "src/main/java/App.java")), /ENOENT/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("uses a readable short PWA name and truncates a single long word deterministically", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-pwa-name-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "supercalifragilistic-app");
    await createVireo({ directory: target, profile: "frontend", git: false, templateDirectory: template });
    const identity = await readFile(join(target, "pwa-policy.mjs"), "utf8");
    assert.match(identity, /shortName: "Supercalifra"/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("uses the compact fallback when a short first word would waste the PWA name budget", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-pwa-name-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "my-supercalifragilistic-app");
    await createVireo({ directory: target, profile: "frontend", git: false, templateDirectory: template });
    const identity = await readFile(join(target, "pwa-policy.mjs"), "utf8");
    assert.match(identity, /shortName: "MySupercalif"/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fails closed when the pinned template does not provide the PWA identity baseline", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-pwa-test-"));
  try {
    const template = await fixture(root);
    await writeFile(join(template, "frontend/pwa-policy.mjs"), "export const APP_IDENTITY = Object.freeze({});\n");
    await assert.rejects(
      createVireo({ directory: join(root, "sample-app"), git: false, templateDirectory: template }),
      /Pinned Template PWA identity/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("supports the strict identity baseline used by historical pre-policy templates", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-legacy-pwa-test-"));
  try {
    const template = await fixture(root);
    await rm(join(template, "frontend/pwa-policy.mjs"));
    await writeFile(
      join(template, "frontend/vite.config.ts"),
      'const manifest = { name: "Vireo Starter App", short_name: "Vireo" };\n',
    );
    for (const locale of ["app.en.ts", "app.hr.ts"]) {
      await writeFile(
        join(template, "frontend/src/app/ui/localization/resources", locale),
        'export default { brand: { name: "Vireo Starter" } };\n',
      );
    }

    const target = join(root, "supercalifragilistic-legacy-app");
    await createVireo({ directory: target, git: false, templateDirectory: template });
    assert.match(
      await readFile(join(target, "frontend/vite.config.ts"), "utf8"),
      /name: "Supercalifragilistic Legacy App"/u,
    );
    assert.match(await readFile(join(target, "frontend/vite.config.ts"), "utf8"), /short_name: "Supercalifra"/u);
    for (const locale of ["app.en.ts", "app.hr.ts"]) {
      assert.match(
        await readFile(join(target, "frontend/src/app/ui/localization/resources", locale), "utf8"),
        /name: "Supercalifragilistic Legacy App"/u,
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fails closed when neither the current nor historical identity baseline exists", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-pwa-test-"));
  try {
    const template = await fixture(root);
    await rm(join(template, "frontend/pwa-policy.mjs"));
    await assert.rejects(
      createVireo({ directory: join(root, "sample-app"), git: false, templateDirectory: template }),
      /Legacy Template identity/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generator source uses the current PWA identity renderer and isolates historical substitutions", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  assert.match(source, /renderPwaIdentity\(join\(root, frontendDirectory, "pwa-policy\.mjs"\)/u);
  assert.match(source, /async function renderLegacyTemplateIdentity/u);
  assert.match(source, /await renderTemplateIdentity\(\s*staging,/u);
  assert.match(source, /await projectTemplate\(staging, profile, options\.templateDirectory !== undefined\)/u);
});

test("dry run validates without writing", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-test-"));
  try {
    const target = join(root, "dry-app");
    const result = await createVireo({ directory: target, dryRun: true });
    assert.equal(result.dryRun, true);
    await assert.rejects(readFile(target), /ENOENT/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects an inherited Vireo public route even during creation", async () => {
  const root = await mkdtemp(join(tmpdir(), "create-vireo-identity-test-"));
  try {
    await assert.rejects(
      createVireo({
        directory: join(root, "identity-app"),
        git: false,
        dryRun: true,
        repositoryUrl: "https://github.com/vireocodedev/vireo-template",
      }),
      /must not inherit a Vireo repository/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("remove-example is dry-run first, rejects drift, removes owned references, and is idempotent", async () => {
  const root = await mkdtemp(join(tmpdir(), "remove-vireo-example-test-"));
  try {
    const template = await fixture(root);
    const target = join(root, "sample-app");
    await createVireo({ directory: target, git: false, templateDirectory: template });
    const samplePath = join(target, "frontend/src/features/item/public.ts");

    const preview = await removeExample(target);
    assert.equal(preview.dryRun, true);
    assert.equal(preview.state, "present");
    assert.match(await readFile(samplePath, "utf8"), /Item/u);

    await writeFile(samplePath, "export type Item = { id: number; customized: true };\n");
    await assert.rejects(removeExample(target, true), /customized example file/u);
    await writeFile(samplePath, "export type Item = { id: number };\n");

    const unowned = join(target, "custom-item-note.md");
    await writeFile(unowned, "The Item integration is customized here.\n");
    await assert.rejects(removeExample(target, true), /unowned example references/u);
    await rm(unowned);

    const applied = await removeExample(target, true);
    assert.equal(applied.state, "present");
    assert.deepEqual(await findExampleReferences(target), []);
    await assert.rejects(readFile(samplePath), /ENOENT/u);
    assert.equal((await removeExample(target)).state, "removed");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
