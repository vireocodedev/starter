import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

export const APPLICATION_PROJECTION_CATEGORIES = [
  "maintainer-only",
  "managed",
  "application-owned",
  "optional",
  "substitution-required",
  "historical",
];

const EXPECTED_DISPOSITIONS = new Map([
  ["maintainer-only", "exclude"],
  ["managed", "copy-managed"],
  ["application-owned", "copy-ejectable"],
  ["optional", "copy-when-selected"],
  ["substitution-required", "render"],
  ["historical", "exclude"],
]);
const IDENTITY_FIELDS = ["projectName", "displayName", "ownerName", "repositoryUrl", "supportUrl", "securityContact"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function validContractPath(path, prefix = false) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    !isAbsolute(path) &&
    !path.includes("\\") &&
    !path.split("/").includes("..") &&
    (!prefix || path.endsWith("/"))
  );
}

function matchingRules(contract, path, profile) {
  const matches = [];
  for (const rule of contract.rules ?? []) {
    if (!rule.profiles?.includes(profile)) continue;
    if (rule.paths?.includes(path)) matches.push({ rule, score: Number.MAX_SAFE_INTEGER });
    for (const prefix of rule.prefixes ?? []) {
      if (path.startsWith(prefix)) matches.push({ rule, score: prefix.length });
    }
  }
  return matches;
}

export function classifyProjectionPath(contract, path, profile) {
  if (!validContractPath(path)) throw new Error(`Invalid Template path: ${String(path)}`);
  if (!(contract.profiles ?? []).includes(profile)) throw new Error(`Unknown projection profile: ${String(profile)}`);
  const matches = matchingRules(contract, path, profile);
  if (matches.length === 0) return undefined;
  const score = Math.max(...matches.map(match => match.score));
  const best = matches.filter(match => match.score === score);
  if (new Set(best.map(match => match.rule.id)).size !== 1) {
    throw new Error(
      `Template path ${path} is ambiguously classified for ${profile}: ${best.map(match => match.rule.id).join(", ")}`,
    );
  }
  return {
    ruleId: best[0].rule.id,
    category: best[0].rule.category,
    disposition: contract.categories?.[best[0].rule.category]?.projectDisposition,
  };
}

