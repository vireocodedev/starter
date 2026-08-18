import { access, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const PLACEHOLDER_PATTERN = /{{\s*([A-Za-z][A-Za-z0-9]*)\s*}}/g;

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function isPathInside(parentPath, candidatePath) {
  const relativePath = relative(parentPath, candidatePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function extractPlaceholders(value) {
  const placeholders = new Set();

  for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
    placeholders.add(match[1]);
  }

  return placeholders;
}

export function renderStrictTemplate(value, data, sourceLabel = "template") {
  return value.replace(PLACEHOLDER_PATTERN, (_match, key) => {
    const replacement = data[key];

    if (replacement === undefined || replacement === null) {
      throw new Error(`Missing template data "${key}" required by ${sourceLabel}.`);
    }

    if (!["string", "number", "boolean"].includes(typeof replacement)) {
      throw new Error(`Template data "${key}" used by ${sourceLabel} must be a string, number, or boolean.`);
    }

    return String(replacement);
  });
}

export function validateTemplateDefinition(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Template configuration must export an object.");
  }

  assertNonEmptyString(config.id, "Template id");
  assertNonEmptyString(config.description, `Template "${config.id}" description`);
  assertNonEmptyString(config.primaryInput, `Template "${config.id}" primaryInput`);
  assertNonEmptyString(config.outputDirectory, `Template "${config.id}" outputDirectory`);

  if (!config.inputs || typeof config.inputs !== "object" || Array.isArray(config.inputs)) {
    throw new Error(`Template "${config.id}" inputs must be an object.`);
  }

  if (!(config.primaryInput in config.inputs)) {
    throw new Error(`Template "${config.id}" primary input "${config.primaryInput}" is not declared in inputs.`);
  }

  if (!Array.isArray(config.allowedOutputRoots) || config.allowedOutputRoots.length === 0) {
    throw new Error(`Template "${config.id}" must declare at least one allowed output root.`);
  }

  for (const outputRoot of config.allowedOutputRoots) {
    assertNonEmptyString(outputRoot, `Template "${config.id}" allowed output root`);
  }

  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error(`Template "${config.id}" must declare at least one file.`);
  }

  for (const [index, file] of config.files.entries()) {
    if (!file || typeof file !== "object") {
      throw new Error(`Template "${config.id}" file ${index + 1} must be an object.`);
    }

    assertNonEmptyString(file.source, `Template "${config.id}" file ${index + 1} source`);
    assertNonEmptyString(file.destination, `Template "${config.id}" file ${index + 1} destination`);
  }

  if (typeof config.prepareData !== "function") {
    throw new Error(`Template "${config.id}" must provide prepareData(inputs, context).`);
  }

  return config;
}

function validateRawInputs(config, rawInputs) {
  const declaredInputNames = new Set(Object.keys(config.inputs));
  const unknownInputs = Object.keys(rawInputs).filter(key => !declaredInputNames.has(key));

  if (unknownInputs.length > 0) {
    throw new Error(`Unknown input${unknownInputs.length === 1 ? "" : "s"}: ${unknownInputs.join(", ")}.`);
  }

  for (const [inputName, definition] of Object.entries(config.inputs)) {
    const value = rawInputs[inputName];

    if (definition.required && (value === undefined || value === "")) {
      throw new Error(`Missing required input "${inputName}".`);
    }

    if (value !== undefined && typeof definition.validate === "function") {
      const error = definition.validate(value);
      if (typeof error === "string" && error !== "") {
        throw new Error(`Invalid input "${inputName}": ${error}`);
      }
    }
  }
}

function validateRenderData(data, placeholderUsage) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("prepareData must return a plain render-data object.");
  }

  const placeholderNames = new Set(placeholderUsage.keys());
  const missing = [...placeholderNames].filter(key => data[key] === undefined || data[key] === null);

  if (missing.length > 0) {
    const details = missing
      .map(
        key =>
          `- ${key}\n${placeholderUsage
            .get(key)
            .map(usage => `  - ${usage}`)
            .join("\n")}`,
      )
      .join("\n");
    throw new Error(`Missing template data:\n${details}`);
  }

  const unused = Object.keys(data).filter(key => !placeholderNames.has(key));
  if (unused.length > 0) {
    throw new Error(`Unused prepared template data: ${unused.join(", ")}.`);
  }
}

function collectPlaceholderUsage(config, sources) {
  const usage = new Map();

  const addUsage = (value, label) => {
    for (const key of extractPlaceholders(value)) {
      const entries = usage.get(key) ?? [];
      entries.push(label);
      usage.set(key, entries);
    }
  };

  addUsage(config.outputDirectory, "output directory");

  for (const file of config.files) {
    addUsage(file.destination, `destination for ${file.source}`);
    addUsage(sources.get(file.source), file.source);
  }

  return usage;
}

