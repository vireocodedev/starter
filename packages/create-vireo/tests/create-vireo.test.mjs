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
  await writeFile(join(template, "frontend/vite.config.ts"), 'name: "Vireo Starter App", short_name: "Vireo"\n');
  await writeFile(join(template, "frontend/src/app/ui/localization/resources/app.en.ts"), 'name: "Vireo Starter"\n');
  await writeFile(join(template, "frontend/src/app/ui/localization/resources/app.hr.ts"), 'name: "Vireo Starter"\n');
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
    assert.match(await readFile(join(target, "frontend/vite.config.ts"), "utf8"), /name: "Sample App"/u);
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
    assert.match(await readFile(join(target, "vite.config.ts"), "utf8"), /name: "Operations Ui"/u);
    assert.match(await readFile(join(target, ".env.development"), "utf8"), /VITE_API_MODE=mock/u);
    const doctor = await readFile(join(target, "scripts/vireo-frontend-doctor.mjs"), "utf8");
    assert.match(doctor, /Frontend profile/u);
    assert.match(doctor, /VIR-VERIFY-001/u);
    assert.match(await readFile(join(target, "README.md"), "utf8"), /Ubuntu 24\.04 x86-64/u);
    const metadata = JSON.parse(await readFile(join(target, ".vireo/project.json"), "utf8"));
    assert.equal(metadata.profile, "frontend");
    await assert.rejects(readFile(join(target, "settings.gradle")), /ENOENT/u);
    await assert.rejects(readFile(join(target, "src/main/java/App.java")), /ENOENT/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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
