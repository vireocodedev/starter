import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceRoot = join(packageRoot, "src");
const forbiddenPackages = new Set(["react", "react-dom", "@types/react", "@types/react-dom", "@mui/material"]);

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

describe("starter-history framework boundary", () => {
  it("contains no TSX or React-oriented source contract", () => {
    const sourceFiles = collectFiles(sourceRoot);

    expect(sourceFiles.filter(file => extname(file) === ".tsx")).toEqual([]);
    sourceFiles.forEach(file => {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/(?:from\s+|import\s*\()["'](?:react(?:-dom)?|@mui\/)/u);
      expect(source, file).not.toMatch(/\bReact(?:Node|Element|Component|\.)/u);
    });
  });

  it("declares no framework package at any dependency level", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as Record<
      string,
      Record<string, string> | undefined
    >;
    const dependencies = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ];

    expect(dependencies.filter(dependency => forbiddenPackages.has(dependency))).toEqual([]);
  });
});
