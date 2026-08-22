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
import { fork } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(repoRoot, "packages");
const compilerWorker = join(repoRoot, "scripts", "strict-consumer-types-worker.mjs");
const MAX_CONCURRENT_COMPILERS = Math.min(7, availableParallelism());

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
 * Runs one isolated consumer compilation without serializing other packages.
 * Structured IPC keeps diagnostics reliable and avoids parsing CLI formatting.
 */
function compileDeclarationEntryPoints(packageDir, entries) {
  return new Promise(resolveCompilation => {
    const child = fork(compilerWorker, [repoRoot, packageDir, ...entries.map(entry => entry.path)], {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "ignore", "ipc"],
    });
    let settled = false;

    child.once("message", result => {
      settled = true;
      resolveCompilation(result);
    });
    child.once("error", error => {
      if (settled) return;
      settled = true;
      resolveCompilation({ operationalError: error.message });
    });
    child.once("exit", (code, signal) => {
      if (settled) return;
      settled = true;
      resolveCompilation({
        operationalError: `Compiler worker exited before reporting a result (code ${code}, signal ${signal}).`,
      });
    });
  });
}

/** Maps independent checks with a bounded number of compiler processes. */
async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

const packageDirs = readdirSync(packagesDir)
  .map(name => join(packagesDir, name))
  .filter(dir => existsSync(join(dir, "package.json")));

const packageChecks = packageDirs
  .map(packageDir => ({ packageDir, ...declarationEntryPoints(packageDir) }))
  .filter(check => check.entries.length > 0);
const compilableChecks = packageChecks
  .filter(check => check.entries.every(entry => !entry.missing))
  .sort((left, right) => right.entries.length - left.entries.length || left.name.localeCompare(right.name));
const compilationResults = await mapConcurrent(compilableChecks, MAX_CONCURRENT_COMPILERS, async check => ({
  check,
  ...(await compileDeclarationEntryPoints(check.packageDir, check.entries)),
}));
const resultsByPackage = new Map(compilationResults.map(result => [result.check.packageDir, result]));

let failed = false;

for (const { packageDir, name, entries } of packageChecks) {
  const missing = entries.filter(entry => entry.missing);
  if (missing.length > 0) {
    failed = true;
    console.error(`${name}: declarations missing — run build first`);
    for (const entry of missing) console.error(`  ${entry.subpath} -> ${entry.path}`);
    continue;
  }

  const { compilerErrors = [], errors = [], operationalError } = resultsByPackage.get(packageDir);
  if (errors.length > 0) {
    failed = true;
    console.error(`${name}: ${errors.length} declaration error(s) a strict consumer would hit`);
    for (const error of errors) console.error(`  ${error}`);
  } else if (compilerErrors.length > 0) {
    failed = true;
    console.error(`${name}: strict consumer compiler failed unexpectedly`);
    for (const error of compilerErrors) console.error(`  ${error}`);
  } else if (operationalError) {
    failed = true;
    console.error(`${name}: strict consumer compiler failed unexpectedly`);
    console.error(operationalError);
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
