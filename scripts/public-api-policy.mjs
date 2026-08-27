import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repoRoot, "packages");
const jvmRoot = join(repoRoot, "jvm");
const policy = JSON.parse(readFileSync(join(repoRoot, "contracts/public-api-policy.json"), "utf8"));
const allowedNpmAudiences = new Set(["application", "optional-integration", "authoring-tooling"]);
const allowedEnvironments = new Set(["browser", "worker", "node"]);
const allowedMavenAudiences = new Set(["application", "build-tooling"]);
const allowedSurfaceDispositions = new Set(["retain", "freeze-growth", "extract-next-major"]);
const allowedUiStabilities = new Set(["supported", "advanced", "deprecated", "pending-decision"]);
const problems = [];

function compareSets(label, expected, actual) {
  for (const missing of [...expected].filter(value => !actual.has(value)).sort()) {
    problems.push(`${label} is missing classification for ${missing}`);
  }
  for (const unexpected of [...actual].filter(value => !expected.has(value)).sort()) {
    problems.push(`${label} classifies nonexistent surface ${unexpected}`);
  }
}

const publishedPackages = readdirSync(packagesRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => join(packagesRoot, entry.name, "package.json"))
  .filter(existsSync)
  .map(path => ({ directory: dirname(path), manifest: JSON.parse(readFileSync(path, "utf8")) }))
  .filter(({ manifest }) => manifest.private !== true);

compareSets(
  "npm package policy",
  new Set(publishedPackages.map(({ manifest }) => manifest.name)),
  new Set(Object.keys(policy.npm ?? {})),
);

const npmSummary = { application: 0, "optional-integration": 0, "authoring-tooling": 0 };
for (const { directory, manifest } of publishedPackages) {
  const packagePolicy = policy.npm?.[manifest.name];
  if (!packagePolicy) continue;
  if (typeof packagePolicy.role !== "string" || packagePolicy.role.trim() === "") {
    problems.push(`${manifest.name} has no API role`);
  }

  const exported = new Set(Object.keys(manifest.exports ?? {}));
  const classified = new Set(Object.keys(packagePolicy.entryPoints ?? {}));
  compareSets(`${manifest.name} entry-point policy`, exported, classified);
  const surface = JSON.parse(readFileSync(join(directory, "api-surface.json"), "utf8"));

  for (const [subpath, entryPolicy] of Object.entries(packagePolicy.entryPoints ?? {})) {
    if (!allowedNpmAudiences.has(entryPolicy.audience)) {
      problems.push(`${manifest.name} ${subpath} has invalid audience ${entryPolicy.audience}`);
    } else {
      npmSummary[entryPolicy.audience] += 1;
    }
    if (!Array.isArray(entryPolicy.environment) || entryPolicy.environment.length === 0) {
      problems.push(`${manifest.name} ${subpath} must declare at least one environment`);
      continue;
    }
    for (const environment of entryPolicy.environment) {
      if (!allowedEnvironments.has(environment)) {
        problems.push(`${manifest.name} ${subpath} has invalid environment ${environment}`);
      }
    }
    if (entryPolicy.environment.includes("worker") && surface.entryPoints?.[subpath]?.workerSafe !== true) {
      problems.push(`${manifest.name} ${subpath} claims worker support without a worker-safe surface snapshot`);
    }
    if (manifest.name === "@vireocodedev/ui") {
      const symbolCount = surface.entryPoints?.[subpath]?.exports?.length;
      if (!Number.isInteger(entryPolicy.symbolBudget) || entryPolicy.symbolBudget < 0) {
        problems.push(`${manifest.name} ${subpath} must declare a non-negative symbol budget`);
      } else if (symbolCount > entryPolicy.symbolBudget) {
        problems.push(
          `${manifest.name} ${subpath} exports ${symbolCount} symbols, exceeding budget ${entryPolicy.symbolBudget}`,
        );
      }
      if (!allowedSurfaceDispositions.has(entryPolicy.disposition)) {
        problems.push(`${manifest.name} ${subpath} has invalid surface disposition ${entryPolicy.disposition}`);
      }
      if (!allowedUiStabilities.has(entryPolicy.stability)) {
        problems.push(`${manifest.name} ${subpath} has invalid stability ${entryPolicy.stability}`);
      }
      if (typeof entryPolicy.guidance !== "string" || entryPolicy.guidance.trim() === "") {
        problems.push(`${manifest.name} ${subpath} has no consumer guidance`);
      }
      if (
        entryPolicy.stability === "deprecated" &&
        (typeof entryPolicy.migration !== "string" || entryPolicy.migration.trim() === "")
      ) {
        problems.push(`${manifest.name} ${subpath} is deprecated without migration guidance`);
      }
    }
  }
}

