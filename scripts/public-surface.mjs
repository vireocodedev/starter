/**
 * Public surface gate (roadmap steps 1.3 and 1.4).
 *
 * `exports` maps and barrel files make three promises that no compiler checks:
 *
 *   1. The set of entry points is deliberate. A wildcard subpath publishes every
 *      build artefact, so any internal rename becomes a breaking change and an
 *      honest semver bump becomes impossible.
 *   2. The list of symbols behind each entry point is stable. Today a symbol can
 *      be added or dropped by editing a barrel, with nothing forcing the author
 *      to decide whether that is a minor or a major.
 *   3. Entry points explicitly designated as worker-safe stay independent of
 *      React, MUI, and DOM-only modules.
 *
 * This script turns all three into a check. It records each package's surface in
 * `packages/<name>/api-surface.json` and fails when the code and the snapshot
 * disagree, so the snapshot has to be updated in the same commit - which is the
 * moment the changeset decision gets made.
 *
 * Usage:
 *   node scripts/public-surface.mjs            # check, exits non-zero on drift
 *   node scripts/public-surface.mjs --update   # accept the current surface
 *
 * The snapshots live beside each `package.json` so a surface change shows up in
 * review next to the version bump that should accompany it. They are excluded
 * from the published tarball by the `files` field.
 *
 * The `dependencies` recorded per entry point are the third-party modules that
 * entry point evaluates at runtime, followed through workspace packages. They
 * are what a consumer's bundler ends up pulling in, which is not the same list
 * as the package's own `dependencies` field.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyseExportsMap,
  collectExports,
  distTargetForEntry,
  isFrameworkSpecifier,
  readStarterPackages,
  runtimeGraph,
  sourceForEntry,
} from "./lib/module-graph.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repoRoot, "packages");

const SNAPSHOT_FILE = "api-surface.json";
const update = process.argv.includes("--update");

/**
 * Entry points that must stay loadable in a Web Worker.
 *
 * The consuming app runs its SQLite engine in a worker, where `window` and
 * `document` do not exist and evaluating a React or MUI module throws on import.
 * These three entry points are what that worker imports, so the framework-free
 * property is part of their contract rather than an accident of the current code.
 */
const WORKER_SAFE_ENTRY_POINTS = {
  "@vireocodedev/starter-sqlite": [".", "./offline"],
};

/* ------------------------------------------------------------------ *
 * Measure
 * ------------------------------------------------------------------ */

function measure(pkg) {
  const problems = [];
  const { declared, wildcards } = analyseExportsMap(pkg.directory, pkg.manifest.exports);

  for (const { subpath } of wildcards) {
    problems.push(
      `${subpath} is a wildcard subpath - it publishes every build artefact, so no internal rename can be a patch.`,
    );
  }

  if (declared.length === 0) problems.push("declares no entry points at all.");

  const distBuilt = existsSync(join(pkg.directory, "dist"));
  const workerSafeSubpaths = WORKER_SAFE_ENTRY_POINTS[pkg.name] ?? [];
  const entryPoints = {};

  for (const { subpath, target } of declared) {
    const runtimeTarget = distTargetForEntry(target);
    const typesTarget = typeof target === "object" ? target.types : undefined;

    if (!runtimeTarget) problems.push(`${subpath} declares no "import" or "default" target.`);
    if (!typesTarget) problems.push(`${subpath} declares no "types" target - consumers get no declarations.`);

    for (const [condition, value] of [
      ["runtime", runtimeTarget],
      ["types", typesTarget],
    ]) {
      if (distBuilt && value && !existsSync(join(pkg.directory, value))) {
        problems.push(`${subpath} points its ${condition} condition at ${value}, which the build does not produce.`);
      }
    }

    const sourceFile = sourceForEntry(pkg.directory, target);
    if (!sourceFile) {
      problems.push(`${subpath} has no source file behind ${runtimeTarget ?? "its target"}.`);
      continue;
    }

    const { files, external } = runtimeGraph(sourceFile, pkg.srcRoot, packagesRoot);

    if (workerSafeSubpaths.includes(subpath)) {
      const offenders = [...external.entries()]
        .filter(([specifier]) => isFrameworkSpecifier(specifier))
        .map(([specifier, importer]) => `${specifier} via ${relative(repoRoot, importer)}`);

      for (const offender of offenders) {
        problems.push(`${subpath} must stay worker-safe but reaches a framework module: ${offender}.`);
      }

      const components = [...files].filter(file => file.endsWith(".tsx")).map(file => relative(repoRoot, file));
      for (const component of components) {
        problems.push(`${subpath} must stay worker-safe but pulls in a component module: ${component}.`);
      }
    }

    entryPoints[subpath] = {
      exports: [...collectExports(sourceFile, pkg.srcRoot)].sort(),
      dependencies: [...external.keys()].sort(),
      workerSafe: workerSafeSubpaths.includes(subpath),
    };
  }

  return { snapshot: { package: pkg.name, entryPoints }, problems };
}

