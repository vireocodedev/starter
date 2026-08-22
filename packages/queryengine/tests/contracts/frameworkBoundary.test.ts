import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceRoot = join(packageRoot, "src");

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

describe("starter-queryengine framework boundary", () => {
  it("contains no TSX, React contract, UI framework, or browser-global dependency", () => {
    const sourceFiles = collectFiles(sourceRoot);

    expect(sourceFiles.filter(file => extname(file) === ".tsx")).toEqual([]);
    sourceFiles.forEach(file => {
      const source = readFileSync(file, "utf8");
      const label = relative(packageRoot, file);
      expect(source, label).not.toMatch(
        /(?:from\s+|import\s*\()["'](?:react(?:-dom)?|@mui\/|@tanstack\/react-|@preact\/signals-react)/u,
      );
      expect(source, label).not.toMatch(/\bReact(?:Node|Element|Component|\.)/u);
      expect(source, label).not.toMatch(/\b(?:window|document|navigator)\b/u);
    });
  });

  it("declares only framework-free dependencies", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as Record<
      string,
      Record<string, string> | undefined
    >;
    const dependencies = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ];

    expect(
      dependencies.filter(dependency =>
        /^(?:react|react-dom|@mui\/|@tanstack\/react-|@preact\/signals-react)/u.test(dependency),
      ),
    ).toEqual([]);
  });
});
