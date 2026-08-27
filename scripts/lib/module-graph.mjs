/**
 * Shared source-graph helpers for the repo tooling.
 *
 * Every question the tooling asks about the public surface - what a package
 * exports, which entry points exist, what an entry point drags in at runtime -
 * is answered by walking TypeScript source with the compiler's own parser
 * rather than the built output. Source is where the intent lives; `dist` has
 * already lost the distinction between a type-only and a runtime import.
 *
 * Consumed by `api-inventory.mjs` (reporting) and `public-surface.mjs` (gate).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

export const SCOPE = "@vireocodedev";
export const PACKAGE_PREFIX = "starter-";

const SOURCE_EXTENSIONS = [".ts", ".tsx"];

/** Recursively lists files under `directory`, skipping `node_modules` and `dist`. */
export function walk(directory, predicate) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap(entry => {
    if (entry === "node_modules" || entry === "dist") return [];
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) return walk(full, predicate);
    return predicate(full) ? [full] : [];
  });
}

/** Lists every `.ts`/`.tsx` file under `directory`. */
export function walkSources(directory) {
  return walk(directory, file => SOURCE_EXTENSIONS.some(extension => file.endsWith(extension)));
}

/** Lists every file under `directory`, including `dist` contents. */
export function walkAll(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap(entry => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walkAll(full) : [full];
  });
}

/** Reads every workspace package, sorted by directory name. */
export function readStarterPackages(packagesRoot) {
  return readdirSync(packagesRoot)
    .filter(entry => statSync(join(packagesRoot, entry)).isDirectory())
    .sort()
    .map(directoryName => {
      const directory = join(packagesRoot, directoryName);
      const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
      return { directoryName, directory, manifest, name: manifest.name, srcRoot: join(directory, "src") };
    });
}

/** Resolves a `@/foo` or relative specifier to a file on disk. */
export function resolveSpecifier(specifier, fromFile, srcRoot) {
  const base = specifier.startsWith("@/")
    ? join(srcRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(fromFile), specifier)
      : undefined;

  if (!base) return undefined;

  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
    base.replace(/\.js$/, ".ts"),
    base.replace(/\.js$/, ".tsx"),
  ];
  return candidates.find(candidate => existsSync(candidate));
}

/**
 * Resolves a sibling workspace specifier to the source file behind its entry point.
 *
 * Without this, a graph walk would stop at `@vireocodedev/ui` and report
 * it as an inert external dependency - hiding the fact that importing it also
 * imports React, MUI and every provider they pull in.
 */
export function resolveWorkspaceSpecifier(specifier, packagesRoot) {
  if (!specifier.startsWith(`${SCOPE}/${PACKAGE_PREFIX}`)) return undefined;

  const withoutScope = specifier.slice(SCOPE.length + 1);
  const slash = withoutScope.indexOf("/");
  const directoryName = (slash === -1 ? withoutScope : withoutScope.slice(0, slash)).slice(PACKAGE_PREFIX.length);
  const subpath = slash === -1 ? "." : `.${withoutScope.slice(slash)}`;

  const directory = join(packagesRoot, directoryName);
  if (!existsSync(directory)) return undefined;

  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  const file = sourceForEntry(directory, manifest.exports?.[subpath]);
  return file ? { file, srcRoot: join(directory, "src") } : undefined;
}

function hasExportModifier(node) {
  return ts.canHaveModifiers(node)
    ? (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    : false;
}

/** Collects every named export of a module, following `export *` chains. */
export function collectExports(file, srcRoot, seen = new Set()) {
  const names = new Set();
  if (seen.has(file)) return names;
  seen.add(file);

  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
        continue;
      }

      const specifier = statement.moduleSpecifier;
      if (!specifier || !ts.isStringLiteral(specifier)) continue;
      const target = resolveSpecifier(specifier.text, file, srcRoot);
      if (target) for (const name of collectExports(target, srcRoot, seen)) names.add(name);
      continue;
    }

    if (!hasExportModifier(statement)) continue;

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
      continue;
    }

    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isModuleDeclaration(statement)) &&
      statement.name &&
      ts.isIdentifier(statement.name)
    ) {
      names.add(statement.name.text);
    }
  }

  return names;
}

