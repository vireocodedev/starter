import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCheckedInDocumentationOwnership } from "./lib/documentation-ownership-contract.mjs";
import { countHtmlIdAttributes } from "./lib/reference-symbol-anchors.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = join(root, "contracts/documentation-release-policy.json");
const policy = readJson(policyPath);
const problems = [];
const ownershipContract = readJson(join(root, "contracts/documentation-ownership-contract.json"));
const ownership = checkCheckedInDocumentationOwnership(root, ownershipContract);
problems.push(...ownership.problems.map(problem => `ownership: ${problem}`));
const artifactRequested = process.argv.includes("--artifact");
const unexpectedArguments = process.argv.slice(2).filter(argument => argument !== "--artifact");

if (unexpectedArguments.length > 0) problems.push(`unexpected arguments: ${unexpectedArguments.join(" ")}`);
if (policy.schemaVersion !== 1) problems.push("documentation policy schemaVersion must be 1");
if (policy.publicBaseUrl !== "https://vireocodedev.github.io/vireo") {
  problems.push("documentation policy must use the canonical public GitHub Pages URL");
}
if (!Array.isArray(policy.releases) || policy.releases.length === 0) {
  problems.push("documentation policy must declare at least one release");
}

const releaseIds = new Set();
const documentationVersions = new Set();
for (const release of policy.releases ?? []) {
  if (!/^[a-z0-9][a-z0-9._-]+$/.test(release.id ?? "")) {
    problems.push(`invalid documentation release id: ${JSON.stringify(release.id)}`);
  }
  if (releaseIds.has(release.id)) problems.push(`duplicate documentation release id: ${release.id}`);
  releaseIds.add(release.id);
  if (!/^0\.\d+$/u.test(release.documentationVersion ?? "")) {
    problems.push(`documentation release ${release.id} must declare a friendly 0.x minor version`);
  }
  if (documentationVersions.has(release.documentationVersion)) {
    problems.push(`duplicate friendly documentation version: ${release.documentationVersion}`);
  }
  documentationVersions.add(release.documentationVersion);
  if (release.documentationLabel !== `Vireo ${release.documentationVersion}`) {
    problems.push(`documentation release ${release.id} label must match its friendly version`);
  }
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
  if (current.template?.repository !== "https://github.com/vireocodedev/vireo-template") {
    problems.push("documentation release must identify the canonical vireo-template repository");
  }
  if (!/^[a-f0-9]{40}$/u.test(current.template?.commit ?? "")) {
    problems.push("documentation release must pin an exact starter-template commit");
  }
  const createSource = readFileSync(join(root, "packages/create-vireo/src/index.ts"), "utf8");
  const generatedTemplateCommit = createSource.match(/TEMPLATE_COMMIT = "([a-f0-9]{40})"/u)?.[1];
  const createVireoVersion = createSource.match(/CREATE_VIREO_PACKAGE_VERSION = "([^"]+)"/u)?.[1];
  const templateTag = createVireoVersion ? `starter-template@${createVireoVersion}` : undefined;
  const templateReleaseUrl = templateTag
    ? `https://github.com/vireocodedev/vireo-template/releases/tag/${encodeURIComponent(templateTag)}`
    : undefined;
  if (current.template?.commit !== generatedTemplateCommit) {
    problems.push(`documentation template pin must match create-vireo ${generatedTemplateCommit ?? "source"}`);
  }
  if (current.template?.version !== createVireoVersion) {
    problems.push(`documentation template version must match create-vireo ${createVireoVersion ?? "source"}`);
  }
  if (current.template?.tag !== templateTag || !/^starter-template@\d+\.\d+\.\d+$/u.test(current.template?.tag ?? "")) {
    problems.push("documentation template tag must use the create-vireo starter-template@<semver> tag");
  }
  if (current.template?.releaseUrl !== templateReleaseUrl) {
    problems.push("documentation template release URL must match the encoded template tag");
  }
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
  for (const link of ["source", "npm", "jvm", "jvmTag", "template", "compatibility", "migration"]) {
    if (!current.releaseLinks?.[link]?.startsWith("https://")) {
      problems.push(`documentation release link ${link} must be an HTTPS URL`);
    }
  }
  if (current.releaseLinks?.template !== templateReleaseUrl) {
    problems.push("documentation release link template must match the encoded template tag");
  }
  const currentSourceSurfaces = ["README.md", "docs/architecture/frontend-only-profile.md", "site/content"];
  const staleTemplatePin = /github\.com\/vireocodedev\/(?:starter-template|vireo-template)\/blob\/([a-f0-9]{40})/gu;
  for (const surface of currentSourceSurfaces) {
    const paths = surface.endsWith(".md")
      ? [surface]
      : readdirSync(join(root, surface), { withFileTypes: true })
          .filter(entry => entry.isFile())
          .map(entry => join(surface, entry.name));
    for (const path of paths) {
      const contents = readFileSync(join(root, path), "utf8");
      for (const match of contents.matchAll(staleTemplatePin)) {
        if (match[1] !== current.template.commit)
          problems.push(`${path} pins stale Template commit ${match[1]}; expected ${current.template.commit}`);
      }
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
  const typeScriptSearch = search.filter(entry => entry.category === "TypeScript API");
  const typeScriptUrls = typeScriptSearch.map(entry => entry.url);
  if (typeScriptUrls.some(url => typeof url !== "string") || new Set(typeScriptUrls).size !== typeScriptUrls.length) {
    problems.push("generated TypeScript search URLs must be unique strings");
  }
  const generatedVersions = readJson(join(outputRoot, "versions.json"));
  if (generatedVersions.currentRelease !== policy.currentRelease) {
    problems.push("generated version index does not identify the current documentation release");
  }
  const generatedReleaseIds = generatedVersions.releases?.map(record => record.id);
  if (JSON.stringify(generatedReleaseIds) !== JSON.stringify(policy.releases.map(record => record.id))) {
    problems.push("generated version index does not preserve the declared release order");
  }
  for (const route of ["api/typescript/index.html", "api/jvm/index.html"]) {
    if (!readFileSync(join(outputRoot, route), "utf8").includes(release.id)) {
      problems.push(`generated stable route ${route} does not target ${release.id}`);
    }
  }
  for (const route of ["docs/index.html", "latest/index.html"]) {
    if (!readFileSync(join(outputRoot, route), "utf8").includes("https://vireocode.com/docs/")) {
      problems.push(`generated stable route ${route} does not target the main documentation website`);
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
  const htmlIdCounts = new Map();
  for (const entry of search) {
    if (typeof entry?.url !== "string") continue;
    const [urlWithoutFragment, fragment] = entry.url.split("#", 2);
    if (entry.category === "TypeScript API" && !fragment) {
      problems.push(`TypeScript search entry ${entry.label} must include a symbol anchor`);
      continue;
    }
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
      if (!htmlIdCounts.has(resolvedTarget)) {
        htmlIdCounts.set(resolvedTarget, countHtmlIdAttributes(readFileSync(resolvedTarget, "utf8")));
      }
      const anchorCount = htmlIdCounts.get(resolvedTarget).get(decodeURIComponent(fragment)) ?? 0;
      if (anchorCount !== 1) {
        problems.push(`TypeScript search entry ${entry.label} must link to exactly one anchor ${entry.url}`);
        if (problems.length > 30) return;
      }
    }
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
