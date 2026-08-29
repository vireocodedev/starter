import { posix } from "node:path";

const classificationRank = new Map([
  ["allowed", 0],
  ["review", 1],
  ["denied", 2],
  ["unknown", 3],
]);

const uniqueSorted = values => [...new Set(values)].sort((left, right) => left.localeCompare(right));

function mergeResults(operator, left, right) {
  const leftRank = classificationRank.get(left.classification);
  const rightRank = classificationRank.get(right.classification);
  const selected = operator === "OR" ? Math.min(leftRank, rightRank) : Math.max(leftRank, rightRank);
  const selectedResults = [left, right].filter(result => classificationRank.get(result.classification) === selected);
  return {
    classification: [...classificationRank].find(([, rank]) => rank === selected)?.[0] ?? "unknown",
    obligations: uniqueSorted(selectedResults.flatMap(result => result.obligations)),
    identifiers: uniqueSorted(selectedResults.flatMap(result => result.identifiers)),
  };
}

function tokenize(expression) {
  const tokens = [];
  let offset = 0;
  const tokenPattern = /\s*(\(|\)|AND\b|OR\b|WITH\b|[A-Za-z0-9.+-]+)\s*/guy;
  while (offset < expression.length) {
    tokenPattern.lastIndex = offset;
    const match = tokenPattern.exec(expression);
    if (!match || match.index !== offset) return undefined;
    tokens.push(match[1]);
    offset = tokenPattern.lastIndex;
  }
  return tokens;
}

function classifyIdentifier(identifier, licenseById) {
  const policy = licenseById.get(identifier);
  return policy
    ? { classification: policy.classification, obligations: policy.obligations, identifiers: [identifier] }
    : { classification: "unknown", obligations: [], identifiers: [identifier] };
}

export function classifyLicenseExpression(rawExpression, policy) {
  const expression = policy.aliases?.[rawExpression] ?? rawExpression;
  const tokens = tokenize(expression);
  const licenseById = new Map((policy.licenses ?? []).map(license => [license.id, license]));
  if (!tokens?.length) return classifyIdentifier(expression, licenseById);
  let cursor = 0;

  const parsePrimary = () => {
    if (tokens[cursor] === "(") {
      cursor += 1;
      const value = parseOr();
      if (tokens[cursor] !== ")") throw new Error("missing closing parenthesis");
      cursor += 1;
      return value;
    }
    const identifier = tokens[cursor];
    if (!identifier || ["AND", "OR", "WITH", ")"].includes(identifier)) {
      throw new Error("expected license identifier");
    }
    cursor += 1;
    if (tokens[cursor] === "WITH") {
      cursor += 1;
      const exception = tokens[cursor];
      if (!exception || ["AND", "OR", "WITH", "(", ")"].includes(exception)) {
        throw new Error("expected SPDX exception identifier");
      }
      cursor += 1;
      return classifyIdentifier(`${identifier} WITH ${exception}`, licenseById);
    }
    return classifyIdentifier(identifier, licenseById);
  };

  const parseAnd = () => {
    let value = parsePrimary();
    while (tokens[cursor] === "AND") {
      cursor += 1;
      value = mergeResults("AND", value, parsePrimary());
    }
    return value;
  };

  function parseOr() {
    let value = parseAnd();
    while (tokens[cursor] === "OR") {
      cursor += 1;
      value = mergeResults("OR", value, parseAnd());
    }
    return value;
  }

  try {
    const result = parseOr();
    if (cursor !== tokens.length) throw new Error("unexpected token");
    return result;
  } catch {
    return classifyIdentifier(expression, licenseById);
  }
}

