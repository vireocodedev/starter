import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sitePolicy = readJson(join(root, "site/site-policy.json"));
const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
const contentManifest = readJson(join(root, "site/content/manifest.json"));
const artifactRequested = process.argv.includes("--artifact");
const unexpectedArguments = process.argv.slice(2).filter(argument => argument !== "--artifact");
const problems = [];

if (unexpectedArguments.length > 0) problems.push(`unexpected arguments: ${unexpectedArguments.join(" ")}`);
if (sitePolicy.schemaVersion !== 1) problems.push("site policy schemaVersion must be 1");
if (sitePolicy.canonicalUrl !== "https://vireocode.com/")
  problems.push("site policy canonicalUrl must be https://vireocode.com/");
if (typeof sitePolicy.title !== "string" || sitePolicy.title.length < 20)
  problems.push("site policy must provide a descriptive title");
if (typeof sitePolicy.description !== "string" || sitePolicy.description.length < 80)
  problems.push("site policy must provide a useful search/social description");
if (!/^\d{4}-\d{2}-\d{2}$/u.test(sitePolicy.maturity?.reviewed ?? ""))
  problems.push("site maturity must have a reviewed YYYY-MM-DD date");
if (!sitePolicy.maturity?.summary?.includes("not yet claimed"))
  problems.push("site maturity must preserve the explicit unclaimed-readiness boundary");

const requiredLinks = [
  "documentation",
  "versions",
  "typescriptApi",
  "jvmApi",
  "demo",
  "template",
  "quickstart",
  "tutorial",
  "comparison",
  "architecture",
  "frontendProfile",
  "security",
  "roadmap",
  "compatibility",
  "migration",
  "discussions",
  "feedback",
  "adopterCheckIn",
  "contributing",
];
for (const name of requiredLinks) {
  const value = sitePolicy.links?.[name];
  if (typeof value !== "string" || !value.startsWith("https://"))
    problems.push(`site link ${name} must be an HTTPS URL`);
}
if (sitePolicy.links?.documentation !== "https://vireocode.com/docs/")
  problems.push("the canonical documentation link must be the main Vireo website");
if (sitePolicy.links?.versions !== "https://vireocode.com/versions/")
  problems.push("the canonical versions link must be the main Vireo website");
if (sitePolicy.links?.demo !== "https://demo.vireocode.com")
  problems.push("site demo link must use the canonical public flagship host");
const community = readFileSync(join(root, "site/content/community.md"), "utf8");
for (const link of [sitePolicy.links?.feedback, sitePolicy.links?.adopterCheckIn]) {
  if (!community.includes(link)) problems.push(`community page must link directly to ${link}`);
}

const currentRelease = documentationPolicy.releases?.find(release => release.id === documentationPolicy.currentRelease);
if (!currentRelease) {
  problems.push(`current documentation release ${documentationPolicy.currentRelease} is missing`);
} else {
  if (!currentRelease.npm?.some(entry => entry.package === "create-vireo"))
    problems.push(`current documentation release ${currentRelease.id} must declare create-vireo`);
  if (!/^0\.\d+$/u.test(currentRelease.documentationVersion ?? ""))
    problems.push("current documentation release must declare a friendly 0.x minor version");
  if (currentRelease.documentationLabel !== `Vireo ${currentRelease.documentationVersion}`)
    problems.push("current documentation label must match the friendly version");
  if (!/^[a-f0-9]{40}$/u.test(currentRelease.template?.commit ?? ""))
    problems.push("current documentation release must pin an exact template commit");
}

if (contentManifest.schemaVersion !== 1) problems.push("site content manifest schemaVersion must be 1");
if (contentManifest.documentationVersion !== currentRelease?.documentationVersion)
  problems.push("site content and release documentation versions must match");
const contentPages = [
  ...(contentManifest.sections ?? []).flatMap(section => section.pages),
  ...(contentManifest.standalone ?? []),
];
if (contentPages.length < 30) problems.push("the main website must publish at least 30 canonical documentation pages");
if (new Set(contentPages.map(page => page.path)).size !== contentPages.length)
  problems.push("site content routes must be unique");

if (artifactRequested && currentRelease) validateArtifact(currentRelease, contentPages);

