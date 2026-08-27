import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = join(root, "contracts/documentation-release-policy.json");
const policy = readJson(policyPath);
const problems = [];
const artifactRequested = process.argv.includes("--artifact");
const unexpectedArguments = process.argv.slice(2).filter(argument => argument !== "--artifact");

if (unexpectedArguments.length > 0) problems.push(`unexpected arguments: ${unexpectedArguments.join(" ")}`);
if (policy.schemaVersion !== 1) problems.push("documentation policy schemaVersion must be 1");
if (policy.publicBaseUrl !== "https://vireocodedev.github.io/starter") {
  problems.push("documentation policy must use the canonical public GitHub Pages URL");
}
if (!Array.isArray(policy.releases) || policy.releases.length === 0) {
  problems.push("documentation policy must declare at least one release");
}

const releaseIds = new Set();
for (const release of policy.releases ?? []) {
  if (!/^[a-z0-9][a-z0-9._-]+$/.test(release.id ?? "")) {
    problems.push(`invalid documentation release id: ${JSON.stringify(release.id)}`);
  }
  if (releaseIds.has(release.id)) problems.push(`duplicate documentation release id: ${release.id}`);
  releaseIds.add(release.id);
  if (!["current", "historical"].includes(release.status)) {
    problems.push(`documentation release ${release.id} has invalid status ${release.status}`);
  }
  if (release.status === "historical") {
    if (!release.archivePath?.startsWith("docs/documentation-archives/")) {
      problems.push(`historical release ${release.id} must declare a source-owned documentation archive`);
    } else {
      for (const requiredPath of [
        "index.html",
        "search-index.json",
        "storybook/index.html",
        "api/typescript/index.html",
        "api/jvm/index.html",
      ]) {
        if (!existsSync(join(root, release.archivePath, requiredPath))) {
          problems.push(`historical release ${release.id} archive is missing ${requiredPath}`);
        }
      }
    }
  }
}

const current = policy.releases?.find(release => release.id === policy.currentRelease);
if (!current) problems.push(`current documentation release ${policy.currentRelease} is not declared`);
const currentStatuses = (policy.releases ?? []).filter(release => release.status === "current");
if (currentStatuses.length !== 1 || currentStatuses[0]?.id !== policy.currentRelease) {
  problems.push("exactly one release must be current and it must match currentRelease");
}

const packageRecords = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => ({ directory: entry.name, manifestPath: join(root, "packages", entry.name, "package.json") }))
  .filter(record => existsSync(record.manifestPath))
  .map(record => ({ directory: record.directory, manifest: readJson(record.manifestPath) }))
  .filter(record => record.manifest.private !== true);

if (current) {
  const declaredPackages = new Map(current.npm?.map(entry => [entry.package, entry.version]));
  for (const { manifest } of packageRecords) {
    if (declaredPackages.get(manifest.name) !== manifest.version) {
      problems.push(
        `documentation release must match ${manifest.name} ${manifest.version}; found ${
          declaredPackages.get(manifest.name) ?? "no entry"
        }`,
      );
    }
  }
  for (const packageName of declaredPackages.keys()) {
    if (!packageRecords.some(record => record.manifest.name === packageName)) {
      problems.push(`documentation release declares unknown npm package ${packageName}`);
    }
  }

  const gradleVersion = readFileSync(join(root, "jvm/gradle.properties"), "utf8").match(/^version=(.+)$/m)?.[1];
  if (current.jvm?.group !== "com.vireocode") problems.push("JVM documentation group must be com.vireocode");
  if (current.jvm?.version !== gradleVersion) {
    problems.push(`documentation JVM version must match ${gradleVersion}; found ${current.jvm?.version}`);
  }
  const expectedModules = ["vireo-auth", "vireo-bom", "vireo-core", "vireo-history", "vireo-offline", "vireo-query"];
  const actualModules = [...(current.jvm?.modules ?? [])].sort();
  if (JSON.stringify(actualModules) !== JSON.stringify(expectedModules)) {
    problems.push("documentation release must link all six published JVM modules exactly once");
  }
  for (const link of ["source", "npm", "jvm", "jvmTag", "compatibility", "migration"]) {
    if (!current.releaseLinks?.[link]?.startsWith("https://")) {
      problems.push(`documentation release link ${link} must be an HTTPS URL`);
    }
  }
}

const workflow = readFileSync(join(root, ".github/workflows/storybook-pages.yml"), "utf8");
for (const command of [
  "corepack npm run build-storybook",
  "./jvm/gradlew -p jvm aggregateJavadoc",
  "corepack npm run docs:portal",
  "corepack npm run docs:check:artifact",
]) {
  if (!workflow.includes(command)) problems.push(`Pages workflow must execute ${command}`);
}

if (artifactRequested && current) validateArtifact(current);

