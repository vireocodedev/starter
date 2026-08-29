import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, isAbsolute, join } from "node:path";

export const DOCUMENTATION_OWNERSHIP_CATEGORIES = [
  "canonical",
  "generated",
  "exact-version",
  "historical",
  "application-owned",
];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function validPath(path, prefix = false) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    !isAbsolute(path) &&
    !path.includes("\\") &&
    !path.split("/").includes("..") &&
    (!prefix || path.endsWith("/"))
  );
}

function matchingRules(contract, repository, path) {
  const matches = [];
  for (const rule of contract.rules ?? []) {
    if (rule.repository !== repository) continue;
    if (rule.paths?.includes(path)) matches.push({ rule, score: Number.MAX_SAFE_INTEGER });
    for (const prefix of rule.prefixes ?? []) {
      if (path.startsWith(prefix)) matches.push({ rule, score: prefix.length });
    }
  }
  return matches;
}

export function classifyDocumentationPath(contract, repository, path) {
  if (typeof repository !== "string" || repository.length === 0)
    throw new Error("documentation repository is required");
  if (!validPath(path)) throw new Error(`invalid documentation path ${String(path)}`);
  const matches = matchingRules(contract, repository, path);
  if (matches.length === 0) return undefined;
  const score = Math.max(...matches.map(match => match.score));
  const best = matches.filter(match => match.score === score);
  if (new Set(best.map(match => match.rule.id)).size !== 1) {
    throw new Error(
      `${repository}:${path} has conflicting ownership rules: ${best.map(match => match.rule.id).join(", ")}`,
    );
  }
  return { ruleId: best[0].rule.id, category: best[0].rule.category };
}

function normalizeTitle(title) {
  return title
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .replace(/[`*_@]/gu, "")
    .replace(/[^a-z0-9]+/gu, " ")
    .trim();
}

export function markdownTitle(contents) {
  const match = contents.match(/^#\s+(.+?)\s*$/mu);
  return match?.[1]?.trim();
}

export function collectCheckedInDocumentation(root, contract) {
  const inventory = contract.inventory;
  const documents = [];
  const seen = new Set();
  const ignored = new Set(inventory.ignoredDirectoryNames ?? []);
  const extensions = new Set(inventory.extensions ?? []);

  const add = path => {
    if (seen.has(path) || !existsSync(join(root, path)) || !statSync(join(root, path)).isFile()) return;
    if (!extensions.has(extname(path))) return;
    seen.add(path);
    const contents = readFileSync(join(root, path), "utf8");
    documents.push({ repository: inventory.repository, path, title: markdownTitle(contents) });
  };
  const walk = prefix => {
    const directory = join(root, prefix);
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${prefix}${entry.name}`;
      if (entry.isDirectory() && !ignored.has(entry.name)) walk(`${path}/`);
      else if (entry.isFile()) add(path);
    }
  };

  for (const path of inventory.paths ?? []) add(path);
  for (const prefix of inventory.roots ?? []) walk(prefix);
  return documents.sort((left, right) => left.path.localeCompare(right.path));
}

export function validateDocumentationInventory(contract, documents) {
  const problems = [];
  const classified = [];
  for (const document of documents) {
    try {
      const ownership = classifyDocumentationPath(contract, document.repository, document.path);
      if (!ownership) {
        problems.push(`${document.repository}:${document.path} is unclassified`);
        continue;
      }
      if (!document.title && [".md", ".mdx"].includes(extname(document.path))) {
        problems.push(`${document.repository}:${document.path} has no level-one title`);
      }
      classified.push({ ...document, ...ownership, normalizedTitle: normalizeTitle(document.title ?? "") });
    } catch (error) {
      problems.push(error.message);
    }
  }

  const resolutions = new Map(
    (contract.duplicateTitleResolutions ?? []).map(resolution => [resolution.normalizedTitle, resolution]),
  );
  const titleGroups = Map.groupBy(
    classified.filter(document => document.normalizedTitle),
    document => document.normalizedTitle,
  );
  for (const [title, group] of titleGroups) {
    if (group.length < 2 || new Set(group.map(document => document.category)).size < 2) continue;
    const resolution = resolutions.get(title);
    const paths = group.map(document => document.path).sort();
    const resolvedPaths = [...(resolution?.paths ?? [])].sort();
    if (!resolution || JSON.stringify(paths) !== JSON.stringify(resolvedPaths)) {
      problems.push(`duplicate title ${JSON.stringify(title)} has conflicting ownership: ${paths.join(", ")}`);
      continue;
    }
    if (!paths.includes(resolution.canonicalPath)) {
      problems.push(`duplicate title ${JSON.stringify(title)} resolution has no canonical path in its path set`);
    } else {
      const canonical = group.find(document => document.path === resolution.canonicalPath);
      if (canonical?.category !== "canonical") {
        problems.push(`duplicate title ${JSON.stringify(title)} canonical path must have canonical ownership`);
      }
    }
  }
  for (const resolution of contract.duplicateTitleResolutions ?? []) {
    const group = titleGroups.get(resolution.normalizedTitle) ?? [];
    if (group.length < 2 || new Set(group.map(document => document.category)).size < 2) {
      problems.push(`duplicate title resolution ${JSON.stringify(resolution.normalizedTitle)} is stale`);
    }
  }
  return problems;
}