export function validateLicensePolicy(policy, now = new Date()) {
  const problems = [];
  if (policy.schemaVersion !== 1) problems.push("license policy schemaVersion must be 1");
  if (!Array.isArray(policy.licenses) || policy.licenses.length === 0) {
    problems.push("license policy must classify licenses");
  }
  const ids = new Set();
  for (const license of policy.licenses ?? []) {
    if (!license.id || ids.has(license.id))
      problems.push(`duplicate or missing license id ${license.id ?? "<missing>"}`);
    ids.add(license.id);
    if (!["allowed", "review", "denied"].includes(license.classification)) {
      problems.push(`${license.id} has invalid classification ${license.classification}`);
    }
    if (!Array.isArray(license.obligations) || license.obligations.length === 0) {
      problems.push(`${license.id} must declare source/notice obligations or an explicit none obligation`);
    }
  }
  for (const [alias, target] of Object.entries(policy.aliases ?? {})) {
    if (!alias.trim() || !target.trim()) problems.push("license aliases must map non-empty strings");
  }
  const exceptionIds = new Set();
  for (const exception of policy.exceptions ?? []) {
    if (!exception.id || exceptionIds.has(exception.id)) {
      problems.push(`duplicate or missing exception id ${exception.id ?? "<missing>"}`);
    }
    exceptionIds.add(exception.id);
    if (!["npm", "jvm"].includes(exception.ecosystem)) problems.push(`${exception.id} has invalid ecosystem`);
    if (!exception.package || !exception.version) problems.push(`${exception.id} must pin one package and version`);
    if (!Array.isArray(exception.licenses) || exception.licenses.length === 0) {
      problems.push(`${exception.id} must pin the reviewed license declarations`);
    }
    if (!exception.owner?.startsWith("@")) problems.push(`${exception.id} must have an accountable @owner`);
    if (!(exception.tracking?.startsWith("https://") || exception.tracking?.startsWith("docs/"))) {
      problems.push(`${exception.id} must link an HTTPS or source-owned docs/ tracker`);
    }
    if (!exception.rationale || exception.rationale.length < 32) {
      problems.push(`${exception.id} must include a reviewable rationale`);
    }
    if (!Array.isArray(exception.obligationsAccepted) || exception.obligationsAccepted.length === 0) {
      problems.push(`${exception.id} must record accepted obligations`);
    }
    const expiry = new Date(exception.expiresAt);
    if (!exception.expiresAt || Number.isNaN(expiry.valueOf())) problems.push(`${exception.id} has invalid expiresAt`);
    else if (expiry <= now) problems.push(`${exception.id} expired at ${exception.expiresAt}`);
  }
  return problems;
}

function packageNameFromLockPath(path) {
  const marker = path.lastIndexOf("node_modules/");
  if (marker < 0) return undefined;
  const remainder = path.slice(marker + "node_modules/".length);
  return remainder.startsWith("@") ? remainder.split("/").slice(0, 2).join("/") : remainder.split("/")[0];
}

function resolveLockDependency(packages, ownerPath, dependencyName) {
  let cursor = ownerPath;
  while (true) {
    const candidate = posix.join(cursor, "node_modules", dependencyName);
    if (packages[candidate]) {
      const entry = packages[candidate];
      return entry.link ? entry.resolved : candidate;
    }
    if (!cursor) return undefined;
    const parent = posix.dirname(cursor);
    cursor = parent === "." || parent === cursor ? "" : parent;
  }
}

export function buildNpmInventory({ lock, roots }) {
  if (lock.lockfileVersion !== 3 || !lock.packages) throw new Error("npm license inventory requires lockfileVersion 3");
  const packages = lock.packages;
  const inventory = new Map();
  const missing = [];

  for (const root of roots) {
    if (!packages[root.path]) {
      missing.push(`npm release root ${root.name} is missing lock entry ${root.path}`);
      continue;
    }
    const visited = new Set();
    const visit = (ownerPath, depth) => {
      const visitKey = `${root.name}:${ownerPath}`;
      if (visited.has(visitKey)) return;
      visited.add(visitKey);
      const owner = packages[ownerPath];
      if (!owner) return;
      const dependencies = { ...(owner.dependencies ?? {}), ...(owner.optionalDependencies ?? {}) };
      for (const dependencyName of Object.keys(dependencies).sort()) {
        const resolvedPath = resolveLockDependency(packages, ownerPath, dependencyName);
        if (!resolvedPath || !packages[resolvedPath]) {
          missing.push(`${root.name} cannot resolve ${dependencyName} from ${ownerPath}`);
          continue;
        }
        const dependency = packages[resolvedPath];
        if (resolvedPath.startsWith("packages/") || dependency.link) {
          visit(dependency.link ? dependency.resolved : resolvedPath, depth);
          continue;
        }
        const name = packageNameFromLockPath(resolvedPath) ?? dependencyName;
        const key = `${name}@${dependency.version}`;
        const record = inventory.get(key) ?? {
          ecosystem: "npm",
          package: name,
          version: dependency.version,
          direct: false,
          releaseRoots: new Set(),
          licenses: dependency.license ? [dependency.license] : [],
        };
        record.direct ||= depth === 0;
        record.releaseRoots.add(root.name);
        if (JSON.stringify(record.licenses) !== JSON.stringify(dependency.license ? [dependency.license] : [])) {
          missing.push(`${key} has inconsistent lockfile license declarations`);
        }
        inventory.set(key, record);
        visit(resolvedPath, depth + 1);
      }
    };
    visit(root.path, 0);
  }

  return {
    entries: [...inventory.values()]
      .map(entry => ({ ...entry, releaseRoots: [...entry.releaseRoots].sort() }))
      .sort((left, right) => `${left.package}@${left.version}`.localeCompare(`${right.package}@${right.version}`)),
    problems: uniqueSorted(missing),
  };
}