export function validateApplicationProjectionContract(contract) {
  const problems = [];
  if (!isRecord(contract)) return ["contract must be a JSON object"];
  if (contract.schemaVersion !== 1) problems.push("schemaVersion must be 1");
  if (contract.contractId !== "vireo-application-projection")
    problems.push("contractId must be vireo-application-projection");

  if (!isRecord(contract.categories)) problems.push("categories must be an object");
  for (const category of APPLICATION_PROJECTION_CATEGORIES) {
    const definition = contract.categories?.[category];
    if (!isRecord(definition)) {
      problems.push(`missing category ${category}`);
      continue;
    }
    if (definition.projectDisposition !== EXPECTED_DISPOSITIONS.get(category)) {
      problems.push(`${category} must use disposition ${EXPECTED_DISPOSITIONS.get(category)}`);
    }
    if (typeof definition.description !== "string" || definition.description.trim().length === 0) {
      problems.push(`${category} must have a description`);
    }
  }
  for (const category of Object.keys(contract.categories ?? {})) {
    if (!APPLICATION_PROJECTION_CATEGORIES.includes(category)) problems.push(`unknown category ${category}`);
  }

  if (!Array.isArray(contract.profiles) || contract.profiles.length === 0)
    problems.push("profiles must be a non-empty array");
  else {
    if (duplicates(contract.profiles).length > 0) problems.push("profiles must be unique");
    for (const expected of ["full-stack", "frontend"]) {
      if (!contract.profiles.includes(expected)) problems.push(`profiles must include ${expected}`);
    }
  }

  const ruleIds = [];
  const selectors = new Map();
  if (!Array.isArray(contract.rules) || contract.rules.length === 0) problems.push("rules must be a non-empty array");
  for (const [index, rule] of (contract.rules ?? []).entries()) {
    const label = `rules[${index}]`;
    if (!isRecord(rule)) {
      problems.push(`${label} must be an object`);
      continue;
    }
    if (typeof rule.id !== "string" || rule.id.length === 0) problems.push(`${label} needs an id`);
    else ruleIds.push(rule.id);
    if (!APPLICATION_PROJECTION_CATEGORIES.includes(rule.category))
      problems.push(`${label} has unknown category ${String(rule.category)}`);
    if (!Array.isArray(rule.profiles) || rule.profiles.length === 0) problems.push(`${label} needs profiles`);
    for (const profile of rule.profiles ?? []) {
      if (!(contract.profiles ?? []).includes(profile))
        problems.push(`${label} has unknown profile ${String(profile)}`);
    }
    if (duplicates(rule.profiles ?? []).length > 0) problems.push(`${label} profiles must be unique`);
    if (!Array.isArray(rule.paths) || !Array.isArray(rule.prefixes)) {
      problems.push(`${label} paths and prefixes must be arrays`);
      continue;
    }
    if (rule.paths.length + rule.prefixes.length === 0) problems.push(`${label} has no selectors`);
    if (duplicates([...rule.paths, ...rule.prefixes]).length > 0) problems.push(`${label} selectors must be unique`);
    for (const [kind, values] of [
      ["path", rule.paths],
      ["prefix", rule.prefixes],
    ]) {
      for (const value of values) {
        if (!validContractPath(value, kind === "prefix")) {
          problems.push(`${label} has invalid ${kind} ${String(value)}`);
          continue;
        }
        for (const profile of rule.profiles ?? []) {
          const key = `${profile}:${kind}:${value}`;
          if (selectors.has(key)) problems.push(`${key} is declared by both ${selectors.get(key)} and ${rule.id}`);
          else selectors.set(key, rule.id);
        }
      }
    }
  }
  for (const id of duplicates(ruleIds)) problems.push(`duplicate rule id ${id}`);
  const defaultOptionalRuleIds = contract.defaultOptionalRuleIds ?? [];
  if (!Array.isArray(defaultOptionalRuleIds) || duplicates(defaultOptionalRuleIds).length > 0) {
    problems.push("defaultOptionalRuleIds must be a unique array");
  } else {
    for (const id of defaultOptionalRuleIds) {
      const rule = (contract.rules ?? []).find(candidate => candidate?.id === id);
      if (!rule || rule.category !== "optional") problems.push(`default optional rule ${String(id)} must be optional`);
    }
  }

  const identity = contract.identity;
  if (!isRecord(identity)) problems.push("identity must be an object");
  if (identity?.metadataPath !== ".vireo/project.json")
    problems.push("identity metadataPath must be .vireo/project.json");
  if (identity?.unresolvedMarkerPrefix !== "UNRESOLVED_VIREO_")
    problems.push("identity unresolvedMarkerPrefix must be UNRESOLVED_VIREO_");
  const fields = Array.isArray(identity?.fields) ? identity.fields : [];
  if (!Array.isArray(identity?.fields)) problems.push("identity fields must be an array");
  const fieldNames = fields.map(field => field?.name);
  for (const name of IDENTITY_FIELDS) {
    const field = fields.find(candidate => candidate?.name === name);
    if (!field) {
      problems.push(`identity field ${name} is required`);
      continue;
    }
    const expectedPhase = ["projectName", "displayName"].includes(name) ? "creation" : "release";
    if (field.requiredBy !== expectedPhase) problems.push(`${name} must be required by ${expectedPhase}`);
    if (
      expectedPhase === "release" &&
      field.unresolvedMarker !== `UNRESOLVED_VIREO_${name.replace(/([A-Z])/gu, "_$1").toUpperCase()}`
    ) {
      problems.push(`${name} must use its explicit unresolved marker`);
    }
  }
  for (const name of duplicates(fieldNames)) problems.push(`duplicate identity field ${String(name)}`);
  if (fieldNames.some(name => !IDENTITY_FIELDS.includes(name))) problems.push("identity declares an unknown field");
  const releaseRequirements = identity?.releaseRequirements;
  if (!isRecord(releaseRequirements)) problems.push("identity releaseRequirements must be an object");
  for (const flag of [
    "rejectUnresolvedMarkers",
    "requireApplicationOwner",
    "requireApplicationRepository",
    "requireDistinctSupportAndSecurityRoutes",
  ]) {
    if (releaseRequirements?.[flag] !== true) problems.push(`identity releaseRequirements.${flag} must be true`);
  }
  if (
    !Array.isArray(releaseRequirements?.forbiddenInheritedHosts) ||
    releaseRequirements.forbiddenInheritedHosts.length === 0
  ) {
    problems.push("identity must forbid inherited Vireo repository routes");
  }

  const assertions = contract.projectionAssertions;
  if (!isRecord(assertions)) problems.push("projectionAssertions must be an object");
  for (const flag of [
    "releaseBlockedWhileIdentityUnresolved",
    "unclassifiedPathsFail",
    "multiplyClassifiedPathsFail",
  ]) {
    if (assertions?.[flag] !== true) problems.push(`projectionAssertions.${flag} must be true`);
  }
  if (
    !Array.isArray(assertions?.excludedCategories) ||
    assertions.excludedCategories.length !== 2 ||
    !["maintainer-only", "historical"].every(category => assertions.excludedCategories.includes(category))
  ) {
    problems.push("projectionAssertions.excludedCategories must contain maintainer-only and historical");
  }

  if (!Array.isArray(contract.requiredClassifications) || contract.requiredClassifications.length === 0)
    problems.push("requiredClassifications must be a non-empty array");
  for (const fixture of contract.requiredClassifications ?? []) {
    try {
      const classification = classifyProjectionPath(contract, fixture.path, fixture.profile);
      if (!classification) problems.push(`${fixture.path} is unclassified for ${fixture.profile}`);
      else if (classification.category !== fixture.category)
        problems.push(
          `${fixture.path} must be ${fixture.category} for ${fixture.profile}, got ${classification.category}`,
        );
    } catch (error) {
      problems.push(error.message);
    }
  }
  return problems;
}

