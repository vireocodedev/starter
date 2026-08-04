import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Guards the Storybook documentation against drift.
 *
 * The docs are prose and the story code samples are template literals, so
 * nothing else in the toolchain type-checks either of them. Several APIs have
 * shipped documented-but-nonexistent in the past (`showNotiSnackStatic`,
 * `closeNotiSnackStatic`, `RgoWebWorkerService`, `RgoSseProvider`,
 * `RgoInitializable`), each found only by chance. This test parses every
 * `import ... from "@vireocodedev/starter-ui"` in the `.mdx` docs and in the
 * story demos, and asserts the symbol is actually exported from the barrel.
 */

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");
const barrel = join(srcRoot, "index.ts");

const PACKAGE_NAME = "@vireocodedev/starter-ui";

/** Resolves a barrel-style `@/foo` specifier to a file on disk. */
function resolveSpecifier(specifier: string, fromFile: string): string | undefined {
  const base = specifier.startsWith("@/")
    ? join(srcRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(fromFile), specifier)
      : undefined;

  if (!base) return undefined;

  const candidates = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  return candidates.find(candidate => existsSync(candidate));
}

function hasExportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node)
    ? (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    : false;
}

/** Collects every named export of a module, following `export *` chains. */
function collectExports(file: string, seen = new Set<string>()): Set<string> {
  const names = new Set<string>();
  if (seen.has(file)) return names;
  seen.add(file);

  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
        continue;
      }

      // `export * from "..."` - recurse into local modules only.
      const specifier = statement.moduleSpecifier;
      if (!specifier || !ts.isStringLiteral(specifier)) continue;
      const target = resolveSpecifier(specifier.text, file);
      if (target) for (const name of collectExports(target, seen)) names.add(name);
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

const DOC_EXTENSIONS = [".mdx", ".ts", ".tsx"];

function findDocFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) return findDocFiles(full);
    return DOC_EXTENSIONS.some(extension => full.endsWith(extension)) ? [full] : [];
  });
}

interface DocReference {
  doc: string;
  symbol: string;
}

/** Extracts the named specifiers of every `starter-ui` import in a doc or story. */
function extractReferences(file: string): DocReference[] {
  const content = readFileSync(file, "utf8");
  const doc = relative(packageRoot, file);
  // `[^}]` keeps each match bounded to a single import clause, including
  // multi-line ones, without running past the closing brace into later prose.
  const importPattern = new RegExp(`import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${PACKAGE_NAME}["']`, "g");

  const references: DocReference[] = [];

  for (const match of content.matchAll(importPattern)) {
    for (const raw of (match[1] ?? "").split(",")) {
      const symbol = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim();

      if (symbol) references.push({ doc, symbol });
    }
  }

  return references;
}

describe("starter-ui docs contract", () => {
  const exported = collectExports(barrel);
  const references = findDocFiles(srcRoot).flatMap(extractReferences);

  it("resolves the package barrel", () => {
    expect(exported.size).toBeGreaterThan(100);
  });

  it("finds documented imports to verify", () => {
    expect(references.length).toBeGreaterThan(50);
  });

  it("only documents symbols the package actually exports", () => {
    const missing = references
      .filter(({ symbol }) => !exported.has(symbol))
      .map(({ doc, symbol }) => `${symbol} (${doc})`);

    expect(missing).toEqual([]);
  });
});
