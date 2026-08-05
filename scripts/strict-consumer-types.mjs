#!/usr/bin/env node
/**
 * Compiles every published entry point's `.d.ts` the way a strict consumer would.
 *
 * The packages' own `typecheck` scripts compile *source*, and every project in
 * the repo runs with `skipLibCheck: true` — as does the app, as does almost
 * every downstream project. That combination hides a whole class of defect:
 * declarations that are only valid inside the package that emitted them.
 *
 * Three such defects shipped before this gate existed. A `@ts-expect-error` on a
 * return annotation, which suppresses nothing in the emitted `.d.ts`. A brand
 * type that the emitter expanded into references to `unique symbol`s no consumer
 * can name. An ambient module augmentation that `tsc` never copied to `dist`,
 * leaving an exported type asserting a namespace the consumer had not declared.
 *
 * None of them were visible from inside this repo. All three were immediately
 * visible to anyone compiling with `skipLibCheck: false`, which is exactly what
 * this script does.
 *
 * Run after `build` — it reads `dist`, not `src`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(repoRoot, "packages");

const COMPILER_FLAGS = [
  "--noEmit",
  "--skipLibCheck",
  "false",
  "--strict",
  "--target",
  "ES2022",
  "--module",
  "esnext",
  "--moduleResolution",
  "bundler",
  "--jsx",
  "react-jsx",
  "--lib",
  "ES2022,DOM,DOM.Iterable",
];

/** Collects the `.d.ts` file each `exports` subpath resolves to. */
function declarationEntryPoints(packageDir) {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
  const entries = [];

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    const types = typeof target === "string" ? undefined : target.types;
    if (!types) continue;

    const absolute = join(packageDir, types);
    if (!existsSync(absolute)) {
      entries.push({ subpath, path: absolute, missing: true });
      continue;
    }
    entries.push({ subpath, path: absolute, missing: false });
  }

  return { name: manifest.name, entries };
}

/**
 * Only failures inside our own `dist` count.
 *
 * A strict compile also drags in third-party declarations we do not control —
 * `workbox-core`, `vite-plugin-pwa` and friends all emit invalid `.d.ts`. Those
 * are somebody else's bug and must not fail this gate.
 */
function ownErrors(output, packageDir) {
  const distPrefix = join(packageDir, "dist");
  return output
    .split("\n")
    .filter(line => line.includes(distPrefix) && /error TS\d+/.test(line))
    .map(line => line.replace(`${repoRoot}/`, ""));
}

const packageDirs = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(dir => existsSync(join(dir, "package.json")));

let failed = false;

for (const packageDir of packageDirs) {
  const { name, entries } = declarationEntryPoints(packageDir);
  if (entries.length === 0) continue;

  const missing = entries.filter(entry => entry.missing);
  if (missing.length > 0) {
    failed = true;
    console.error(`${name}: declarations missing — run build first`);
    for (const entry of missing) console.error(`  ${entry.subpath} -> ${entry.path}`);
    continue;
  }

  let output = "";
  try {
    execFileSync("npx", ["tsc", ...COMPILER_FLAGS, ...entries.map(entry => entry.path)], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  }

  const errors = ownErrors(output, packageDir);
  if (errors.length > 0) {
    failed = true;
    console.error(`${name}: ${errors.length} declaration error(s) a strict consumer would hit`);
    for (const error of errors) console.error(`  ${error}`);
  } else {
    const subpaths = entries.map(entry => entry.subpath).join(", ");
    console.log(`${name}: ${subpaths} — clean under skipLibCheck false`);
  }
}

if (failed) {
  console.error("\nPublished declarations are not consumable with skipLibCheck disabled.");
  process.exit(1);
}

console.log("\nEvery published entry point compiles for a strict consumer.");