if (problems.length > 0) {
  console.error("Website policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Website policy passed for Vireo ${currentRelease?.documentationVersion} (${documentationPolicy.currentRelease})` +
    `${artifactRequested ? `, including ${contentPages.length} canonical content pages and the production artifact` : ""}.`,
);

function validateArtifact(release, declaredPages) {
  const outputRoot = join(root, "site/dist");
  const requiredPaths = [
    ".nojekyll",
    "404.html",
    "assets/favicon.svg",
    "assets/asset-manifest.json",
    "docs/index.html",
    `docs/${release.documentationVersion}/index.html`,
    `docs/${release.documentationVersion}/search-index.json`,
    "docs/getting-started/index.html",
    "docs/concepts/architecture/index.html",
    "docs/design-system/index.html",
    "docs/design-system/visual-language/index.html",
    "docs/design-system/loading-states/index.html",
    "docs/cli/doctor/index.html",
    "examples/index.html",
    "healthz",
    "index.html",
    "manifest.webmanifest",
    "reference/index.html",
    "reference/typescript/index.html",
    "reference/java/index.html",
    "robots.txt",
    "roadmap/index.html",
    "search-index.json",
    "site.json",
    "sitemap.xml",
    "storybook/index.html",
    "sw.js",
    "versions/index.html",
    "versions.json",
  ];
  for (const path of requiredPaths)
    if (!existsSync(join(outputRoot, path))) problems.push(`website artifact is missing ${path}`);
  if (!existsSync(join(outputRoot, "index.html")) || !existsSync(join(outputRoot, "site.json"))) return;

  const landing = readFileSync(join(outputRoot, "index.html"), "utf8");
  const docs = readFileSync(join(outputRoot, "docs/index.html"), "utf8");
  const designSystem = readFileSync(join(outputRoot, "docs/design-system/index.html"), "utf8");
  const visualLanguage = readFileSync(join(outputRoot, "docs/design-system/visual-language/index.html"), "utf8");
  const offline = readFileSync(join(outputRoot, "docs/offline/index.html"), "utf8");
  const snapshot = readFileSync(join(outputRoot, "docs", release.documentationVersion, "index.html"), "utf8");
  const generated = readJson(join(outputRoot, "site.json"));
  const versions = readJson(join(outputRoot, "versions.json"));
  const search = readJson(join(outputRoot, "search-index.json"));
  const versionedSearch = readJson(join(outputRoot, "docs", release.documentationVersion, "search-index.json"));
  const assetManifest = readJson(join(outputRoot, "assets/asset-manifest.json"));
  const manifest = readJson(join(outputRoot, "manifest.webmanifest"));
  const worker = readFileSync(join(outputRoot, "sw.js"), "utf8");
  const sitemap = readFileSync(join(outputRoot, "sitemap.xml"), "utf8");

  if (generated.schemaVersion !== 2) problems.push("generated website schemaVersion must be 2");
  if (generated.canonicalUrl !== sitePolicy.canonicalUrl)
    problems.push("generated website canonical URL drifted from site policy");
  if (generated.documentation?.version !== release.documentationVersion)
    problems.push("generated friendly documentation version drifted from release policy");
  if (generated.currentRelease?.id !== release.id)
    problems.push("generated website release drifted from documentation policy");
  const createVireo = release.npm.find(entry => entry.package === "create-vireo");
  if (generated.currentRelease?.createVireo !== createVireo?.version)
    problems.push("generated website create-vireo version drifted from documentation policy");
  if (JSON.stringify(generated.currentRelease?.npm) !== JSON.stringify(release.npm))
    problems.push("generated website npm versions drifted from documentation policy");
  if (JSON.stringify(generated.currentRelease?.jvm) !== JSON.stringify(release.jvm))
    problems.push("generated website JVM versions drifted from documentation policy");
  if (JSON.stringify(generated.currentRelease?.template) !== JSON.stringify(release.template))
    problems.push("generated website template pin drifted from documentation policy");
  if (versions.currentDocumentationVersion !== release.documentationVersion)
    problems.push("generated versions index has the wrong friendly version");
  if (!/^\/assets\/site\.[a-f0-9]{12}\.css$/u.test(assetManifest["site.css"] ?? ""))
    problems.push("generated CSS must have a content fingerprint");
  if (!/^\/assets\/site\.[a-f0-9]{12}\.js$/u.test(assetManifest["site.js"] ?? ""))
    problems.push("generated JavaScript must have a content fingerprint");
  if (
    !existsSync(join(outputRoot, (assetManifest["site.css"] ?? "").slice(1))) ||
    !existsSync(join(outputRoot, (assetManifest["site.js"] ?? "").slice(1)))
  )
    problems.push("generated fingerprinted assets are missing");
  if (manifest.start_url !== "/docs/" || manifest.scope !== "/")
    problems.push("generated web manifest must retain the documentation PWA scope");
  if (
    !worker.includes('self.addEventListener("fetch"') ||
    !worker.includes(`/${release.documentationVersion}/search-index.json`)
  )
    problems.push("generated service worker is missing offline route/search precache behavior");
  if (
    worker.includes("skipWaiting") ||
    worker.includes("caches.match(") ||
    !worker.includes("caches.open(CACHE)") ||
    !worker.includes("offlineNotFound")
  )
    problems.push(
      "generated service worker must use its named cache, preserve unknown-route 404s, and avoid forced activation",
    );
  if (!worker.includes("url.origin !== self.location.origin"))
    problems.push("generated service worker must not cache cross-origin responses");
  if (!Array.isArray(search)) {
    problems.push("search index must be an array");
  } else {
    const searchUrls = [];
    for (const entry of search) {
      if (typeof entry?.url !== "string") problems.push("every search index entry must provide a string URL");
      else searchUrls.push(entry.url);
    }
    if (new Set(searchUrls).size !== searchUrls.length || searchUrls.length !== search.length)
      problems.push("search index URLs must be unique");
    for (const page of declaredPages) {
      const canonicalUrl = normalizeRoute(page.path);
      const count = searchUrls.filter(url => url === canonicalUrl).length;
      if (count !== 1) problems.push(`search index must contain canonical content URL ${canonicalUrl} exactly once`);
    }
  }
  if (
    !Array.isArray(versionedSearch) ||
    !versionedSearch.some(entry => entry.url === `/docs/${release.documentationVersion}/offline/`)
  )
    problems.push("versioned search index must contain the versioned offline route");
  if (
    Array.isArray(versionedSearch) &&
    versionedSearch.some(
      entry => entry.url.startsWith("/docs/") && !entry.url.startsWith(`/docs/${release.documentationVersion}/`),
    )
  )
    problems.push("versioned search index must not point documentation entries at the current alias");

  for (const expected of [
    sitePolicy.canonicalUrl,
    sitePolicy.links.demo,
    `create-vireo ${createVireo.version}`,
    "Build the workflow.",
    "--profile frontend",
    "/docs/getting-started/",
    "data-search-open",
    assetManifest["site.css"],
    assetManifest["site.js"],
  ]) {
    if (!landing.includes(expected)) problems.push(`generated landing page is missing ${expected}`);
  }
  for (const expected of [
    "Vireo documentation",
    "On this page",
    "/docs/concepts/architecture/",
    "/docs/design-system/",
    "Design system",
    `Vireo ${release.documentationVersion}`,
  ]) {
    if (!docs.includes(expected)) problems.push(`generated documentation home is missing ${expected}`);
  }
  for (const expected of ["Visual language", "Loading states", "Ownership boundaries"]) {
    if (!designSystem.includes(expected)) problems.push(`generated design-system overview is missing ${expected}`);
  }
  for (const expected of ["semantic surfaces", "VISUAL_LANGUAGE.md"]) {
    if (!visualLanguage.includes(expected)) problems.push(`generated visual-language page is missing ${expected}`);
  }
  if (
    !visualLanguage.includes(
      "https://github.com/vireocodedev/vireo-template/blob/a670d7f95f720a91705c7c156d19e605582fb4c8/frontend/docs/VISUAL_LANGUAGE.md",
    )
  )
    problems.push("generated visual-language page must retain pinned source provenance");
  for (const expected of [
    "NetworkOnly",
    "capabilities.offline: false",
    "clearing site data removes application-owned offline state",
    "Pinned Starter Template offline contract",
    "a670d7f95f720a91705c7c156d19e605582fb4c8",
    "b068ba6b51c4c93430b0fed167cd3427e7082277",
  ]) {
    if (!offline.includes(expected)) problems.push(`generated offline page is missing ${expected}`);
  }
  if (!snapshot.includes(`data-search-index-url=\"/docs/${release.documentationVersion}/search-index.json\"`))
    problems.push("versioned documentation must select its version-scoped search index");
  for (const expected of ['aria-controls="documentation-navigation"', "data-navigation-close", 'aria-live="polite"']) {
    if (!docs.includes(expected)) problems.push(`generated documentation misses accessibility semantics ${expected}`);
  }
  for (const forbidden of [
    "undefined",
    "javascript:",
    "<script>",
    'href="https://vireocodedev.github.io/vireo/docs/"',
  ]) {
    if (landing.includes(forbidden) || docs.includes(forbidden))
      problems.push(`generated website contains forbidden value ${forbidden}`);
  }
  if (readFileSync(join(outputRoot, "healthz"), "utf8") !== "ok\n")
    problems.push("website healthz response must be exactly ok");
  if ((sitemap.match(/<url>/gu) ?? []).length < declaredPages.length + 1)
    problems.push("website sitemap must include every canonical page and the landing page");
  if (!sitemap.includes("https://vireocode.com/docs/getting-started/"))
    problems.push("website sitemap must include documentation routes");
  if (!sitemap.includes("https://vireocode.com/docs/design-system/loading-states/"))
    problems.push("website sitemap must include design-system routes");
  if (countFiles(outputRoot, "index.html") < 50)
    problems.push("website artifact must contain the current and version-specific multi-page route set");
}

function countFiles(directory, fileName) {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countFiles(join(directory, entry.name), fileName);
    else if (entry.name === fileName) count += 1;
  }
  return count;
}

function normalizeRoute(route) {
  return route === "/" || route.endsWith("/") ? route : `${route}/`;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
