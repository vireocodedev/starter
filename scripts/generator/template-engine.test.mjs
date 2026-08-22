import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  createGenerationPlan,
  extractPlaceholders,
  renderStrictTemplate,
  writeGenerationPlan,
} from "./template-engine.mjs";
import { loadRegisteredTemplate } from "./template-registry.mjs";

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

test("the registered React component template derives an architectural destination", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-component-generator-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));
  await mkdir(join(temporaryRoot, "packages/ui/src/core"), { recursive: true });
  await writeFile(join(temporaryRoot, "packages/ui/src/core/public.ts"), "export {};\n", "utf8");

  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const plan = await createGenerationPlan({
    config,
    rawInputs: { name: "GeneratorExample", owner: "core", category: "overlays" },
    repoRoot: temporaryRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  });

  assert.equal(plan.relativeOutputDirectory, "packages/ui/src/core/components/overlays/VireoGeneratorExample");
  assert.equal(plan.files.length, 11);
  assert.deepEqual(
    plan.files.map(file => file.relativeDestination),
    [
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.classes.ts",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.identity.ts",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.stories.tsx",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.styled.ts",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.test.tsx",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.tsx",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.types.ts",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/index.ts",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/internal/storybook/DefaultExample.tsx",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/internal/storybook/CustomizedSlotsExample.tsx",
      "packages/ui/src/core/components/overlays/VireoGeneratorExample/internal/storybook/ThemeCustomizationExample.tsx",
    ],
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("VireoGeneratorExample.tsx")).contents,
    /VireoGeneratorExample/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("stories.tsx")).contents,
    /title: "Core\/Overlays\/VireoGeneratorExample"/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("stories.tsx")).contents,
    /DefaultExample\.tsx\?raw/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("DefaultExample.tsx")).contents,
    /from "@\/core\/components\/overlays\/VireoGeneratorExample"/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("DefaultExample.tsx")).contents,
    /VireoStorybookProvider/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("VireoGeneratorExample.tsx")).contents,
    /from "@\/core\/utils\/muiutils"/,
  );

  await writeGenerationPlan(plan);
  assert.equal(
    await readFile(
      join(
        temporaryRoot,
        "packages/ui/src/core/components/overlays/VireoGeneratorExample/VireoGeneratorExample.identity.ts",
      ),
      "utf8",
    ).then(contents => contents.includes("VIREO_GENERATOR_EXAMPLE_NAME")),
    true,
  );
});

test("the React component template rejects invalid names, owners, categories, and output overrides", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-component-validation-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));
  await mkdir(join(temporaryRoot, "packages/ui/src/core"), { recursive: true });
  await writeFile(join(temporaryRoot, "packages/ui/src/core/public.ts"), "export {};\n", "utf8");

  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const common = {
    config,
    repoRoot: temporaryRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  };

  await assert.rejects(
    createGenerationPlan({
      ...common,
      rawInputs: { name: "VireoBadge", owner: "core", category: "data-display" },
    }),
    /omit the Vireo prefix/,
  );
  await assert.rejects(
    createGenerationPlan({ ...common, rawInputs: { name: "badge", owner: "core", category: "data-display" } }),
    /PascalCase/,
  );
  await assert.rejects(
    createGenerationPlan({ ...common, rawInputs: { name: "Badge", owner: "table", category: "data-display" } }),
    /Invalid input "owner"/,
  );
  await assert.rejects(
    createGenerationPlan({
      ...common,
      rawInputs: { name: "Badge", owner: "capabilities/table/components", category: "data-display" },
    }),
    /reserved structural folder/,
  );
  await assert.rejects(
    createGenerationPlan({ ...common, rawInputs: { name: "Badge", owner: "core", category: "utility" } }),
    /approved component category/,
  );
  await assert.rejects(
    createGenerationPlan({
      ...common,
      output: "packages/ui/src/core",
      rawInputs: { name: "Badge", owner: "core", category: "data-display" },
    }),
    /do not use --output/,
  );
});

test("the React component template supports one child-capability level and requires the parent public boundary", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-child-component-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));
  await mkdir(join(temporaryRoot, "packages/ui/src/capabilities/table/responsive-table"), { recursive: true });

  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const common = {
    config,
    rawInputs: {
      name: "ResponsiveHeader",
      owner: "capabilities/table/responsive-table",
      category: "data-display",
    },
    repoRoot: temporaryRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  };

  await assert.rejects(createGenerationPlan(common), /requires .*capabilities\/table\/public\.ts/);
  await writeFile(join(temporaryRoot, "packages/ui/src/capabilities/table/public.ts"), "export {};\n", "utf8");

  const plan = await createGenerationPlan(common);
  assert.equal(
    plan.relativeOutputDirectory,
    "packages/ui/src/capabilities/table/responsive-table/components/data-display/VireoResponsiveHeader",
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("VireoResponsiveHeader.tsx")).contents,
    /from "@\/core\/public"/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("stories.tsx")).contents,
    /title: "Capabilities\/Table\/Responsive Table\/VireoResponsiveHeader"/,
  );
});

test("the React component template supports an integration-owned public component", async t => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-integration-component-"));
  t.after(() => rm(temporaryRoot, { force: true, recursive: true }));
  await mkdir(join(temporaryRoot, "packages/ui/src/integrations/sonner"), { recursive: true });
  await writeFile(join(temporaryRoot, "packages/ui/src/integrations/sonner/public.ts"), "export {};\n", "utf8");

  const { config, templateDirectory } = await loadRegisteredTemplate("react-component");
  const plan = await createGenerationPlan({
    config,
    rawInputs: {
      name: "Toaster",
      owner: "integrations/sonner",
      category: "feedback",
      storybookCategory: "Integrations/Notifications · Sonner",
    },
    repoRoot: temporaryRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  });

  assert.equal(plan.relativeOutputDirectory, "packages/ui/src/integrations/sonner/components/feedback/VireoToaster");
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("VireoToaster.tsx")).contents,
    /from "@\/core\/public"/,
  );
  assert.match(
    plan.files.find(file => file.relativeDestination.endsWith("stories.tsx")).contents,
    /title: "Integrations\/Notifications · Sonner\/VireoToaster"/,
  );
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
