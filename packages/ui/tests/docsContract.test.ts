import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
 * story demos, and asserts the symbol is actually exported.
 *
 * It checks against `api-surface.json` - the frozen public surface - rather than
 * against the barrel directly. A symbol can sit in a module the barrel never
 * re-exports, or behind an entry point the docs never mention; either way it is
 * not something a reader can import, so documenting it is a bug. The snapshot is
 * kept honest by `scripts/public-surface.mjs`.
 */

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(packageRoot, "src");

const PACKAGE_NAME = "@vireocodedev/starter-ui";

const surface = JSON.parse(readFileSync(join(packageRoot, "api-surface.json"), "utf8")) as {
  package: string;
  entryPoints: Record<string, { exports: string[] }>;
};

/** subpath (`.`, `./api`, ...) -> the symbols importable through it. */
const exportsBySubpath = new Map(
  Object.entries(surface.entryPoints).map(([subpath, entry]) => [subpath, new Set(entry.exports)]),
);

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
  subpath: string;
  symbol: string;
}

// `[^}]` keeps each match bounded to a single import clause, including
// multi-line ones, without running past the closing brace into later prose.
const IMPORT_PATTERN = new RegExp(
  `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${PACKAGE_NAME}(/[^"']+)?["']`,
  "g",
);

/** Extracts the named specifiers of every `starter-ui` import in a doc or story. */
function extractReferences(file: string): DocReference[] {
  const content = readFileSync(file, "utf8");
  const doc = relative(packageRoot, file);

  const references: DocReference[] = [];

  for (const match of content.matchAll(IMPORT_PATTERN)) {
    const subpath = match[2] ? `.${match[2]}` : ".";

    for (const raw of (match[1] ?? "").split(",")) {
      const symbol = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim();

      if (symbol) references.push({ doc, subpath, symbol });
    }
  }

  return references;
}

describe("starter-ui docs contract", () => {
  const references = findDocFiles(srcRoot).flatMap(extractReferences);

  it("resolves the frozen public surface", () => {
    expect(surface.package).toBe(PACKAGE_NAME);
    expect(exportsBySubpath.get(".")?.size ?? 0).toBeGreaterThan(100);
  });

  it("finds documented imports to verify", () => {
    expect(references.length).toBeGreaterThan(50);
  });

  it("only documents entry points the package declares", () => {
    const undeclared = references
      .filter(({ subpath }) => !exportsBySubpath.has(subpath))
      .map(({ doc, subpath }) => `${subpath} (${doc})`);

    expect([...new Set(undeclared)]).toEqual([]);
  });

  it("only documents symbols the matching entry point actually exports", () => {
    const missing = references
      .filter(({ subpath, symbol }) => exportsBySubpath.has(subpath) && !exportsBySubpath.get(subpath)!.has(symbol))
      .map(({ doc, subpath, symbol }) => `${symbol} from "${subpath}" (${doc})`);

    expect(missing).toEqual([]);
  });
});