/* ------------------------------------------------------------------ *
 * Compare
 * ------------------------------------------------------------------ */

function diffLists(before, after) {
  const removed = before.filter(item => !after.includes(item));
  const added = after.filter(item => !before.includes(item));
  return { removed, added };
}

function describeDrift(previous, current) {
  const lines = [];

  const previousSubpaths = Object.keys(previous.entryPoints ?? {});
  const currentSubpaths = Object.keys(current.entryPoints);
  const subpathDrift = diffLists(previousSubpaths, currentSubpaths);

  for (const subpath of subpathDrift.removed) lines.push(`  - entry point ${subpath} was removed (breaking)`);
  for (const subpath of subpathDrift.added) lines.push(`  + entry point ${subpath} was added`);

  for (const subpath of currentSubpaths) {
    const before = previous.entryPoints?.[subpath];
    if (!before) continue;
    const after = current.entryPoints[subpath];

    for (const field of ["exports", "dependencies"]) {
      const { removed, added } = diffLists(before[field] ?? [], after[field]);
      for (const name of removed)
        lines.push(`  - ${subpath} no longer ${field === "exports" ? "exports" : "needs"} ${name} (breaking)`);
      for (const name of added) lines.push(`  + ${subpath} now ${field === "exports" ? "exports" : "needs"} ${name}`);
    }

    if (before.workerSafe !== after.workerSafe) {
      lines.push(`  ! ${subpath} changed its worker-safe guarantee: ${before.workerSafe} -> ${after.workerSafe}`);
    }
  }

  return lines;
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

let failed = false;
let written = 0;

for (const pkg of readStarterPackages(packagesRoot)) {
  const { snapshot, problems } = measure(pkg);
  const snapshotPath = join(pkg.directory, SNAPSHOT_FILE);
  const serialised = `${JSON.stringify(snapshot, null, 2)}\n`;

  if (problems.length > 0) {
    failed = true;
    console.error(`${pkg.name}`);
    for (const problem of problems) console.error(`  x ${problem}`);
    console.error("");
    continue;
  }

  const previous = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : undefined;

  if (update) {
    if (previous === undefined || readFileSync(snapshotPath, "utf8") !== serialised) {
      writeFileSync(snapshotPath, serialised);
      written += 1;
      console.log(`${pkg.name}: wrote ${relative(repoRoot, snapshotPath)}`);
    }
    continue;
  }

  if (previous === undefined) {
    failed = true;
    console.error(`${pkg.name}`);
    console.error(`  x no ${SNAPSHOT_FILE} recorded - run "npm run surface:update" and review the result.`);
    console.error("");
    continue;
  }

  const drift = describeDrift(previous, snapshot);
  if (drift.length > 0) {
    failed = true;
    console.error(`${pkg.name}: public surface changed`);
    for (const line of drift) console.error(line);
    console.error("");
  }
}

if (update) {
  console.log(written === 0 ? "Public surface snapshots are already current." : `Updated ${written} snapshot(s).`);
  process.exit(0);
}

if (failed) {
  console.error("The public surface no longer matches its snapshot.");
  console.error("");
  console.error("If the change is intended, run:");
  console.error("  npm run surface:update");
  console.error("and add a changeset recording it as a patch, minor or major.");
  process.exit(1);
}

console.log("Public surface matches its snapshot for every package.");
