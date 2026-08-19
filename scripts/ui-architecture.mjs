import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const uiRoot = resolve(repoRoot, "packages/ui");
const srcRoot = resolve(uiRoot, "src");
const allowlistPath = resolve(uiRoot, "architecture.allowlist.json");
const migrationPath = resolve(uiRoot, "docs/architecture/migration.md");

const STRUCTURAL_FOLDERS = new Set([
  "assets",
  "components",
  "constants",
  "contexts",
  "events",
  "hooks",
  "models",
  "providers",
  "services",
  "state",
  "styles",
  "types",
  "utils",
]);

const COMPONENT_CATEGORIES = new Set([
  "behavior",
  "controls",
  "data-display",
  "feedback",
  "forms",
  "inputs",
  "layout",
  "navigation",
  "overlays",
  "surfaces",
]);

const CATCH_ALL_NAMES = new Set(["common", "general", "helpers", "misc", "shared"]);
const NAMED_MODULE_FOLDERS = new Set(["contexts", "hooks", "providers", "services", "state"]);
const ALLOWLISTABLE_RULES = new Set(["legacy-source-location"]);

const RULES = new Set([
  "capability-cycle",
  "capability-root-entry",
  "child-capability-depth",
  "child-public-entry",
  "child-root-entry",
  "component-category",
  "component-directory-name",
  "components-entry",
  "core-capability-dependency",
  "core-import-boundary",
  "core-root-entry",
  "cross-capability-public-import",
  "forbidden-catch-all-name",
  "forbidden-index-barrel",
  "internal-component-structure",
  "internal-package-entry-import",
  "inventory-overlap",
  "inventory-stale-pattern",
  "inventory-unmatched",
  "legacy-source-location",
  "module-file-name",
  "module-structure",
  "public-entry-location",
  "public-entry-required",
  "relative-import-boundary",
  "sibling-capability-import",
  "target-empty-directory",
  "vireo-name",
  "vireo-root-contract",
]);

function fail(message) {
  throw new Error(`Invalid UI architecture allowlist: ${message}`);
}

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(root, includeDirectories = false) {
  if (!existsSync(root)) return [];

  const results = [];

  function visit(directory) {
    const entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      const absolutePath = resolve(directory, entry.name);
      const path = toPosix(relative(root, absolutePath));

      if (entry.isDirectory()) {
        if (includeDirectories) results.push(path);
        visit(absolutePath);
      } else {
        results.push(path);
      }
    }
  }

  visit(root);
  return results;
}

export function expandBraces(pattern) {
  const match = pattern.match(/\{([^{}]+)\}/u);
  if (!match) return [pattern];

  return match[1]
    .split(",")
    .flatMap(value =>
      expandBraces(`${pattern.slice(0, match.index)}${value}${pattern.slice((match.index ?? 0) + match[0].length)}`),
    );
}

export function globToRegExp(pattern) {
  let source = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];

    if (character === "*" && pattern[index + 1] === "*") {
      if (pattern[index + 2] === "/") {
        source += "(?:.*/)?";
        index += 2;
      } else {
        source += ".*";
        index += 1;
      }
      continue;
    }

    if (character === "*") {
      source += "[^/]*";
      continue;
    }

    if (character === "?") {
      source += "[^/]";
      continue;
    }

    source += character.replace(/[|\\{}()[\]^$+?.]/gu, "\\$&");
  }

  return new RegExp(`${source}$`, "u");
}

export function matchesGlob(path, pattern) {
  return globToRegExp(pattern).test(path);
}