if (problems.length > 0) {
  console.error("Documentation policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Documentation policy passed for ${policy.currentRelease}: ${packageRecords.length} npm packages and ${
    current?.jvm?.modules?.length ?? 0
  } JVM modules${artifactRequested ? ", including the generated public artifact" : ""}.`,
);

function validateArtifact(release) {
  const outputRoot = join(root, "packages/ui/storybook-static");
  const versionRoot = join(outputRoot, "versions", release.id);
  for (const path of [
    "index.html",
    "search-index.json",
    "storybook/index.html",
    "storybook/index.json",
    "api/typescript/index.html",
    "api/jvm/index.html",
  ]) {
    if (!existsSync(join(versionRoot, path))) problems.push(`generated documentation is missing ${path}`);
  }
  for (const path of [
    "docs/index.html",
    "latest/index.html",
    "versions/index.html",
    "api/typescript/index.html",
    "api/jvm/index.html",
    "versions.json",
  ]) {
    if (!existsSync(join(outputRoot, path))) problems.push(`generated stable route is missing ${path}`);
  }
  for (const releaseRecord of policy.releases) {
    if (!existsSync(join(outputRoot, "versions", releaseRecord.id, "index.html"))) {
      problems.push(`generated documentation is missing release ${releaseRecord.id}`);
    }
  }
  if (!existsSync(join(versionRoot, "search-index.json"))) return;

  const search = readJson(join(versionRoot, "search-index.json"));
  const generatedVersions = readJson(join(outputRoot, "versions.json"));
  if (generatedVersions.currentRelease !== policy.currentRelease) {
    problems.push("generated version index does not identify the current documentation release");
  }
  const generatedReleaseIds = generatedVersions.releases?.map(record => record.id);
  if (JSON.stringify(generatedReleaseIds) !== JSON.stringify(policy.releases.map(record => record.id))) {
    problems.push("generated version index does not preserve the declared release order");
  }
  for (const route of ["docs/index.html", "latest/index.html", "api/typescript/index.html", "api/jvm/index.html"]) {
    if (!readFileSync(join(outputRoot, route), "utf8").includes(release.id)) {
      problems.push(`generated stable route ${route} does not target ${release.id}`);
    }
  }

  const storybook = readJson(join(versionRoot, "storybook/index.json"));
  const expectedStorybookCount = Object.values(storybook.entries).filter(
    entry => entry.type === "docs" || entry.type === "story",
  ).length;
  const actualStorybookCount = search.filter(
    entry => entry.category === "Guide or component docs" || entry.category === "Component example",
  ).length;
  if (actualStorybookCount !== expectedStorybookCount) {
    problems.push(`generated Storybook search count is ${actualStorybookCount}; expected ${expectedStorybookCount}`);
  }

  const expectedTypeScriptCount = packageRecords.reduce((total, record) => {
    const surfacePath = join(root, "packages", record.directory, "api-surface.json");
    const surface = readJson(surfacePath);
    return (
      total + Object.values(surface.entryPoints).reduce((entryTotal, entry) => entryTotal + entry.exports.length, 0)
    );
  }, 0);
  const actualTypeScriptCount = search.filter(entry => entry.category === "TypeScript API").length;
  if (actualTypeScriptCount !== expectedTypeScriptCount) {
    problems.push(`generated TypeScript search count is ${actualTypeScriptCount}; expected ${expectedTypeScriptCount}`);
  }
  const expectedEntryPointPages = packageRecords.reduce(
    (total, record) =>
      total + Object.keys(readJson(join(root, "packages", record.directory, "api-surface.json")).entryPoints).length,
    0,
  );
  const actualEntryPointPages = readdirSync(join(versionRoot, "api/typescript")).filter(
    file => file.endsWith(".html") && file !== "index.html",
  ).length;
  if (actualEntryPointPages !== expectedEntryPointPages) {
    problems.push(`generated TypeScript page count is ${actualEntryPointPages}; expected ${expectedEntryPointPages}`);
  }
  for (const category of ["Guide or component docs", "TypeScript API", "JVM API", "JVM member"]) {
    if (!search.some(entry => entry.category === category)) {
      problems.push(`generated search has no ${category} entries`);
    }
  }
  for (const query of ["VireoPageLayout", "offline replay", "BaseService"]) {
    const terms = query.toLocaleLowerCase().split(/\s+/);
    const hasResult = search.some(entry => {
      const haystack = `${entry.label} ${entry.description} ${entry.category}`.toLocaleLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    if (!hasResult) problems.push(`generated search example ${query} has no result`);
  }
  const htmlCache = new Map();
  for (const entry of search) {
    const [urlWithoutFragment, fragment] = entry.url.split("#", 2);
    const targetPath = decodeURIComponent(urlWithoutFragment.split("?", 1)[0]);
    let resolvedTarget = join(versionRoot, targetPath);
    if (existsSync(resolvedTarget) && statSync(resolvedTarget).isDirectory()) {
      resolvedTarget = join(resolvedTarget, "index.html");
    }
    if (!existsSync(resolvedTarget)) {
      problems.push(`search entry ${entry.label} links to missing ${entry.url}`);
      if (problems.length > 30) return;
    }
    if (entry.category === "TypeScript API" && fragment && existsSync(resolvedTarget)) {
      if (!htmlCache.has(resolvedTarget)) htmlCache.set(resolvedTarget, readFileSync(resolvedTarget, "utf8"));
      if (!htmlCache.get(resolvedTarget).includes(`id="${decodeURIComponent(fragment)}"`)) {
        problems.push(`TypeScript search entry ${entry.label} links to missing anchor ${entry.url}`);
        if (problems.length > 30) return;
      }
    }
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
