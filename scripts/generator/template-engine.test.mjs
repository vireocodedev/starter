import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  createGenerationPlan,
  extractPlaceholders,
  renderStrictTemplate,
  writeGenerationPlan,
} from "./template-engine.mjs";
import { loadRegisteredTemplate } from "./template-registry.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("extracts and strictly renders flat placeholders", () => {
  assert.deepEqual(
    [...extractPlaceholders("{{componentName}} / {{ componentName }} / {{category}}")],
    ["componentName", "category"],
  );
  assert.equal(
    renderStrictTemplate("{{componentName}} in {{category}}", {
      componentName: "VireoBadge",
      category: "Data Display",
    }),
    "VireoBadge in Data Display",
  );
  assert.throws(() => renderStrictTemplate("{{missing}}", {}), /Missing template data "missing"/);
});

test("the registered React component template renders all eight component files", async () => {
  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const plan = await createGenerationPlan({
    config,
    output: "packages/ui/src/overlay",
    rawInputs: { name: "GeneratorExample" },
    repoRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  });

  assert.equal(plan.relativeOutputDirectory, "packages/ui/src/overlay/VireoGeneratorExample");
  assert.equal(plan.files.length, 8);
  assert.deepEqual(
    plan.files.map(file => file.relativeDestination),
    [
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.classes.ts",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.identity.ts",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.stories.tsx",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.styled.ts",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.test.tsx",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.tsx",
      "packages/ui/src/overlay/VireoGeneratorExample/VireoGeneratorExample.types.ts",
      "packages/ui/src/overlay/VireoGeneratorExample/index.ts",
    ],
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("VireoGeneratorExample.tsx")).contents,
    /VireoGeneratorExample/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("stories.tsx")).contents,
    /title: "Components\/Overlay\/VireoGeneratorExample"/,
  );
});

test("the React component template rejects prefixed and non-PascalCase names", async () => {
  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const common = {
    config,
    output: "packages/ui/src/overlay",
    repoRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  };

  await assert.rejects(createGenerationPlan({ ...common, rawInputs: { name: "VireoBadge" } }), /omit the Vireo prefix/);
  await assert.rejects(createGenerationPlan({ ...common, rawInputs: { name: "badge" } }), /PascalCase/);
});

test("writes a validated template through a staging directory without overwriting output", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-generator-test-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));

  const templateDirectory = join(temporaryRoot, "template");
  const outputBase = join(temporaryRoot, "output");
  await mkdir(join(templateDirectory, "files"), { recursive: true });
  await mkdir(outputBase, { recursive: true });
  await writeFile(join(templateDirectory, "files/message.txt.template"), "Hello {{name}}.\n", "utf8");

  const config = {
    id: "message",
    description: "Generate a test message.",
    primaryInput: "name",
    inputs: { name: { required: true } },
    allowedOutputRoots: ["output"],
    outputDirectory: "{{name}}",
    files: [{ source: "files/message.txt.template", destination: "{{name}}.txt", format: false }],
    prepareData(inputs) {
      return { name: inputs.name };
    },
  };

  const plan = await createGenerationPlan({
    config,
    output: "output",
    rawInputs: { name: "World" },
    repoRoot: temporaryRoot,
    templateDirectory,
  });
  await writeGenerationPlan(plan);

  assert.equal(await readFile(join(outputBase, "World/World.txt"), "utf8"), "Hello World.\n");
  await assert.rejects(
    createGenerationPlan({
      config,
      output: "output",
      rawInputs: { name: "World" },
      repoRoot: temporaryRoot,
      templateDirectory,
    }),
    /already exists/,
  );
});

test("rejects unknown input and missing prepared placeholder data", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-generator-validation-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));

  const templateDirectory = join(temporaryRoot, "template");
  await mkdir(join(templateDirectory, "files"), { recursive: true });
  await mkdir(join(temporaryRoot, "output"), { recursive: true });
  await writeFile(join(templateDirectory, "files/value.txt.template"), "{{requiredValue}}\n", "utf8");

  const config = {
    id: "strict",
    description: "Exercise strict validation.",
    primaryInput: "name",
    inputs: { name: { required: true } },
    allowedOutputRoots: ["output"],
    outputDirectory: "{{directory}}",
    files: [{ source: "files/value.txt.template", destination: "value.txt", format: false }],
    prepareData() {
      return { directory: "result" };
    },
  };

  const common = {
    config,
    output: "output",
    repoRoot: temporaryRoot,
    templateDirectory,
  };

  await assert.rejects(
    createGenerationPlan({ ...common, rawInputs: { name: "Value", typo: "unused" } }),
    /Unknown input: typo/,
  );
  await assert.rejects(
    createGenerationPlan({ ...common, rawInputs: { name: "Value" } }),
    /Missing template data:[\s\S]*requiredValue/,
  );
});