export function readArchitectureAllowlist(path = allowlistPath) {
  let parsed;

  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("the root value must be an object");
  }

  if (parsed.version !== 1) {
    fail('"version" must be 1');
  }

  if (!Array.isArray(parsed.exceptions)) {
    fail('"exceptions" must be an array');
  }

  const seen = new Set();

  for (const [index, exception] of parsed.exceptions.entries()) {
    if (!exception || typeof exception !== "object" || Array.isArray(exception)) {
      fail(`exceptions[${index}] must be an object`);
    }

    const keys = Object.keys(exception).sort();
    const expectedKeys = ["path", "reason", "rule"];

    if (keys.length !== expectedKeys.length || keys.some((key, keyIndex) => key !== expectedKeys[keyIndex])) {
      fail(`exceptions[${index}] must contain exactly: ${expectedKeys.join(", ")}`);
    }

    for (const key of expectedKeys) {
      if (typeof exception[key] !== "string" || exception[key].trim() === "") {
        fail(`exceptions[${index}].${key} must be a non-empty string`);
      }
    }

    if (!RULES.has(exception.rule)) {
      fail(`exceptions[${index}].rule references unknown rule "${exception.rule}"`);
    }

    if (!ALLOWLISTABLE_RULES.has(exception.rule)) {
      fail(`rule "${exception.rule}" cannot be allowlisted`);
    }

    if (isAbsolute(exception.path) || exception.path.split(/[\\/]/u).includes("..")) {
      fail(`exceptions[${index}].path must be relative to packages/ui/src`);
    }

    if (exception.path.includes("\\")) {
      fail(`exceptions[${index}].path must use forward slashes`);
    }

    const key = `${exception.rule}\0${exception.path}`;

    if (seen.has(key)) {
      fail(`duplicate exception for rule "${exception.rule}" and path "${exception.path}"`);
    }

    seen.add(key);
  }

  return parsed;
}