export function validateDocumentationOwnershipContract(contract) {
  const problems = [];
  if (!isRecord(contract)) return ["documentation ownership contract must be an object"];
  if (contract.schemaVersion !== 1) problems.push("schemaVersion must be 1");
  if (contract.contractId !== "vireo-documentation-ownership") {
    problems.push("contractId must be vireo-documentation-ownership");
  }
  if (contract.releasePolicy !== "contracts/documentation-release-policy.json") {
    problems.push("releasePolicy must reference the canonical documentation release policy");
  }
  for (const category of DOCUMENTATION_OWNERSHIP_CATEGORIES) {
    const definition = contract.categories?.[category];
    if (!isRecord(definition)) {
      problems.push(`missing documentation category ${category}`);
      continue;
    }
    for (const field of ["owner", "freshness", "purpose"]) {
      if (typeof definition[field] !== "string" || definition[field].trim().length === 0) {
        problems.push(`${category} must declare ${field}`);
      }
    }
  }
  for (const category of Object.keys(contract.categories ?? {})) {
    if (!DOCUMENTATION_OWNERSHIP_CATEGORIES.includes(category))
      problems.push(`unknown documentation category ${category}`);
  }

  const inventory = contract.inventory;
  if (!isRecord(inventory) || inventory.repository !== "starter") problems.push("inventory must describe starter");
  if (!Array.isArray(inventory?.extensions) || ![".md", ".mdx"].every(value => inventory.extensions.includes(value))) {
    problems.push("inventory must include Markdown and MDX extensions");
  }
  for (const prefix of inventory?.roots ?? []) {
    if (!validPath(prefix, true)) problems.push(`invalid documentation inventory root ${String(prefix)}`);
  }
  for (const path of inventory?.paths ?? []) {
    if (!validPath(path)) problems.push(`invalid documentation inventory path ${String(path)}`);
  }

  const ruleIds = [];
  const selectorOwners = new Map();
  const usedCategories = new Set();
  for (const [index, rule] of (contract.rules ?? []).entries()) {
    const label = `rules[${index}]`;
    if (!isRecord(rule)) {
      problems.push(`${label} must be an object`);
      continue;
    }
    ruleIds.push(rule.id);
    usedCategories.add(rule.category);
    if (typeof rule.id !== "string" || rule.id.length === 0) problems.push(`${label} needs an id`);
    if (typeof rule.repository !== "string" || rule.repository.length === 0)
      problems.push(`${label} needs a repository`);
    if (!DOCUMENTATION_OWNERSHIP_CATEGORIES.includes(rule.category)) problems.push(`${label} has unknown category`);
    if (!Array.isArray(rule.paths) || !Array.isArray(rule.prefixes) || rule.paths.length + rule.prefixes.length === 0) {
      problems.push(`${label} must have path selectors`);
      continue;
    }
    for (const [kind, values] of [
      ["path", rule.paths],
      ["prefix", rule.prefixes],
    ]) {
      for (const value of values) {
        if (!validPath(value, kind === "prefix")) problems.push(`${label} has invalid ${kind} ${String(value)}`);
        const selector = `${rule.repository}:${kind}:${value}`;
        if (selectorOwners.has(selector)) {
          problems.push(`${selector} is owned by both ${selectorOwners.get(selector)} and ${rule.id}`);
        } else selectorOwners.set(selector, rule.id);
      }
    }
  }
  for (const id of duplicates(ruleIds)) problems.push(`duplicate documentation rule id ${String(id)}`);
  for (const category of DOCUMENTATION_OWNERSHIP_CATEGORIES) {
    if (!usedCategories.has(category)) problems.push(`documentation category ${category} has no ownership rule`);
  }

  const resolutionTitles = (contract.duplicateTitleResolutions ?? []).map(value => value.normalizedTitle);
  for (const title of duplicates(resolutionTitles))
    problems.push(`duplicate title resolution ${title} is declared twice`);
  for (const resolution of contract.duplicateTitleResolutions ?? []) {
    if (!/^[a-z0-9]+(?: [a-z0-9]+)*$/u.test(resolution.normalizedTitle ?? "")) {
      problems.push(`invalid normalized duplicate title ${String(resolution.normalizedTitle)}`);
    }
    if (
      !Array.isArray(resolution.paths) ||
      resolution.paths.length < 2 ||
      !resolution.paths.includes(resolution.canonicalPath)
    ) {
      problems.push(
        `duplicate title resolution ${resolution.normalizedTitle} must identify its canonical path and duplicates`,
      );
    }
    if (typeof resolution.purpose !== "string" || resolution.purpose.trim().length === 0) {
      problems.push(`duplicate title resolution ${resolution.normalizedTitle} needs a purpose`);
    }
  }

  for (const assertion of [
    "unclassifiedDocumentsFail",
    "ambiguousOwnershipFails",
    "conflictingDuplicateTitlesFail",
    "staleDuplicateResolutionsFail",
  ]) {
    if (contract.assertions?.[assertion] !== true) problems.push(`assertions.${assertion} must be true`);
  }

  for (const declared of contract.declaredExternalDocuments ?? []) {
    try {
      const ownership = classifyDocumentationPath(contract, declared.repository, declared.path);
      if (!ownership) problems.push(`${declared.repository}:${declared.path} is unclassified`);
      else if (ownership.category !== declared.category) {
        problems.push(`${declared.repository}:${declared.path} must be ${declared.category}`);
      }
    } catch (error) {
      problems.push(error.message);
    }
  }
  return problems;
}

export function checkCheckedInDocumentationOwnership(root, contract) {
  const documents = collectCheckedInDocumentation(root, contract);
  return {
    documents,
    problems: [
      ...validateDocumentationOwnershipContract(contract),
      ...validateDocumentationInventory(contract, documents),
    ],
  };
}
