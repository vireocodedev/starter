import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Guards the package's entry points.
 *
 * Two promises are made by `exports` and neither is checked by the compiler:
 *
 *  1. The set of entry points is deliberate. A wildcard would make all 183 built
 *     modules public API, so every internal rename would be a breaking change.
 *  2. Every declared target resolves to a source file produced by the package
 *     build.
 */

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");
const storybookRoot = join(packageRoot, "storybook");
const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
  exports: Record<string, { import?: string; types?: string }>;
};

/** Resolves a `@/foo` or relative specifier to a file on disk. */
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

interface Graph {
  files: Set<string>;
  external: Map<string, string>;
}

/**
 * Walks the runtime module graph of an entry point.
 *
 * Type-only imports are skipped because they are erased before the module ever
 * reaches a worker; `apiutils` legitimately references table and helper types.
 */
function runtimeGraph(entry: string): Graph {
  const files = new Set<string>();
  const external = new Map<string, string>();

  const visit = (file: string): void => {
    if (files.has(file)) return;
    files.add(file);

    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

    const record = (specifier: string, typeOnly: boolean): void => {
      if (typeOnly) return;
      const local = resolveSpecifier(specifier, file);
      if (local) {
        visit(local);
        return;
      }
      if (specifier.startsWith("@/") || specifier.startsWith(".")) return;
      if (!external.has(specifier)) external.set(specifier, relative(packageRoot, file));
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

  visit(entry);
  return { files, external };
}

describe("package entry points", () => {
  it("declares every entry point explicitly", () => {
    const subpaths = Object.keys(manifest.exports);

    expect(subpaths).toEqual([
      ".",
      "./country",
      "./forms",
      "./hello-pangea-dnd",
      "./localization",
      "./sonner",
      "./tanstack-query",
      "./video",
      "./storybook",
      "./storybook/VireoIconContainer",
      "./storybook/VireoDockedSidePanel",
      "./storybook/VireoResponsiveOverlayFrame",
    ]);
  });

  it("exposes no wildcard subpath", () => {
    // A wildcard turns every built module into public API, which makes an
    // honest semver bump impossible for any internal rename.
    const wildcards = Object.keys(manifest.exports).filter(subpath => subpath.includes("*"));

    expect(wildcards).toEqual([]);
  });

  it("points every entry point at a file that the build produces", () => {
    for (const [subpath, target] of Object.entries(manifest.exports)) {
      const entry = target.import;
      expect(entry, `${subpath} declares no import target`).toBeDefined();

      const sourceTarget = entry!.replace(/^\.\/dist\//, "").replace(/\.js$/, ".ts");
      const sourceFile = sourceTarget.startsWith("storybook/")
        ? join(storybookRoot, sourceTarget.replace(/^storybook\//, ""))
        : join(srcRoot, sourceTarget);
      expect(existsSync(sourceFile), `${subpath} -> ${sourceFile} does not exist`).toBe(true);
    }
  });

  it("keeps published Storybook helpers independent from Storybook runtimes", () => {
    const entries = [
      join(storybookRoot, "index.ts"),
      join(storybookRoot, "VireoIconContainer", "index.ts"),
      join(storybookRoot, "VireoDockedSidePanel", "index.ts"),
      join(storybookRoot, "VireoResponsiveOverlayFrame", "index.ts"),
    ];
    const offenders = entries.flatMap(entry =>
      [...runtimeGraph(entry).external.entries()]
        .filter(
          ([specifier]) =>
            specifier === "storybook" || specifier.startsWith("storybook/") || specifier.startsWith("@storybook/"),
        )
        .map(([specifier, importer]) => `${specifier} (imported by ${importer})`),
    );

    expect(offenders).toEqual([]);
  });
});