const uiSurfaceDocument = readFileSync(join(repoRoot, "packages/ui/docs/PUBLIC_SURFACE.md"), "utf8");
const uiSurface = JSON.parse(readFileSync(join(repoRoot, "packages/ui/api-surface.json"), "utf8"));
const uiSurfaceRows = new Map(
  uiSurfaceDocument
    .split(/\r?\n/u)
    .filter(line => line.startsWith("| `"))
    .map(line => {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map(cell => cell.trim());
      return [cells[0], cells];
    }),
);
const classifiedUiSymbols = new Map();
for (const [subpath, entryPolicy] of Object.entries(policy.npm?.["@vireocodedev/ui"]?.entryPoints ?? {})) {
  const symbolCount = uiSurface.entryPoints?.[subpath]?.exports?.length;
  const expectedCells = [
    `\`${subpath}\``,
    entryPolicy.stability,
    String(symbolCount),
    `\`${entryPolicy.disposition}\``,
  ];
  if (JSON.stringify(uiSurfaceRows.get(expectedCells[0])) !== JSON.stringify(expectedCells)) {
    problems.push(`packages/ui/docs/PUBLIC_SURFACE.md must classify ${subpath} as ${expectedCells.join(" / ")}`);
  }
  for (const symbol of uiSurface.entryPoints?.[subpath]?.exports ?? []) {
    const existingStability = classifiedUiSymbols.get(symbol);
    if (existingStability && existingStability !== entryPolicy.stability) {
      problems.push(
        `@vireocodedev/ui symbol ${symbol} has conflicting stability ${existingStability} and ${entryPolicy.stability}`,
      );
    }
    classifiedUiSymbols.set(symbol, entryPolicy.stability);
  }
}

const publishedJvmModules = readdirSync(jvmRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name.startsWith("vireo-"))
  .filter(entry => entry.name === "vireo-bom" || existsSync(join(jvmRoot, entry.name, "api-surface.txt")))
  .map(entry => `com.vireocode:${entry.name}`);
compareSets("Maven module policy", new Set(publishedJvmModules), new Set(Object.keys(policy.maven ?? {})));

let classifiedJvmDeclarations = 0;
for (const [coordinate, modulePolicy] of Object.entries(policy.maven ?? {})) {
  if (!allowedMavenAudiences.has(modulePolicy.audience)) {
    problems.push(`${coordinate} has invalid audience ${modulePolicy.audience}`);
  }
  if (typeof modulePolicy.role !== "string" || modulePolicy.role.trim() === "") {
    problems.push(`${coordinate} has no API role`);
  }
  const moduleName = coordinate.split(":")[1];
  const surfacePath = join(jvmRoot, moduleName, "api-surface.txt");
  if (!existsSync(surfacePath)) continue;

  const declarations = readFileSync(surfacePath, "utf8")
    .split(/\r?\n/)
    .filter(line => line.startsWith("public "));
  classifiedJvmDeclarations += declarations.length;
  if (!Number.isInteger(modulePolicy.declarationBudget) || modulePolicy.declarationBudget < 0) {
    problems.push(`${coordinate} must declare a non-negative public declaration budget`);
  } else if (declarations.length > modulePolicy.declarationBudget) {
    problems.push(
      `${coordinate} has ${declarations.length} public declarations, exceeding budget ${modulePolicy.declarationBudget}`,
    );
  }

  const packageIntents = Object.entries(modulePolicy.packageIntents ?? {});
  if (packageIntents.length === 0) problems.push(`${coordinate} has no public package-intent classification`);
  for (const [packageName, intent] of packageIntents) {
    if (typeof intent !== "string" || intent.trim() === "") {
      problems.push(`${coordinate} package ${packageName} has no API intent`);
    }
  }
  for (const declaration of declarations) {
    const declaredType = declaration.match(/\b(com\.vireocode(?:\.[A-Za-z_$][\w$]*)+)/)?.[1];
    if (!declaredType) {
      problems.push(`${coordinate} has an unreadable public declaration: ${declaration}`);
      continue;
    }
    if (!packageIntents.some(([packageName]) => declaredType.startsWith(`${packageName}.`))) {
      problems.push(`${coordinate} public declaration ${declaredType} has no package-intent classification`);
    }
  }
}

if (policy.schemaVersion !== 1) problems.push(`Unsupported policy schema version ${policy.schemaVersion}`);

if (problems.length > 0) {
  console.error("Public API policy failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log("Public API policy matches every published package and entry point.");
console.log(
  `npm: ${publishedPackages.length} packages, ${Object.values(npmSummary).reduce((sum, count) => sum + count, 0)} entry points (${npmSummary.application} application, ${npmSummary["optional-integration"]} optional integration, ${npmSummary["authoring-tooling"]} authoring tooling).`,
);
console.log(
  `Maven: ${publishedJvmModules.length} classified modules and ${classifiedJvmDeclarations} package-intent-classified public declarations.`,
);
console.log(`Starter UI: ${classifiedUiSymbols.size} uniquely named exports inherit one unambiguous stability class.`);
