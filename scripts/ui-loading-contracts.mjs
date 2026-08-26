import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const uiRoot = resolve(repoRoot, "packages/ui");
const srcRoot = resolve(uiRoot, "src");
const registryPath = resolve(uiRoot, "loading-state-contracts.json");
const categories = new Set(["content-preserving", "skeleton-capable", "busy-action", "boundary"]);
const geometryLevels = new Set(["A", "B", "C"]);
const canonicalStories = ["Loaded", "Loading", "Refreshing", "Empty", "Error", "AlignmentContract"];
const asyncPropPattern = /\b(?:loading|isLoading|isPending|loadingVisible|skeleton)\??\s*:/u;

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function fail(message) {
  throw new Error(`Invalid UI loading-state contracts: ${message}`);
}

export function validateLoadingStateContracts(path = registryPath) {
  const registry = JSON.parse(readFileSync(path, "utf8"));
  if (registry.version !== 1 || !Array.isArray(registry.contracts)) fail("expected version 1 and a contracts array");

  const seen = new Set();
  const registered = new Set();
  let previousComponent = "";

  for (const [index, contract] of registry.contracts.entries()) {
    const label = `contracts[${index}]`;
    const keys = Object.keys(contract).sort();
    const expectedKeys = ["categories", "component", "geometry", "omittedStates", "requiredStories"];
    if (keys.join("|") !== expectedKeys.join("|")) fail(`${label} must contain exactly ${expectedKeys.join(", ")}`);
    if (
      typeof contract.component !== "string" ||
      !/^(?:core|capabilities|integrations)\/.+\/Vireo[A-Za-z0-9]+$/u.test(contract.component)
    ) {
      fail(`${label}.component must identify a Vireo component module without a file extension`);
    }
    if (contract.component <= previousComponent) fail("contracts must be sorted by component path with no duplicates");
    previousComponent = contract.component;
    if (!Array.isArray(contract.categories) || contract.categories.length === 0)
      fail(`${label}.categories must be non-empty`);
    for (const category of contract.categories)
      if (!categories.has(category)) fail(`${label} has unknown category ${category}`);
    if (!geometryLevels.has(contract.geometry)) fail(`${label}.geometry must be A, B, or C`);
    if (!Array.isArray(contract.requiredStories)) fail(`${label}.requiredStories must be an array`);
    if (
      !contract.omittedStates ||
      typeof contract.omittedStates !== "object" ||
      Array.isArray(contract.omittedStates)
    ) {
      fail(`${label}.omittedStates must be an object`);
    }

    const componentPath = resolve(srcRoot, contract.component);
    const storyPath = `${componentPath}.stories.tsx`;
    const typePath = `${componentPath}.types.ts`;
    if (!existsSync(storyPath) || !existsSync(typePath))
      fail(`${label} references a missing component story or type file`);
    const storySource = readFileSync(storyPath, "utf8");
    const required = new Set(contract.requiredStories);
    for (const story of canonicalStories) {
      const omission = contract.omittedStates[story];
      if (required.has(story) === (typeof omission === "string" && omission.trim() !== "")) {
        fail(`${label} must either require or explain omission of ${story}, exclusively`);
      }
      if (required.has(story) && !new RegExp(`export\\s+const\\s+${story}\\b`, "u").test(storySource)) {
        fail(`${label} requires missing canonical story ${story}`);
      }
    }
    if (Object.keys(contract.omittedStates).some(story => !canonicalStories.includes(story))) {
      fail(`${label}.omittedStates contains a non-canonical story name`);
    }
    if (seen.has(contract.component)) fail(`duplicate contract for ${contract.component}`);
    seen.add(contract.component);
    registered.add(contract.component);
  }

  const discoveredAsyncComponents = walk(srcRoot)
    .filter(path => /\/Vireo[^/]+\.types\.ts$/u.test(path))
    .filter(path => asyncPropPattern.test(readFileSync(path, "utf8")))
    .map(path => toPosix(relative(srcRoot, path)).replace(/\.types\.ts$/u, ""));
  for (const component of discoveredAsyncComponents) {
    if (!registered.has(component)) fail(`async-capable public component is not classified: ${component}`);
  }

  return { contractCount: registry.contracts.length, discoveredAsyncCount: discoveredAsyncComponents.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateLoadingStateContracts();
  console.log(
    `UI loading-state contracts are valid (${result.contractCount} declared, ${result.discoveredAsyncCount} detected by public props).`,
  );
}