function readInventoryPatterns() {
  const markdown = readFileSync(migrationPath, "utf8");
  const inventoryStart = markdown.indexOf("## Root and legacy area inventory");
  const inventoryEnd = markdown.indexOf("## Ownership decisions recorded by this baseline");

  if (inventoryStart === -1 || inventoryEnd === -1 || inventoryEnd <= inventoryStart) {
    throw new Error("Migration guide is missing the machine-readable inventory boundaries.");
  }

  const inventory = markdown.slice(inventoryStart, inventoryEnd);
  const rawPatterns = [...inventory.matchAll(/^\| `([^`]+)`\s+\|/gmu)].map(match => match[1]);

  if (rawPatterns.length === 0) {
    throw new Error("Migration guide contains no inventory path patterns.");
  }

  return rawPatterns.flatMap(pattern => expandBraces(pattern).map(expanded => ({ expanded, source: pattern })));
}

function violation(rule, path, message) {
  return { rule, path, message };
}

function collectInventoryViolations(files) {
  const violations = [];
  const patterns = readInventoryPatterns();

  for (const file of files) {
    const matches = patterns.filter(pattern => matchesGlob(file, pattern.expanded));

    if (matches.length === 0) {
      violations.push(violation("inventory-unmatched", file, "is not covered by the migration inventory"));
    } else if (matches.length > 1) {
      violations.push(
        violation(
          "inventory-overlap",
          file,
          `matches multiple migration patterns: ${matches.map(match => match.source).join(", ")}`,
        ),
      );
    }
  }

  for (const pattern of patterns) {
    if (!files.some(file => matchesGlob(file, pattern.expanded))) {
      violations.push(
        violation(
          "inventory-stale-pattern",
          pattern.expanded,
          `inventory pattern ${pattern.source} matches no source file`,
        ),
      );
    }
  }

  return violations;
}

function isTargetSourceFile(file) {
  return (
    file === "index.ts" ||
    /^[^/]+\.d\.ts$/u.test(file) ||
    file.startsWith("core/") ||
    file.startsWith("capabilities/") ||
    file.startsWith("integrations/")
  );
}

function collectLegacyLocationViolations(files) {
  return files
    .filter(file => !isTargetSourceFile(file))
    .map(file =>
      violation("legacy-source-location", file, "remains outside core, capabilities, or integrations during migration"),
    );
}

function immediateEntries(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
}

function targetRelative(absolutePath) {
  return toPosix(relative(srcRoot, absolutePath));
}

function checkBoundaryRoot(root, kind, violations) {
  if (!existsSync(root)) return;

  if (!immediateEntries(root).some(entry => !entry.isDirectory() && entry.name === "public.ts")) {
    violations.push(
      violation("public-entry-required", `${targetRelative(root)}/public.ts`, `${kind} requires a public.ts boundary`),
    );
  }

  for (const entry of immediateEntries(root)) {
    const path = targetRelative(resolve(root, entry.name));

    if (entry.isDirectory() && STRUCTURAL_FOLDERS.has(entry.name)) continue;
    if (!entry.isDirectory() && entry.name === "public.ts") continue;

    violations.push(violation(`${kind}-root-entry`, path, `is not an approved ${kind} root entry`));
  }
}

function isKebabCase(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value);
}

function collectCapabilityRootViolations(violations) {
  const capabilitiesRoot = resolve(srcRoot, "capabilities");
  if (!existsSync(capabilitiesRoot)) return;

  for (const capability of immediateEntries(capabilitiesRoot)) {
    const capabilityPath = resolve(capabilitiesRoot, capability.name);
    const relativeCapabilityPath = targetRelative(capabilityPath);

    if (!capability.isDirectory() || !isKebabCase(capability.name)) {
      violations.push(
        violation(
          "capability-root-entry",
          relativeCapabilityPath,
          "top-level capabilities must be kebab-case directories",
        ),
      );
      continue;
    }

    if (!immediateEntries(capabilityPath).some(entry => !entry.isDirectory() && entry.name === "public.ts")) {
      violations.push(
        violation(
          "public-entry-required",
          `${relativeCapabilityPath}/public.ts`,
          "top-level capabilities require a public.ts boundary",
        ),
      );
    }

    for (const entry of immediateEntries(capabilityPath)) {
      const entryPath = resolve(capabilityPath, entry.name);
      const relativeEntryPath = targetRelative(entryPath);

      if (!entry.isDirectory()) {
        if (entry.name !== "public.ts") {
          violations.push(
            violation("capability-root-entry", relativeEntryPath, "only public.ts may be a capability-root file"),
          );
        }
        continue;
      }

      if (STRUCTURAL_FOLDERS.has(entry.name)) continue;

      if (!isKebabCase(entry.name)) {
        violations.push(
          violation("capability-root-entry", relativeEntryPath, "child capabilities must use kebab-case names"),
        );
        continue;
      }

      for (const childEntry of immediateEntries(entryPath)) {
        const childEntryPath = resolve(entryPath, childEntry.name);
        const relativeChildEntryPath = targetRelative(childEntryPath);

        if (!childEntry.isDirectory()) {
          violations.push(
            violation(
              childEntry.name === "public.ts" ? "child-public-entry" : "child-root-entry",
              relativeChildEntryPath,
              childEntry.name === "public.ts"
                ? "child capabilities expose APIs through their parent public.ts"
                : "child capability roots contain only approved structural directories",
            ),
          );
          continue;
        }

        if (!STRUCTURAL_FOLDERS.has(childEntry.name)) {
          violations.push(
            violation(
              "child-capability-depth",
              relativeChildEntryPath,
              "capability nesting is limited to one child level",
            ),
          );
        }
      }
    }
  }
}

function isPublicComponentDirectory(path) {
  return /(?:^|\/)components\/(?:behavior|controls|data-display|feedback|forms|inputs|layout|navigation|overlays|surfaces)\/[^/]+$/u.test(
    path,
  );
}

function isPrivateComponentDirectory(path) {
  return /(?:^|\/)internal\/components\/[^/]+$/u.test(path);
}

function collectComponentViolations(directories, files, violations) {
  const structuralComponents = directories.filter(path => {
    const segments = path.split("/");
    if (segments.at(-1) !== "components" || segments.at(-2) === "internal") return false;

    return (
      path === "core/components" ||
      /^capabilities\/[^/]+\/components$/u.test(path) ||
      /^capabilities\/[^/]+\/[^/]+\/components$/u.test(path)
    );
  });

  for (const componentsPath of structuralComponents) {
    const absoluteComponentsPath = resolve(srcRoot, componentsPath);

    for (const entry of immediateEntries(absoluteComponentsPath)) {
      const entryPath = `${componentsPath}/${entry.name}`;

      if (!entry.isDirectory()) {
        violations.push(violation("components-entry", entryPath, "files cannot be placed directly in components"));
        continue;
      }

      if (!COMPONENT_CATEGORIES.has(entry.name)) {
        violations.push(violation("component-category", entryPath, "is not an approved component category"));
        continue;
      }

      for (const component of immediateEntries(resolve(absoluteComponentsPath, entry.name))) {
        const componentPath = `${entryPath}/${component.name}`;

        if (!component.isDirectory()) {
          violations.push(
            violation(
              "component-directory-name",
              componentPath,
              "component categories contain only component directories",
            ),
          );
          continue;
        }

        if (!/^[A-Z][A-Za-z0-9]*$/u.test(component.name)) {
          violations.push(
            violation("component-directory-name", componentPath, "component directories must use PascalCase"),
          );
        }

        if (!component.name.startsWith("Vireo")) {
          violations.push(violation("vireo-name", componentPath, "public components must use the Vireo prefix"));
          continue;
        }

        const expectedFiles = new Set([
          `${component.name}.classes.ts`,
          `${component.name}.identity.ts`,
          `${component.name}.stories.tsx`,
          `${component.name}.styled.ts`,
          `${component.name}.test.tsx`,
          `${component.name}.tsx`,
          `${component.name}.types.ts`,
          "index.ts",
        ]);
        const actualEntries = immediateEntries(resolve(absoluteComponentsPath, entry.name, component.name));

        for (const expectedFile of expectedFiles) {
          if (!actualEntries.some(actual => !actual.isDirectory() && actual.name === expectedFile)) {
            violations.push(
              violation(
                "vireo-root-contract",
                `${componentPath}/${expectedFile}`,
                "required Vireo root file is missing",
              ),
            );
          }
        }

        for (const actual of actualEntries) {
          if (
            (!actual.isDirectory() && expectedFiles.has(actual.name)) ||
            (actual.isDirectory() && actual.name === "internal")
          ) {
            continue;
          }

          violations.push(
            violation(
              "vireo-root-contract",
              `${componentPath}/${actual.name}`,
              "Vireo roots contain only the eight canonical files and optional internal directory",
            ),
          );
        }
      }
    }
  }

  for (const directory of directories.filter(isPrivateComponentDirectory)) {
    const name = directory.split("/").at(-1);

    if (!/^[A-Z][A-Za-z0-9]*$/u.test(name)) {
      violations.push(
        violation("internal-component-structure", directory, "private component directories must use PascalCase"),
      );
    }

    if (!files.includes(`${directory}/index.ts`)) {
      violations.push(
        violation(
          "internal-component-structure",
          `${directory}/index.ts`,
          "private components require a local index.ts",
        ),
      );
    }
  }
}

function collectModuleViolations(directories, files, violations) {
  const structuralModuleDirectories = directories.filter(path => {
    const segments = path.split("/");
    const name = segments.at(-1);
    if (!NAMED_MODULE_FOLDERS.has(name)) return false;

    return (
      path === `core/${name}` ||
      new RegExp(`^capabilities/[^/]+/${name}$`, "u").test(path) ||
      new RegExp(`^capabilities/[^/]+/[^/]+/${name}$`, "u").test(path) ||
      segments.at(-2) === "internal"
    );
  });

  for (const structuralPath of structuralModuleDirectories) {
    const moduleKind = structuralPath.split("/").at(-1);

    for (const entry of immediateEntries(resolve(srcRoot, structuralPath))) {
      const entryPath = `${structuralPath}/${entry.name}`;

      if (!entry.isDirectory()) {
        violations.push(
          violation(
            "module-structure",
            entryPath,
            `${moduleKind} contains same-named module directories, not loose files`,
          ),
        );
        continue;
      }

      const validName =
        moduleKind === "hooks"
          ? /^use[A-Z][A-Za-z0-9]*$/u.test(entry.name)
          : moduleKind === "contexts" || moduleKind === "providers"
            ? /^[A-Z][A-Za-z0-9]*$/u.test(entry.name)
            : /^[a-z][A-Za-z0-9]*$/u.test(entry.name);

      if (!validName) {
        violations.push(violation("module-structure", entryPath, `invalid ${moduleKind} module name`));
      }

      for (const file of files.filter(
        path => path.startsWith(`${entryPath}/`) && !path.slice(entryPath.length + 1).includes("/"),
      )) {
        const basename = file.split("/").at(-1);

        if (basename === "index.ts" || (!basename.startsWith(`${entry.name}.`) && basename !== `${entry.name}.ts`)) {
          violations.push(
            violation(
              "module-file-name",
              file,
              "module root files must preserve the module basename and cannot be barrels",
            ),
          );
        }
      }
    }
  }
}

function collectTargetStructureViolations(files, directories) {
  const violations = [];
  const targetDirectories = directories.filter(
    path => path === "core" || path.startsWith("core/") || path === "capabilities" || path.startsWith("capabilities/"),
  );

  for (const directory of targetDirectories) {
    if (immediateEntries(resolve(srcRoot, directory)).length === 0) {
      violations.push(
        violation("target-empty-directory", directory, "target architecture directories cannot be empty"),
      );
    }

    const segments = directory.split("/");
    if (segments.some(segment => CATCH_ALL_NAMES.has(segment))) {
      violations.push(
        violation("forbidden-catch-all-name", directory, "contains a forbidden catch-all directory name"),
      );
    }

    if (segments.filter(segment => segment === "internal").length > 1) {
      violations.push(violation("child-capability-depth", directory, "nested internal directories are forbidden"));
    }
  }

  checkBoundaryRoot(resolve(srcRoot, "core"), "core", violations);
  collectCapabilityRootViolations(violations);
  collectComponentViolations(directories, files, violations);
  collectModuleViolations(directories, files, violations);

  for (const file of files.filter(
    path => path === "core/public.ts" || path.startsWith("core/") || path.startsWith("capabilities/"),
  )) {
    if (file.endsWith("/public.ts") && file !== "core/public.ts" && !/^capabilities\/[^/]+\/public\.ts$/u.test(file)) {
      violations.push(
        violation("public-entry-location", file, "public.ts exists only in core and top-level capability roots"),
      );
    }

    if (file.endsWith("/index.ts") && !isPublicComponentDirectory(file.slice(0, -"/index.ts".length))) {
      const componentDirectory = file.slice(0, -"/index.ts".length);
      if (!isPrivateComponentDirectory(componentDirectory)) {
        violations.push(
          violation(
            "forbidden-index-barrel",
            file,
            "index.ts is reserved for public or private React component modules",
          ),
        );
      }
    }
  }

  return violations;
}

function sourceSpecifiers(file) {
  const source = ts.createSourceFile(
    file,
    readFileSync(resolve(srcRoot, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers = [];

  for (const statement of source.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text);
    }
  }

  return specifiers;
}

function capabilityLocation(path) {
  const segments = path.split("/");
  if (segments[0] !== "capabilities" || !segments[1]) return undefined;

  const possibleChild = segments[2];
  return {
    capability: segments[1],
    child:
      possibleChild && possibleChild !== "public.ts" && !STRUCTURAL_FOLDERS.has(possibleChild)
        ? possibleChild
        : undefined,
  };
}

function collectImportViolations(files) {
  const violations = [];
  const capabilityEdges = new Map();
  const targetFiles = files.filter(
    file =>
      (file.startsWith("core/") || file.startsWith("capabilities/")) && (file.endsWith(".ts") || file.endsWith(".tsx")),
  );

  for (const file of targetFiles) {
    const owner = capabilityLocation(file);

    for (const specifier of sourceSpecifiers(file)) {
      if (specifier === "@/index" || specifier === "@/index.ts" || specifier === "@vireocodedev/starter-ui") {
        violations.push(
          violation("internal-package-entry-import", file, `imports the package entry point through "${specifier}"`),
        );
        continue;
      }

      if (specifier.startsWith(".")) {
        const importerDirectory = file.slice(0, file.lastIndexOf("/"));
        const resolved = resolve(`/${importerDirectory}`, specifier).slice(1);
        const resolvedDirectory = resolved.includes("/") ? resolved.slice(0, resolved.lastIndexOf("/")) : "";

        if (resolvedDirectory !== importerDirectory) {
          violations.push(
            violation(
              "relative-import-boundary",
              file,
              `relative import "${specifier}" crosses a module directory; use the @/ alias`,
            ),
          );
        }
        continue;
      }

      if (!specifier.startsWith("@/")) continue;
      const target = specifier.slice(2);

      if (file.startsWith("core/")) {
        if (target.startsWith("capabilities/")) {
          violations.push(
            violation("core-capability-dependency", file, `core cannot import capability module "${specifier}"`),
          );
        } else if (!target.startsWith("core/")) {
          violations.push(
            violation(
              "core-import-boundary",
              file,
              `core cannot import legacy or non-core source module "${specifier}"`,
            ),
          );
        }
        continue;
      }

      if (!owner) continue;

      if (target.startsWith("core/") && target !== "core/public") {
        violations.push(
          violation(
            "cross-capability-public-import",
            file,
            `capabilities import core through @/core/public, not "${specifier}"`,
          ),
        );
        continue;
      }

      if (!target.startsWith("capabilities/") && !target.startsWith("core/")) {
        violations.push(
          violation(
            "cross-capability-public-import",
            file,
            `capabilities cannot import legacy source module "${specifier}"`,
          ),
        );
        continue;
      }

      const targetOwner = capabilityLocation(target);
      if (!targetOwner) continue;

      if (targetOwner.capability !== owner.capability) {
        if (target !== `capabilities/${targetOwner.capability}/public`) {
          violations.push(
            violation(
              "cross-capability-public-import",
              file,
              `cross-capability import "${specifier}" must target the capability public.ts`,
            ),
          );
        } else {
          if (!capabilityEdges.has(owner.capability)) capabilityEdges.set(owner.capability, new Set());
          capabilityEdges.get(owner.capability).add(targetOwner.capability);
        }
      } else if (owner.child && targetOwner.child && owner.child !== targetOwner.child) {
        violations.push(
          violation(
            "sibling-capability-import",
            file,
            `child capabilities cannot import sibling "${targetOwner.child}"`,
          ),
        );
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(capability, stack) {
    if (visiting.has(capability)) {
      const cycleStart = stack.indexOf(capability);
      const cycle = [...stack.slice(cycleStart), capability];
      violations.push(violation("capability-cycle", cycle.join(" -> "), "top-level capability graph must be acyclic"));
      return;
    }
    if (visited.has(capability)) return;

    visiting.add(capability);
    for (const dependency of capabilityEdges.get(capability) ?? []) visit(dependency, [...stack, capability]);
    visiting.delete(capability);
    visited.add(capability);
  }

  for (const capability of capabilityEdges.keys()) visit(capability, []);
  return violations;
}

function collectViolations() {
  const files = walk(srcRoot);
  const directories = walk(srcRoot, true).filter(path => !files.includes(path));

  return [
    ...collectInventoryViolations(files),
    ...collectLegacyLocationViolations(files),
    ...collectTargetStructureViolations(files, directories),
    ...collectImportViolations(files),
  ].sort((left, right) => left.rule.localeCompare(right.rule) || left.path.localeCompare(right.path));
}

function exceptionKey({ rule, path }) {
  return `${rule}\0${path}`;
}

function updateAllowlist(violations, currentAllowlist) {
  const blocking = violations.filter(entry => !ALLOWLISTABLE_RULES.has(entry.rule));
  if (blocking.length > 0) return { blocking };

  const previous = new Map(currentAllowlist.exceptions.map(exception => [exceptionKey(exception), exception]));
  const exceptions = violations.map(entry => {
    const existing = previous.get(exceptionKey(entry));
    return {
      rule: entry.rule,
      path: entry.path,
      reason: existing?.reason ?? "Pre-architecture source file tracked by the migration inventory.",
    };
  });

  writeFileSync(allowlistPath, `${JSON.stringify({ version: 1, exceptions }, null, 2)}\n`);
  return { blocking: [] };
}

function printViolations(title, violations) {
  if (violations.length === 0) return;
  console.error(title);
  for (const entry of violations) console.error(`  x [${entry.rule}] ${entry.path}: ${entry.message}`);
}

function main() {
  const allowlist = readArchitectureAllowlist();
  const violations = collectViolations();

  if (process.argv.includes("--update-allowlist")) {
    const { blocking } = updateAllowlist(violations, allowlist);
    if (blocking.length > 0) {
      printViolations("Cannot update the allowlist while non-allowlistable violations exist:", blocking);
      process.exit(1);
    }

    console.log(`Updated UI architecture allowlist with ${violations.length} exact legacy source paths.`);
    return;
  }

  const violationKeys = new Set(violations.map(exceptionKey));
  const exceptionKeys = new Set(allowlist.exceptions.map(exceptionKey));
  const unallowlisted = violations.filter(entry => !exceptionKeys.has(exceptionKey(entry)));
  const stale = allowlist.exceptions.filter(exception => !violationKeys.has(exceptionKey(exception)));

  printViolations("Unallowlisted UI architecture violations:", unallowlisted);
  if (stale.length > 0) {
    console.error("Stale UI architecture allowlist entries:");
    for (const exception of stale) console.error(`  x [${exception.rule}] ${exception.path}`);
  }

  if (unallowlisted.length > 0 || stale.length > 0) {
    console.error("");
    console.error("Move the code into the target architecture or update the reviewed migration baseline.");
    process.exit(1);
  }

  console.log(
    `UI architecture is valid (${walk(srcRoot).length} inventoried files, ${allowlist.exceptions.length} exact legacy exceptions).`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