function matchesFormat(format, value) {
  if (format === "kebab-case") return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(value);
  if (format === "non-empty") return value.trim().length > 0;
  if (format === "https-url") return /^https:\/\/[^\s]+$/u.test(value);
  if (format === "https-or-mailto-url") return /^(?:https:\/\/[^\s]+|mailto:[^@\s]+@[^@\s]+)$/u.test(value);
  return false;
}

function normalizedReleaseRouteIdentity(value) {
  if (typeof value !== "string") return undefined;
  if (/^mailto:[^@\s]+@[^@\s]+$/u.test(value)) return `mailto:${value.slice("mailto:".length).toLowerCase()}`;
  if (!/^https:\/\/[^\s]+$/u.test(value)) return undefined;
  try {
    const route = new URL(value);
    if (route.protocol !== "https:") return undefined;
    const pathname =
      route.pathname.length > 1 && route.pathname.endsWith("/") ? route.pathname.slice(0, -1) : route.pathname;
    return `${route.protocol}//${route.host}${pathname}${route.search}${route.hash}`;
  } catch {
    return undefined;
  }
}

export function validateApplicationIdentity(contract, values, phase = "release") {
  const problems = [];
  if (!isRecord(values)) return ["application identity must be an object"];
  if (!["creation", "release"].includes(phase)) return [`unknown identity validation phase ${String(phase)}`];
  for (const field of contract.identity?.fields ?? []) {
    const value = values[field.name];
    const required = field.requiredBy === "creation" || phase === "release";
    if (typeof value !== "string" || value.length === 0) {
      if (required) problems.push(`${field.name} is required by ${field.requiredBy}`);
      continue;
    }
    if (value.startsWith(contract.identity.unresolvedMarkerPrefix)) {
      if (value !== field.unresolvedMarker) problems.push(`${field.name} must use its explicit unresolved marker`);
      else if (phase === "release" || field.requiredBy === "creation") problems.push(`${field.name} is unresolved`);
      continue;
    }
    if (!matchesFormat(field.format, value)) problems.push(`${field.name} must use ${field.format} format`);
  }
  if (phase === "release") {
    for (const field of ["repositoryUrl", "supportUrl", "securityContact"]) {
      const route = String(values[field] ?? "").toLowerCase();
      for (const inherited of contract.identity.releaseRequirements.forbiddenInheritedHosts ?? []) {
        if (route.includes(inherited.toLowerCase())) {
          problems.push(`${field} must not inherit a Vireo repository, support, or security route`);
        }
      }
    }
    const supportRoute = normalizedReleaseRouteIdentity(values.supportUrl);
    const securityRoute = normalizedReleaseRouteIdentity(values.securityContact);
    if (supportRoute !== undefined && supportRoute === securityRoute) {
      problems.push("supportUrl and securityContact must be distinct release routes");
    }
  }
  return problems;
}

export function readApplicationProjectionContract(path) {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}