/** Splits an `exports` map into deliberate entry points and wildcard patterns. */
export function analyseExportsMap(packageDirectory, exportsMap) {
  const declared = [];
  const wildcards = [];

  for (const [subpath, target] of Object.entries(exportsMap ?? {})) {
    if (subpath.includes("*")) wildcards.push({ subpath, target });
    else declared.push({ subpath, target });
  }

  // A wildcard subpath makes every matching build artefact importable.
  let wildcardFiles = [];
  if (wildcards.length > 0) {
    const distRoot = join(packageDirectory, "dist");
    wildcardFiles = walkAll(distRoot)
      .filter(file => file.endsWith(".js"))
      .map(file => `./${relative(distRoot, file).replace(/\\/g, "/").replace(/\.js$/, "")}`);
  }

  return { declared, wildcards, wildcardFiles };
}

/** Reads the `import`/`default` condition of an entry target. */
export function distTargetForEntry(target) {
  return typeof target === "string" ? target : (target?.import ?? target?.default);
}

/** Maps a declared entry's dist target back to production or package-level tooling source. */
export function sourceForEntry(packageDirectory, target) {
  const distPath = distTargetForEntry(target);
  if (!distPath) return undefined;
  const withoutDist = distPath.replace(/^\.\/dist\//, "").replace(/\.js$/, "");
  const candidates = [
    join(packageDirectory, "src", `${withoutDist}.ts`),
    join(packageDirectory, "src", `${withoutDist}.tsx`),
    join(packageDirectory, `${withoutDist}.ts`),
    join(packageDirectory, `${withoutDist}.tsx`),
  ];
  return candidates.find(candidate => existsSync(candidate));
}

/**
 * Walks the runtime module graph of an entry point, following workspace
 * dependencies into their own source.
 *
 * Type-only imports are skipped because they are erased before the module is
 * ever evaluated - a package may reference a component's prop types without
 * that component ever being loaded.
 */
export function runtimeGraph(entryFile, srcRoot, packagesRoot) {
  const files = new Set();
  const external = new Map();

  const visit = (file, currentSrcRoot) => {
    if (files.has(file)) return;
    files.add(file);

    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

    const record = (specifier, typeOnly) => {
      if (typeOnly) return;

      const local = resolveSpecifier(specifier, file, currentSrcRoot);
      if (local) {
        visit(local, currentSrcRoot);
        return;
      }

      const workspace = resolveWorkspaceSpecifier(specifier, packagesRoot);
      if (workspace) {
        visit(workspace.file, workspace.srcRoot);
        return;
      }

      if (specifier.startsWith("@/") || specifier.startsWith(".")) return;
      if (!external.has(specifier)) external.set(specifier, file);
    };

    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        const clause = statement.importClause;
        const bindings = clause?.namedBindings;
        // A default or namespace binding is always a runtime import, even when
        // every named binding beside it is type-only (`import axios, { type X }`).
        const hasValueBinding =
          clause?.name !== undefined || (bindings !== undefined && ts.isNamespaceImport(bindings));
        const allNamedAreTypes =
          !hasValueBinding &&
          bindings !== undefined &&
          ts.isNamedImports(bindings) &&
          bindings.elements.length > 0 &&
          bindings.elements.every(element => element.isTypeOnly);

        record(statement.moduleSpecifier.text, Boolean(clause?.isTypeOnly) || allNamedAreTypes);
        continue;
      }

      if (
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const clause = statement.exportClause;
        const allNamedAreTypes =
          clause !== undefined &&
          ts.isNamedExports(clause) &&
          clause.elements.length > 0 &&
          clause.elements.every(element => element.isTypeOnly);

        record(statement.moduleSpecifier.text, statement.isTypeOnly || allNamedAreTypes);
      }
    }
  };

  visit(entryFile, srcRoot);
  return { files, external };
}

/** Anything that needs React, a React renderer, or the DOM to evaluate. */
export function isFrameworkSpecifier(specifier) {
  return (
    specifier === "react" ||
    specifier.startsWith("react/") ||
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/") ||
    specifier.startsWith("react-") ||
    specifier.startsWith("@mui/") ||
    specifier.startsWith("@emotion/") ||
    specifier.includes("/react/") ||
    specifier.endsWith("/react")
  );
}
