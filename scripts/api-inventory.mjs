/**
 * Public API inventory (roadmap step 1.1).
 *
 * Answers three questions per package, which are currently very different numbers:
 *
 *   A. USED       - symbols the consuming app actually imports, and through which subpath.
 *   B. EXPORTED   - symbols reachable from the package's declared entry points.
 *   C. REACHABLE  - files an arbitrary consumer can import through the `exports` map.
 *
 * C is the real public API as far as semver is concerned. Where C is much larger
 * than B, every internal rename is technically a breaking change. Where B is much
 * larger than A, the package is carrying surface nobody asked for.
 *
 * Usage:
 *   node scripts/api-inventory.mjs                 # human-readable report
 *   node scripts/api-inventory.mjs --json          # machine-readable
 *   node scripts/api-inventory.mjs --app <path>    # point at a different consumer
 *
 * The consumer defaults to the sibling checkout documented in the app's
 * vite.config.ts. If it is missing, the USED column is reported as unavailable
 * rather than failing - the EXPORTED and REACHABLE analysis stands on its own.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  analyseExportsMap,
  collectExports,
  matchWorkspaceSpecifier,
  readStarterPackages,
  sourceForEntry,
  walkSources,
} from "./lib/module-graph.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repoRoot, "packages");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const appFlagIndex = args.indexOf("--app");
const appRoot = resolve(
  appFlagIndex === -1 ? join(repoRoot, "..", "starter-template", "frontend") : args[appFlagIndex + 1],
);

/* ------------------------------------------------------------------ *
 * A. Used - what the consuming app imports, and how.
 * ------------------------------------------------------------------ */

function collectAppUsage(root) {
  if (!existsSync(root)) return undefined;

  const files = ["src", "tests", "scripts"].flatMap(directory => walkSources(join(root, directory)));

  /** package name -> { symbols: Map<symbol, Set<file>>, subpaths: Map<subpath, Set<file>> } */
  const usage = new Map();

  for (const file of files) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

    for (const statement of source.statements) {
      const isImport = ts.isImportDeclaration(statement);
      const isReExport = ts.isExportDeclaration(statement) && statement.moduleSpecifier;
      if (!isImport && !isReExport) continue;

      const specifierNode = statement.moduleSpecifier;
      if (!specifierNode || !ts.isStringLiteral(specifierNode)) continue;

      const specifier = specifierNode.text;
      const workspaceMatch = matchWorkspaceSpecifier(specifier, packagesRoot);
      if (!workspaceMatch) continue;
      const packageName = workspaceMatch.workspace.name;
      const subpath = workspaceMatch.subpath;

      if (!usage.has(packageName)) usage.set(packageName, { symbols: new Map(), subpaths: new Map() });
      const record = usage.get(packageName);

      if (!record.subpaths.has(subpath)) record.subpaths.set(subpath, new Set());
      record.subpaths.get(subpath).add(relative(root, file));

      const clause = isImport ? statement.importClause : statement;
      const named = isImport ? clause?.namedBindings : clause?.exportClause;

      if (isImport && clause?.name) addSymbol(record, "default", file, root);
      if (named && ts.isNamedImports(named)) {
        for (const element of named.elements) {
          addSymbol(record, (element.propertyName ?? element.name).text, file, root);
        }
      }
      if (named && ts.isNamedExports(named)) {
        for (const element of named.elements) {
          addSymbol(record, (element.propertyName ?? element.name).text, file, root);
        }
      }
      if (named && ts.isNamespaceImport(named)) addSymbol(record, "* (namespace import)", file, root);
    }
  }

  return usage;
}

