import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repositoryRoot, "packages");
const expectedPackages = new Map([
  ["history", "@vireocodedev/history"],
  ["infrastructure", "@vireocodedev/infrastructure"],
  ["localization", "@vireocodedev/localization"],
  ["queryengine", "@vireocodedev/query"],
  ["shell", "@vireocodedev/shell"],
  ["sqlite", "@vireocodedev/sqlite"],
  ["ui", "@vireocodedev/ui"],
]);
const expectedRepository = "git+https://github.com/vireocodedev/starter.git";
const expectedRegistry = "https://registry.npmjs.org";

const pendingChangesets = readdirSync(join(repositoryRoot, ".changeset"))
  .filter(file => file.endsWith(".md"))
  .sort();
if (pendingChangesets.length > 0) {
  throw new Error(`Release PR has not been merged; pending changesets: ${pendingChangesets.join(", ")}`);
}

const manifests = [...expectedPackages].map(([directory, expectedName]) => {
  const path = join(packagesRoot, directory, "package.json");
  if (!existsSync(path)) throw new Error(`Missing public package manifest: ${path}`);
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (manifest.name !== expectedName) {
    throw new Error(`${directory} must publish as ${expectedName}, found ${manifest.name}.`);
  }
  if (manifest.private === true) throw new Error(`${manifest.name} is marked private.`);
  if (!/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u.test(manifest.version)) {
    throw new Error(`${manifest.name} must remain on the approved 0.x public release line.`);
  }
  if (
    manifest.publishConfig?.registry !== expectedRegistry ||
    manifest.publishConfig?.access !== "public" ||
    manifest.publishConfig?.provenance !== true
  ) {
    throw new Error(`${manifest.name} has incomplete public npm publication metadata.`);
  }
  if (
    manifest.repository?.type !== "git" ||
    manifest.repository?.url !== expectedRepository ||
    manifest.repository?.directory !== `packages/${directory}`
  ) {
    throw new Error(`${manifest.name} has incomplete trusted-publisher repository metadata.`);
  }
  return manifest;
});

const unpublished = [];
const alreadyPublished = [];
for (const manifest of manifests) {
  const coordinate = `${manifest.name}@${manifest.version}`;
  const endpoint = `${expectedRegistry}/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`;
  const response = await fetch(endpoint, { headers: { accept: "application/json" } });
  if (response.status === 404) unpublished.push(coordinate);
  else if (response.ok) alreadyPublished.push(coordinate);
  else throw new Error(`npm registry returned HTTP ${response.status} while checking ${coordinate}.`);
}

if (unpublished.length === 0) {
  throw new Error("Every manifest version is already immutable on npm; there is nothing to publish.");
}

console.log("Unpublished npm release candidates:");
for (const coordinate of unpublished) console.log(`  - ${coordinate}`);
if (alreadyPublished.length > 0) {
  console.log("Already-published workspace versions (Changesets will skip these):");
  for (const coordinate of alreadyPublished) console.log(`  - ${coordinate}`);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `unpublished=${JSON.stringify(unpublished)}\n`);
}