function validateOutputBase(config, repoRoot, outputArgument) {
  assertNonEmptyString(outputArgument, "Output path");

  if (isAbsolute(outputArgument)) {
    throw new Error("Output path must be relative to the repository root.");
  }

  const outputBase = resolve(repoRoot, outputArgument);
  const allowedRoots = config.allowedOutputRoots.map(outputRoot => resolve(repoRoot, outputRoot));

  if (!allowedRoots.some(outputRoot => isPathInside(outputRoot, outputBase))) {
    throw new Error(
      `Output path "${outputArgument}" is outside the allowed roots: ${config.allowedOutputRoots.join(", ")}.`,
    );
  }

  return outputBase;
}

async function readTemplateSources(config, templateDirectory) {
  const sources = new Map();

  for (const file of config.files) {
    const sourcePath = resolve(templateDirectory, file.source);
    if (!isPathInside(templateDirectory, sourcePath)) {
      throw new Error(`Template source "${file.source}" escapes its template directory.`);
    }

    sources.set(file.source, await readFile(sourcePath, "utf8"));
  }

  return sources;
}

export async function createGenerationPlan({ config, output, rawInputs, repoRoot, templateDirectory }) {
  validateTemplateDefinition(config);
  validateRawInputs(config, rawInputs);

  const outputBase = validateOutputBase(config, repoRoot, output);
  const outputStats = await stat(outputBase).catch(() => undefined);
  if (!outputStats?.isDirectory()) {
    throw new Error(`Output base "${relative(repoRoot, outputBase)}" must already exist and be a directory.`);
  }

  const sources = await readTemplateSources(config, templateDirectory);
  const placeholderUsage = collectPlaceholderUsage(config, sources);
  const data = await config.prepareData(Object.freeze({ ...rawInputs }), {
    outputBase,
    outputBaseName: basename(outputBase),
    repoRoot,
  });
  validateRenderData(data, placeholderUsage);

  const renderedOutputDirectory = renderStrictTemplate(config.outputDirectory, data, "output directory");
  const outputDirectory = resolve(outputBase, renderedOutputDirectory);
  if (!isPathInside(outputBase, outputDirectory) || outputDirectory === outputBase) {
    throw new Error(`Rendered output directory "${renderedOutputDirectory}" must be a child of the output base.`);
  }

  if (await pathExists(outputDirectory)) {
    throw new Error(`Output directory already exists: ${relative(repoRoot, outputDirectory)}.`);
  }

  const prettierConfig = (await resolveConfig(join(repoRoot, "package.json"))) ?? {};
  const destinations = new Set();
  const files = [];

  for (const file of config.files) {
    const renderedDestination = renderStrictTemplate(file.destination, data, `destination for ${file.source}`);
    const destinationPath = resolve(outputDirectory, renderedDestination);
    if (!isPathInside(outputDirectory, destinationPath) || destinationPath === outputDirectory) {
      throw new Error(`Rendered destination "${renderedDestination}" escapes the generated output directory.`);
    }

    if (destinations.has(destinationPath)) {
      throw new Error(`Multiple templates render to ${relative(repoRoot, destinationPath)}.`);
    }
    destinations.add(destinationPath);

    let contents = renderStrictTemplate(sources.get(file.source), data, file.source);
    if (file.format !== false) {
      contents = await format(contents, { ...prettierConfig, filepath: destinationPath });
    }

    files.push({
      source: file.source,
      destination: destinationPath,
      relativeDestination: relative(repoRoot, destinationPath),
      contents,
    });
  }

  return {
    config,
    data: Object.freeze({ ...data }),
    outputBase,
    outputDirectory,
    relativeOutputDirectory: relative(repoRoot, outputDirectory),
    files,
  };
}

export async function writeGenerationPlan(plan) {
  const stagingDirectory = await mkdtemp(join(plan.outputBase, ".vireo-generate-"));

  try {
    for (const file of plan.files) {
      const relativeDestination = relative(plan.outputDirectory, file.destination);
      const stagingDestination = resolve(stagingDirectory, relativeDestination);
      if (!isPathInside(stagingDirectory, stagingDestination)) {
        throw new Error(`Staging destination escaped its temporary directory: ${relativeDestination}.`);
      }

      await mkdir(dirname(stagingDestination), { recursive: true });
      await writeFile(stagingDestination, file.contents, { encoding: "utf8", flag: "wx" });
    }

    await rename(stagingDirectory, plan.outputDirectory);
  } catch (error) {
    await rm(stagingDirectory, { force: true, recursive: true });
    throw error;
  }

  return plan;
}