function addSymbol(record, symbol, file, root) {
  if (!record.symbols.has(symbol)) record.symbols.set(symbol, new Set());
  record.symbols.get(symbol).add(relative(root, file));
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

function buildReport() {
  const appUsage = collectAppUsage(appRoot);

  return readStarterPackages(packagesRoot).map(({ directoryName, directory: packageDirectory, manifest, srcRoot }) => {
    const { declared, wildcards, wildcardFiles } = analyseExportsMap(packageDirectory, manifest.exports);

    const entries = declared.map(entry => {
      const sourceFile = sourceForEntry(packageDirectory, entry.target);
      return {
        subpath: entry.subpath,
        exports: sourceFile ? [...collectExports(sourceFile, srcRoot)].sort() : [],
      };
    });

    const exported = new Set(entries.flatMap(entry => entry.exports));

    const record = appUsage?.get(manifest.name);
    const usedSymbols = record ? [...record.symbols.keys()].sort() : [];
    const usedSubpaths = record ? [...record.subpaths.keys()].sort() : [];

    const declaredSubpaths = new Set(declared.map(entry => entry.subpath));
    const deepImports = usedSubpaths
      .filter(subpath => !declaredSubpaths.has(subpath))
      .map(subpath => ({ subpath, files: [...record.subpaths.get(subpath)].sort() }));

    const unknownSymbols = usedSymbols.filter(
      symbol => !exported.has(symbol) && symbol !== "default" && !symbol.startsWith("*"),
    );

    return {
      package: manifest.name,
      version: manifest.version,
      directory: directoryName,
      entryPoints: entries.map(entry => entry.subpath),
      wildcard: wildcards.length > 0,
      counts: {
        used: record ? usedSymbols.length : null,
        exported: exported.size,
        reachable: wildcards.length > 0 ? wildcardFiles.length : declared.length,
      },
      used: usedSymbols,
      exported: [...exported].sort(),
      unused: [...exported].filter(symbol => !usedSymbols.includes(symbol)).sort(),
      unknownSymbols,
      deepImports,
      wildcardFiles,
    };
  });
}

function pad(value, width) {
  return String(value).padEnd(width);
}

function printReport(report) {
  const appAvailable = report.some(entry => entry.counts.used !== null);
  const nameWidth = Math.max(...report.map(entry => entry.package.length)) + 2;

  console.log("Public API inventory");
  console.log(`Consumer: ${appAvailable ? appRoot : `${appRoot} (not found - USED unavailable)`}`);
  console.log("");
  console.log(
    `${pad("PACKAGE", nameWidth)}${pad("VER", 8)}${pad("USED", 7)}${pad("EXPORTED", 10)}${pad("UNUSED", 8)}${pad("REACHABLE", 11)}ENTRY POINTS`,
  );
  console.log("-".repeat(nameWidth + 60));

  for (const entry of report) {
    const reachable = entry.wildcard ? `${entry.counts.reachable} (*)` : String(entry.counts.reachable);
    console.log(
      pad(entry.package, nameWidth) +
        pad(entry.version, 8) +
        pad(entry.counts.used ?? "-", 7) +
        pad(entry.counts.exported, 10) +
        pad(entry.unused.length, 8) +
        pad(reachable, 11) +
        entry.entryPoints.join(", ") +
        (entry.wildcard ? ", ./* <- WILDCARD" : ""),
    );
  }

  console.log("");
  console.log("(*) the exports map contains a wildcard, so every listed build artefact is public API.");

  const offenders = report.filter(entry => entry.deepImports.length > 0);
  console.log("");
  console.log("DEEP IMPORTS BY THE CONSUMER");
  if (offenders.length === 0) {
    console.log("  none - every consumer import goes through a declared entry point.");
  } else {
    for (const entry of offenders) {
      console.log(`  ${entry.package}`);
      for (const deep of entry.deepImports) {
        console.log(`    ${deep.subpath}`);
        for (const file of deep.files) console.log(`      ${file}`);
      }
    }
  }

  const unknown = report.filter(entry => entry.unknownSymbols.length > 0);
  if (unknown.length > 0) {
    console.log("");
    console.log("SYMBOLS IMPORTED BUT NOT FOUND IN A DECLARED ENTRY POINT");
    for (const entry of unknown) {
      console.log(`  ${entry.package}: ${entry.unknownSymbols.join(", ")}`);
    }
  }
}

const report = buildReport();

if (asJson) console.log(JSON.stringify(report, null, 2));
else printReport(report);
