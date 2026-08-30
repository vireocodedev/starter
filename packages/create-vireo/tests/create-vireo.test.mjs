import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createVireo, findExampleReferences, removeExample, TEMPLATE_COMMIT } from "../dist/index.js";

async function fixture(root) {
  const template = join(root, "template");
  await mkdir(join(template, ".vireo"), { recursive: true });
  await mkdir(join(template, "src/main/java/com/vireocode/startertemplate"), { recursive: true });
  await writeFile(join(template, ".vireo/template.json"), "{}\n");
  await writeFile(join(template, "settings.gradle"), "rootProject.name = 'starter-template'\n");
  await writeFile(join(template, "README.md"), "# Vireo Starter Template\n");
  await writeFile(
    join(template, "package.json"),
    JSON.stringify({ name: "starter-template", scripts: { vireo: "npx --yes --package=create-vireo@0.3.0 vireo" } }),
  );
  await mkdir(join(template, "frontend/src/app/ui/localization/resources"), { recursive: true });
  await mkdir(join(template, "frontend/public/icons"), { recursive: true });
  await mkdir(join(template, "frontend/tests/pwa"), { recursive: true });
  await mkdir(join(template, "frontend/scripts"), { recursive: true });
  await mkdir(join(template, "frontend/docs/architecture"), { recursive: true });
  await writeFile(
    join(template, "frontend/package.json"),
    JSON.stringify({
      name: "starter-template-frontend",
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
        preview: "vite preview",
      },
      dependencies: { "@vireocodedev/ui": "^0.2.2" },
    }),
  );
  await writeFile(
    join(template, "frontend/package-lock.json"),
    JSON.stringify({
      name: "starter-template-frontend",
      lockfileVersion: 3,
      packages: { "": { name: "starter-template-frontend" } },
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
  await writeFile(join(template, "frontend/tests/pwa/production-pwa.spec.ts"), "export {};\n");
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
    assert.equal(await readFile(join(target, "README.md"), "utf8"), "# Sample App\n");
    const identity = await readFile(join(target, "frontend/pwa-policy.mjs"), "utf8");
    assert.match(identity, /id: "\/sample-app"/u);
    assert.match(identity, /name: "Sample App"/u);
    assert.match(identity, /shortName: "Sample App"/u);
    assert.match(identity, /description: "Sample App is a production-oriented application\."/u);
    assert.doesNotMatch(identity, /Vireo Starter/u);
    assert.match(await readFile(join(target, "package.json"), "utf8"), /create-vireo@0\.5\.0/u);
    assert.match(
      await readFile(join(target, "src/main/java/dev/example/sample/App.java"), "utf8"),
      /package dev\.example\.sample/u,
    );
    const metadata = JSON.parse(await readFile(join(target, ".vireo/project.json"), "utf8"));
    assert.deepEqual(
      { projectName: metadata.projectName, javaPackage: metadata.javaPackage, database: metadata.database },
      { projectName: "sample-app", javaPackage: "dev.example.sample", database: "h2" },
    );
  } finally {
    await rm(root, { recursive: true, force: true });
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
    const environment = await readFile(join(target, ".env.development"), "utf8");
    assert.match(environment, /VITE_API_MODE=mock/u);
    assert.doesNotMatch(environment, /VITE_APP_NAME/u);
    assert.match(await readFile(join(target, ".gitignore"), "utf8"), /^\.pwa-update-fixture\/$/mu);
    assert.match(await readFile(join(target, ".gitignore"), "utf8"), /^!\.env\.development$/mu);
    const packageJson = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
    for (const script of ["pwa:check:source", "pwa:check:built", "pretest:pwa", "test:pwa"]) {
      assert.equal(typeof packageJson.scripts[script], "string", `${script} is retained`);
    }
    const verify = await readFile(join(target, "scripts/verify-frontend-profile.sh"), "utf8");
    assert.match(verify, /pwa:check:source[\s\S]*Application build[\s\S]*pwa:check:built/u);
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
  assert.match(source, /renderPwaIdentity\(join\(root, "frontend", "pwa-policy\.mjs"\)/u);
  assert.match(source, /async function renderLegacyTemplateIdentity/u);
  assert.match(source, /await renderTemplateIdentity\(staging,/u);
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