function componentLicenseDeclarations(component) {
  return uniqueSorted(
    (component.licenses ?? [])
      .map(entry => entry.expression ?? entry.license?.id ?? entry.license?.name)
      .filter(Boolean),
  );
}

export function buildJvmInventory({ sbom, roots, group }) {
  if (sbom.bomFormat !== "CycloneDX" || !Array.isArray(sbom.components) || !Array.isArray(sbom.dependencies)) {
    throw new Error("JVM license inventory requires a populated CycloneDX document");
  }
  const componentByRef = new Map(sbom.components.map(component => [component["bom-ref"], component]));
  const edges = new Map(sbom.dependencies.map(dependency => [dependency.ref, dependency.dependsOn ?? []]));
  const inventory = new Map();
  const problems = [];

  for (const rootName of roots.filter(name => name !== "vireo-bom")) {
    const root = sbom.components.find(component => component.group === group && component.name === rootName);
    if (!root) {
      problems.push(`JVM release root ${group}:${rootName} is missing from the CycloneDX graph`);
      continue;
    }
    const visited = new Set([root["bom-ref"]]);
    const queue = (edges.get(root["bom-ref"]) ?? []).map(ref => ({ ref, depth: 1 }));
    while (queue.length > 0) {
      const { ref, depth } = queue.shift();
      if (visited.has(ref)) continue;
      visited.add(ref);
      const component = componentByRef.get(ref);
      if (!component) {
        problems.push(`${group}:${rootName} references missing CycloneDX component ${ref}`);
        continue;
      }
      if (component.group !== group) {
        const key = `${component.group}:${component.name}:${component.version}`;
        const licenses = componentLicenseDeclarations(component);
        const record = inventory.get(key) ?? {
          ecosystem: "jvm",
          package: `${component.group}:${component.name}`,
          version: component.version,
          direct: false,
          releaseRoots: new Set(),
          licenses,
        };
        record.direct ||= depth === 1;
        record.releaseRoots.add(rootName);
        if (JSON.stringify(record.licenses) !== JSON.stringify(licenses)) {
          problems.push(`${key} has inconsistent CycloneDX license declarations`);
        }
        inventory.set(key, record);
      }
      for (const child of edges.get(ref) ?? []) queue.push({ ref: child, depth: depth + 1 });
    }
  }

  return {
    entries: [...inventory.values()]
      .map(entry => ({ ...entry, releaseRoots: [...entry.releaseRoots].sort() }))
      .sort((left, right) => `${left.package}:${left.version}`.localeCompare(`${right.package}:${right.version}`)),
    problems: uniqueSorted(problems),
  };
}

export function evaluateLicenseInventory(inventory, policy, { now = new Date() } = {}) {
  const problems = [...validateLicensePolicy(policy, now), ...(inventory.problems ?? [])];
  const entries = [];
  for (const dependency of inventory.entries ?? []) {
    const declarations = uniqueSorted(dependency.licenses ?? []);
    const alternatives = declarations.length
      ? declarations.map(declaration => classifyLicenseExpression(declaration, policy))
      : [{ classification: "unknown", obligations: [], identifiers: ["NOASSERTION"] }];
    const result = alternatives.reduce((left, right) => mergeResults("OR", left, right));
    const matchingException = (policy.exceptions ?? []).find(
      exception =>
        exception.ecosystem === dependency.ecosystem &&
        exception.package === dependency.package &&
        exception.version === dependency.version &&
        JSON.stringify(uniqueSorted(exception.licenses)) === JSON.stringify(declarations),
    );
    let decision = result.classification;
    if (result.classification === "review" && matchingException) decision = "review-exception";
    if (result.classification === "unknown") {
      problems.push(
        `${dependency.ecosystem}:${dependency.package}@${dependency.version} has unclassified licenses ${
          declarations.join(", ") || "NOASSERTION"
        }`,
      );
    } else if (result.classification === "denied") {
      problems.push(
        `${dependency.ecosystem}:${dependency.package}@${dependency.version} uses denied license ${declarations.join(", ")}`,
      );
    } else if (result.classification === "review" && !matchingException) {
      problems.push(
        `${dependency.ecosystem}:${dependency.package}@${dependency.version} requires license review for ${declarations.join(", ")}`,
      );
    }
    entries.push({
      ...dependency,
      licenses: declarations,
      classification: decision,
      obligations: uniqueSorted([...result.obligations, ...(matchingException?.obligationsAccepted ?? [])]),
      exception: matchingException?.id,
    });
  }
  return { entries, problems: uniqueSorted(problems) };
}
