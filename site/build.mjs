import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, brotliDecompressSync, constants as zlibConstants } from "node:zlib";
import { allocateReferenceSymbolAnchors } from "../scripts/lib/reference-symbol-anchors.mjs";
import { renderWebsitePage } from "./app.mjs";
import { renderMarkdown } from "./markdown.mjs";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(siteRoot, "..");
const MAX_SNAPSHOT_BASE64_BYTES = 512 * 1024;
const MAX_SNAPSHOT_DECOMPRESSED_BYTES = 4 * 1024 * 1024;
const MAX_SNAPSHOT_FILE_BYTES = 768 * 1024;
const FRIENDLY_DOCUMENTATION_VERSION = /^0\.\d+$/u;

export function buildWebsite({ root = repositoryRoot, outputRoot = join(root, "site/dist") } = {}) {
  const sitePolicy = readJson(join(root, "site/site-policy.json"));
  const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
  const contentManifest = readJson(join(root, "site/content/manifest.json"));
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  validateContentManifest({ contentManifest, root, website });
  const archives = readSnapshotArchives({ documentationPolicy, root });
  validateCurrentSnapshotArchive({ archives, currentArchive: createCurrentSnapshotArchive({ root }), website });

  if (existsSync(outputRoot)) rmSync(outputRoot, { recursive: true, force: true });
  website.assets = copyStaticAssets({ outputRoot, root });

  const navigation = contentManifest.sections.map(section => ({
    label: section.label,
    pages: section.pages.map(page => normalizeManifestPage(page)),
  }));
  const allPageRecords = [
    ...navigation.flatMap(section => section.pages),
    ...contentManifest.standalone.map(normalizeManifestPage),
  ];
  const contentPages = allPageRecords.map(record => createContentPage({ record, root, website }));
  const renderedPages = [];

  const landing = createLandingPage(website);
  writePage({ allPages: allPageRecords, navigation, outputRoot, page: landing, website });
  renderedPages.push(landing);

  for (const page of contentPages) {
    writePage({ allPages: allPageRecords, navigation, outputRoot, page, website });
    renderedPages.push(page);
  }

  const notFound = createNotFoundPage();
  writeFileSync(
    join(outputRoot, "404.html"),
    renderWebsitePage({ website, page: notFound, navigation, allPages: allPageRecords }),
  );

  const searchIndex = [
    ...contentPages.map(page => ({
      category: page.category,
      description: page.description,
      label: page.title,
      text: page.searchText,
      url: page.path,
      version: website.documentation.version,
    })),
    ...createReferenceSearchIndex({ root, website }),
  ];
  writeJson(join(outputRoot, "search-index.json"), searchIndex);
  for (const archive of archives) {
    const archiveWebsite = {
      ...website,
      documentation: {
        ...website.documentation,
        label: archive.documentation.label,
        version: archive.documentation.version,
      },
    };
    for (const versionedPage of createArchivedVersionedPages(archive)) {
      writePage({
        allPages: archive.allPageRecords,
        navigation: archive.navigation,
        outputRoot,
        page: versionedPage,
        website: archiveWebsite,
      });
      renderedPages.push(versionedPage);
    }
    writeJson(join(outputRoot, "docs", archive.documentation.version, "search-index.json"), archive.searchIndex);
  }
  writeJson(join(outputRoot, "versions.json"), createVersionsModel(documentationPolicy));
  writeJson(join(outputRoot, "site.json"), website);
  writeJson(join(outputRoot, "manifest.webmanifest"), createWebManifest(website));
  writeFileSync(join(outputRoot, "robots.txt"), renderRobots(website));
  writeFileSync(join(outputRoot, "sitemap.xml"), renderSitemap(website, renderedPages));
  writeFileSync(join(outputRoot, "healthz"), "ok\n");
  writeFileSync(join(outputRoot, ".nojekyll"), "");
  writeFileSync(join(outputRoot, "sw.js"), createServiceWorker({ outputRoot, pages: renderedPages, website }));
  validateInternalLinks({ outputRoot, pages: renderedPages });

  console.log(
    `Website built with React for Vireo ${website.documentation.version}: ${contentPages.length} canonical pages, ` +
      `${renderedPages.length} rendered routes, create-vireo ${website.currentRelease.createVireo}.`,
  );
  return { pages: renderedPages, searchIndex, website };
}

export function createArchivedVersionedPages(archive) {
  return archive.pages
    .filter(page => page.basePath.startsWith("/docs/"))
    .map(page => ({
      ...page,
      canonicalPath: page.basePath,
      documentationVersion: archive.documentation.version,
      path: page.basePath.replace("/docs/", `/docs/${archive.documentation.version}/`),
      searchIndexUrl: `/docs/${archive.documentation.version}/search-index.json`,
      versioned: true,
    }));
}

export function createCurrentSnapshotArchive({ root = repositoryRoot } = {}) {
  const sitePolicy = readJson(join(root, "site/site-policy.json"));
  const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
  const contentManifest = readJson(join(root, "site/content/manifest.json"));
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  validateContentManifest({ contentManifest, root, website });
  const navigation = contentManifest.sections.map(section => ({
    label: section.label,
    pages: section.pages.map(normalizeManifestPage),
  }));
  const allPageRecords = [
    ...navigation.flatMap(section => section.pages),
    ...contentManifest.standalone.map(normalizeManifestPage),
  ];
  const contentPages = allPageRecords.map(record => createContentPage({ record, root, website }));
  const searchIndex = [
    ...contentPages.map(page => ({
      category: page.category,
      description: page.description,
      label: page.title,
      text: page.searchText,
      url: page.path,
      version: website.documentation.version,
    })),
    ...createReferenceSearchIndex({ root, website }),
  ];
  return createSnapshotArchive({ allPageRecords, contentManifest, contentPages, navigation, searchIndex, website });
}

function copyStaticAssets({ outputRoot, root }) {
  const source = join(root, "site/assets");
  const destination = join(outputRoot, "assets");
  mkdirSync(destination, { recursive: true });
  const assets = {};
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const sourcePath = join(source, entry.name);
    const content = readFileSync(sourcePath);
    const match = /^(.*)\.(css|js)$/u.exec(entry.name);
    const outputName = match ? `${match[1]}.${sha256(content).slice(0, 12)}.${match[2]}` : entry.name;
    cpSync(sourcePath, join(destination, outputName));
    assets[entry.name] = `/assets/${outputName}`;
  }
  writeJson(join(destination, "asset-manifest.json"), assets);
  return assets;
}

function createWebManifest(website) {
  return {
    id: "/",
    name: "Vireo Framework documentation",
    short_name: "Vireo docs",
    description: website.description,
    lang: "en",
    display: "standalone",
    start_url: "/docs/",
    scope: "/",
    theme_color: "#07111f",
    background_color: "#07111f",
    icons: [{ src: website.assets["favicon.svg"], sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

export function createServiceWorker({ outputRoot, pages, website }) {
  const paths = new Set([
    "/",
    "/404.html",
    "/search-index.json",
    "/manifest.webmanifest",
    "/assets/asset-manifest.json",
  ]);
  for (const asset of Object.values(website.assets)) paths.add(asset);
  for (const page of pages) {
    paths.add(page.path);
    if (page.versioned) paths.add(`/docs/${page.documentationVersion}/search-index.json`);
  }
  const revision = sha256(
    JSON.stringify([...paths].sort().map(path => [path, sha256(readFileSync(cachePathDestination(outputRoot, path)))])),
  ).slice(0, 16);
  return `/* Generated; do not hand-edit. */\nconst CACHE = "vireo-docs-${revision}";\nconst PRECACHE = ${JSON.stringify([...paths].sort())};\nself.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE))); });\nself.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("vireo-docs-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });\nfunction offlineNotFound(cache) { return cache.match("/404.html").then(response => response ? response.text().then(body => new Response(body, { headers: response.headers, status: 404, statusText: "Not Found" })) : Response.error()); }\nself.addEventListener("fetch", event => { const request = event.request; const url = new URL(request.url); if (request.method !== "GET" || url.origin !== self.location.origin) return; event.respondWith(caches.open(CACHE).then(cache => cache.match(request, { ignoreSearch: true }).then(hit => hit || fetch(request).catch(() => request.mode === "navigate" ? offlineNotFound(cache) : Response.error())))); });\n`;
}

function cachePathDestination(outputRoot, path) {
  if (path === "/") return join(outputRoot, "index.html");
  if (/\.[A-Za-z0-9]+$/u.test(path)) return join(outputRoot, path.slice(1));
  return routeDestination(outputRoot, path);
}

export function createReferenceSearchIndex({ root = repositoryRoot, website }) {
  const snapshot = `${website.documentation.exactReferenceSnapshot.replace(/\/$/u, "")}/`;
  const records = [];
  const packageRoot = join(root, "packages");
  for (const entry of readdirSync(packageRoot, { withFileTypes: true })) {
    const surfacePath = join(packageRoot, entry.name, "api-surface.json");
    const manifestPath = join(packageRoot, entry.name, "package.json");
    if (!entry.isDirectory() || !existsSync(surfacePath) || !existsSync(manifestPath)) continue;
    const surface = readJson(surfacePath);
    const manifest = readJson(manifestPath);
    for (const [entryPoint, contract] of Object.entries(surface.entryPoints ?? {})) {
      const importPath = entryPoint === "." ? manifest.name : `${manifest.name}/${entryPoint.slice(2)}`;
      const pageName = `${manifest.name.replace(/^@/u, "").replaceAll("/", "-")}--${
        entryPoint === "." ? "root" : entryPoint.slice(2).replaceAll("/", "-")
      }.html`;
      const symbols = contract.exports ?? [];
      const anchors = allocateReferenceSymbolAnchors(symbols);
      for (const [index, symbol] of symbols.entries()) {
        records.push({
          category: "TypeScript API",
          description: `Public export from ${importPath}`,
          label: symbol,
          text: `${symbol} ${importPath}`,
          url: `${snapshot}api/typescript/${pageName}#${anchors[index]}`,
          version: website.documentation.version,
        });
      }
    }
  }

  const jvmRoot = join(root, "jvm");
  for (const entry of readdirSync(jvmRoot, { withFileTypes: true })) {
    const surfacePath = join(jvmRoot, entry.name, "api-surface.txt");
    if (!entry.isDirectory() || !existsSync(surfacePath)) continue;
    const source = readFileSync(surfacePath, "utf8");
    for (const match of source.matchAll(/^public .*\s(com\.vireocode\.[A-Za-z0-9_.]+)(?:<[^\n]+>)?$/gmu)) {
      const qualifiedName = match[1];
      records.push({
        category: "JVM API",
        description: `${entry.name} public type`,
        label: qualifiedName.slice(qualifiedName.lastIndexOf(".") + 1),
        text: qualifiedName,
        url: `${snapshot}api/jvm/${qualifiedName.replaceAll(".", "/")}.html`,
        version: website.documentation.version,
      });
    }
  }
  return records;
}

export function createWebsiteModel({ documentationPolicy, sitePolicy }) {
  const release = documentationPolicy.releases.find(candidate => candidate.id === documentationPolicy.currentRelease);
  if (!release) throw new Error(`current release ${documentationPolicy.currentRelease} is missing`);
  const createVireo = release.npm.find(entry => entry.package === "create-vireo");
  if (!createVireo) throw new Error(`documentation release ${release.id} does not declare create-vireo`);
  if (!release.documentationVersion) throw new Error(`documentation release ${release.id} has no human version`);
  const publicSnapshot = `${documentationPolicy.publicBaseUrl}/versions/${release.id}`;
  const templateSource = release.template.repository.replace(
    "https://github.com/",
    "https://raw.githubusercontent.com/",
  );
  const flagshipImage = `${templateSource}/${release.template.commit}/docs/assets/flagship-overview.png`;
  return {
    schemaVersion: 2,
    canonicalUrl: sitePolicy.canonicalUrl,
    title: sitePolicy.title,
    description: sitePolicy.description,
    maturity: sitePolicy.maturity,
    links: {
      ...sitePolicy.links,
      source: release.releaseLinks.source,
      npm: release.releaseLinks.npm,
      maven: release.releaseLinks.jvm,
      storybook: `${publicSnapshot}/storybook/`,
      typescriptApi: `${publicSnapshot}/api/typescript/`,
      jvmApi: `${publicSnapshot}/api/jvm/`,
      flagshipImage,
    },
    documentation: {
      version: release.documentationVersion,
      label: release.documentationLabel ?? `Vireo ${release.documentationVersion}`,
      status: release.status,
      currentPath: "/docs/",
      snapshotPath: `/docs/${release.documentationVersion}/`,
      exactReferenceSnapshot: `${publicSnapshot}/`,
    },
    currentRelease: {
      id: release.id,
      createVireo: createVireo.version,
      npm: release.npm,
      jvm: release.jvm,
      template: release.template,
    },
    releases: documentationPolicy.releases.map(candidate => ({
      documentationVersion: candidate.documentationVersion,
      exactId: candidate.id,
      label: candidate.documentationLabel ?? `Vireo ${candidate.documentationVersion}`,
      status: candidate.status,
      url: `/docs/${candidate.documentationVersion}/`,
      referenceUrl: `${documentationPolicy.publicBaseUrl}/versions/${candidate.id}/`,
    })),
  };
}

function normalizeManifestPage(page) {
  return { ...page, path: normalizeRoute(page.path) };
}

function createContentPage({ record, root, website }) {
  const source = join(root, "site/content", record.file);
  const markdown = readFileSync(source, "utf8");
  const rendered = renderMarkdown(expandTokens(removeMetadataHeading(markdown, record.title), website));
  return {
    ...record,
    basePath: record.path,
    headings: rendered.headings,
    html: rendered.html,
    kind: "docs",
    readingMinutes: Math.max(1, Math.round(rendered.text.split(/\s+/u).length / 210)),
    searchText: rendered.text,
    searchIndexUrl: "/search-index.json",
  };
}

export function removeMetadataHeading(markdown, expectedTitle) {
  const normalized = markdown.replaceAll("\r\n", "\n");
  const match = /^(\s*)#\s+([^\n]+)\n?/u.exec(normalized);
  if (!match) throw new Error(`documentation content ${expectedTitle} must begin with one H1 metadata heading`);
  if (match[2].trim() !== expectedTitle) {
    throw new Error(`documentation H1 ${match[2].trim()} does not match manifest title ${expectedTitle}`);
  }
  if (/^#\s+/mu.test(normalized.slice(match[0].length))) {
    throw new Error(`documentation content ${expectedTitle} must not contain a second H1`);
  }
  return `${match[1]}${normalized.slice(match[0].length)}`;
}

function expandTokens(markdown, website) {
  const replacements = {
    "{{CREATE_VIREO_VERSION}}": website.currentRelease.createVireo,
    "{{DOCS_VERSION}}": website.documentation.version,
    "{{EXACT_RELEASE_ID}}": website.currentRelease.id,
    "{{JVM_VERSION}}": website.currentRelease.jvm.version,
    "{{STORYBOOK_URL}}": website.links.storybook,
    "{{TYPESCRIPT_API_URL}}": website.links.typescriptApi,
    "{{JVM_API_URL}}": website.links.jvmApi,
  };
  let expanded = markdown;
  for (const [token, value] of Object.entries(replacements)) expanded = expanded.replaceAll(token, value);
  return expanded;
}

function createLandingPage(website) {
  return {
    basePath: "/",
    category: "Vireo Framework",
    description: website.description,
    headings: [],
    kind: "home",
    path: "/",
    searchText: website.description,
    title: "React foundations for operational applications",
  };
}

function createNotFoundPage() {
  const rendered = renderMarkdown(
    `This route is not part of the current Vireo documentation.\n\n- [Open the documentation](/docs/)\n- [Search the current guides](/docs/)\n- [Return to the Vireo homepage](/)`,
  );
  return {
    basePath: "/404.html",
    category: "404",
    description: "The requested Vireo documentation route was not found.",
    headings: rendered.headings,
    html: rendered.html,
    kind: "docs",
    noIndex: true,
    path: "/404.html",
    searchText: "",
    title: "Page not found",
  };
}

function writePage({ allPages, navigation, outputRoot, page, website }) {
  const destination = routeDestination(outputRoot, page.path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, renderWebsitePage({ website, page, navigation, allPages }));
}

function routeDestination(outputRoot, route) {
  if (route === "/") return join(outputRoot, "index.html");
  if (route.endsWith(".html")) return join(outputRoot, route.slice(1));
  return join(outputRoot, route.slice(1), "index.html");
}

function normalizeRoute(route) {
  if (typeof route !== "string" || !route.startsWith("/")) throw new Error(`invalid content route ${route}`);
  return route === "/" || route.endsWith("/") ? route : `${route}/`;
}

function validateContentManifest({ contentManifest, root, website }) {
  if (contentManifest.schemaVersion !== 1) throw new Error("site content manifest schemaVersion must be 1");
  if (contentManifest.documentationVersion !== website.documentation.version) {
    throw new Error(
      `content version ${contentManifest.documentationVersion} does not match ${website.documentation.version}`,
    );
  }
  const records = [...contentManifest.sections.flatMap(section => section.pages), ...contentManifest.standalone];
  const paths = new Set();
  for (const record of records) {
    const path = normalizeRoute(record.path);
    if (paths.has(path)) throw new Error(`duplicate content route ${path}`);
    paths.add(path);
    for (const field of ["title", "description", "category", "file"]) {
      if (typeof record[field] !== "string" || !record[field].trim()) throw new Error(`${path} has no ${field}`);
    }
    if (record.sourceUrl !== undefined) {
      if (typeof record.sourceUrl !== "string" || !record.sourceUrl.startsWith("https://"))
        throw new Error(`${path} sourceUrl must be an HTTPS URL`);
    }
    if (record.sourceLabel !== undefined) {
      if (typeof record.sourceLabel !== "string" || !record.sourceLabel.trim())
        throw new Error(`${path} sourceLabel must be a non-empty string when provided`);
    }
    if (!existsSync(join(root, "site/content", record.file)))
      throw new Error(`${path} is missing content file ${record.file}`);
  }
  const offline = records.find(record => normalizeRoute(record.path) === "/docs/offline/");
  const pinnedOfflineSource = `${website.currentRelease.template.repository}/blob/${website.currentRelease.template.commit}/docs/offline.md`;
  if (offline?.sourceUrl !== pinnedOfflineSource)
    throw new Error(`offline documentation must pin the current Template contract at ${pinnedOfflineSource}`);
  if (
    typeof offline.sourceLabel !== "string" ||
    !offline.sourceLabel.includes("Pinned Starter Template offline contract")
  )
    throw new Error("offline documentation must identify its pinned Template contract");
  if (records.length < 24) throw new Error("the primary website must expose at least 24 canonical content pages");
}

export function createSnapshotDigest({ contentManifest, root = repositoryRoot }) {
  const records = [...contentManifest.sections.flatMap(section => section.pages), ...contentManifest.standalone].map(
    record => ({
      category: record.category,
      description: record.description,
      file: record.file,
      fileSha256: sha256(readFileSync(join(root, "site/content", record.file))),
      path: normalizeRoute(record.path),
      shortTitle: record.shortTitle ?? null,
      sourceLabel: record.sourceLabel ?? null,
      sourceUrl: record.sourceUrl ?? null,
      title: record.title,
    }),
  );
  return sha256(JSON.stringify({ documentationVersion: contentManifest.documentationVersion, records }));
}

export function createSnapshotArchive({
  allPageRecords,
  contentManifest,
  contentPages,
  navigation,
  searchIndex,
  website,
}) {
  const version = website.documentation.version;
  const payload = {
    allPageRecords,
    documentation: { label: website.documentation.label, version },
    navigation,
    pages: contentPages
      .filter(page => page.basePath.startsWith("/docs/"))
      .map(page => ({
        ...page,
        html: page.basePath.startsWith("/docs/")
          ? page.html.replaceAll('href="/docs/', `href="/docs/${version}/`)
          : page.html,
        searchText: undefined,
      })),
    searchIndex: searchIndex.map(entry => ({
      ...entry,
      url: entry.url.startsWith("/docs/") ? entry.url.replace("/docs/", `/docs/${version}/`) : entry.url,
    })),
  };
  return {
    archiveSha256: sha256(JSON.stringify(payload)),
    contentSha256: createSnapshotDigest({ contentManifest }),
    documentationVersion: version,
    payload,
    schemaVersion: 2,
  };
}

export function serializeSnapshotArchive(archive) {
  return {
    archiveSha256: archive.archiveSha256,
    contentSha256: archive.contentSha256,
    documentationVersion: archive.documentationVersion,
    encoding: "brotli-base64-json",
    payload: brotliCompressSync(Buffer.from(JSON.stringify(archive.payload)), {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }).toString("base64"),
    schemaVersion: 2,
  };
}

export function readSnapshotArchives({
  root = repositoryRoot,
  documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json")),
} = {}) {
  const directory = join(root, "site/content/snapshots");
  if (!existsSync(directory)) throw new Error("missing site snapshot archive directory");
  const archives = readdirSync(directory)
    .filter(name => name.endsWith(".json"))
    .sort()
    .map(name => ({ name, snapshot: readSnapshotFile(join(directory, name), name) }))
    .map(({ name, snapshot }) => decodeSnapshotArchive({ fileName: name, snapshot }));
  if (archives.length === 0) throw new Error("at least one retained documentation archive is required");
  validateSnapshotArchiveVersions({ archives, documentationPolicy });
  return archives;
}

function readSnapshotFile(path, name) {
  if (statSync(path).size > MAX_SNAPSHOT_FILE_BYTES)
    throw new Error(`historical documentation archive ${name} exceeds its file-size limit`);
  try {
    return readJson(path);
  } catch {
    throw new Error(`historical documentation archive ${name} is not valid JSON`);
  }
}

export function decodeSnapshotArchive({ fileName, snapshot }) {
  const version = snapshot?.documentationVersion;
  if (!isFriendlyDocumentationVersion(version) || fileName !== `${version}.json`)
    throw new Error(`historical documentation archive filename/version mismatch: ${fileName}`);
  if (
    snapshot.schemaVersion !== 2 ||
    snapshot.encoding !== "brotli-base64-json" ||
    !isSha256(snapshot.archiveSha256) ||
    !isSha256(snapshot.contentSha256)
  )
    throw new Error(`invalid historical documentation archive ${version}`);
  if (
    typeof snapshot.payload !== "string" ||
    snapshot.payload.length === 0 ||
    snapshot.payload.length > MAX_SNAPSHOT_BASE64_BYTES ||
    !/^[A-Za-z0-9+/]+={0,2}$/u.test(snapshot.payload)
  )
    throw new Error(`historical documentation archive ${version} has an unsafe payload`);
  let payload;
  try {
    const compressed = Buffer.from(snapshot.payload, "base64");
    if (compressed.length === 0 || compressed.length > Math.ceil((MAX_SNAPSHOT_BASE64_BYTES * 3) / 4))
      throw new Error("compressed payload exceeds limit");
    payload = JSON.parse(
      brotliDecompressSync(compressed, { maxOutputLength: MAX_SNAPSHOT_DECOMPRESSED_BYTES }).toString("utf8"),
    );
  } catch {
    throw new Error(`historical documentation archive ${version} is corrupt or exceeds its decompression limit`);
  }
  validateSnapshotArchivePayload({ payload, version });
  if (sha256(JSON.stringify(payload)) !== snapshot.archiveSha256)
    throw new Error(`historical documentation archive ${version} has an invalid digest`);
  return { ...snapshot, ...payload };
}

export function validateSnapshotArchiveVersions({ archives, documentationPolicy }) {
  const policyVersions = (documentationPolicy.releases ?? []).map(release => release.documentationVersion);
  if (
    policyVersions.some(version => !isFriendlyDocumentationVersion(version)) ||
    new Set(policyVersions).size !== policyVersions.length
  )
    throw new Error("documentation release policy must contain unique friendly documentation versions");
  const archiveVersions = archives.map(archive => archive.documentationVersion);
  if (
    archiveVersions.some(version => !isFriendlyDocumentationVersion(version)) ||
    new Set(archiveVersions).size !== archiveVersions.length
  )
    throw new Error("documentation archives must contain unique friendly documentation versions");
  if (
    policyVersions.length !== archiveVersions.length ||
    policyVersions.some(version => !archiveVersions.includes(version))
  )
    throw new Error("documentation archives must exactly match retained release-policy versions");
}

export function validateSnapshotArchivePayload({ payload, version }) {
  if (
    !isPlainObject(payload) ||
    !isPlainObject(payload.documentation) ||
    payload.documentation.version !== version ||
    typeof payload.documentation.label !== "string"
  )
    throw new Error(`historical documentation archive ${version} has an invalid payload header`);
  for (const field of ["allPageRecords", "navigation", "pages", "searchIndex"])
    if (!Array.isArray(payload[field])) throw new Error(`historical documentation archive ${version} has no ${field}`);
  const allPaths = new Set();
  for (const record of payload.allPageRecords) {
    validateArchivedRecord(record, { version });
    if (allPaths.has(record.path))
      throw new Error(`historical documentation archive ${version} has duplicate page paths`);
    allPaths.add(record.path);
  }
  const pagePaths = new Set();
  for (const page of payload.pages) {
    if (
      !isPlainObject(page) ||
      !isSafeDocsPath(page.basePath) ||
      page.path !== page.basePath ||
      typeof page.html !== "string" ||
      !Array.isArray(page.headings) ||
      unsafeArchivedHtml(page.html)
    )
      throw new Error(`historical documentation archive ${version} has an unsafe rendered page`);
    validateArchivedRecord(page);
    if (pagePaths.has(page.basePath) || !allPaths.has(page.basePath))
      throw new Error(`historical documentation archive ${version} has duplicate or undeclared rendered pages`);
    pagePaths.add(page.basePath);
    for (const heading of page.headings)
      if (!isPlainObject(heading) || typeof heading.anchor !== "string" || /[\\\u0000-\u001f]/u.test(heading.anchor))
        throw new Error(`historical documentation archive ${version} has an unsafe heading`);
  }
  for (const group of payload.navigation) {
    if (!isPlainObject(group) || typeof group.label !== "string" || !Array.isArray(group.pages))
      throw new Error(`historical documentation archive ${version} has unsafe navigation`);
    for (const record of group.pages) {
      validateArchivedRecord(record, { version });
      if (!allPaths.has(record.path))
        throw new Error(`historical documentation archive ${version} navigation points outside the archive`);
    }
  }
  const urls = new Set();
  for (const entry of payload.searchIndex) {
    if (
      !isPlainObject(entry) ||
      typeof entry.url !== "string" ||
      typeof entry.label !== "string" ||
      typeof entry.text !== "string" ||
      entry.version !== version
    )
      throw new Error(`historical documentation archive ${version} has unsafe search metadata`);
    if (!isSafeArchivedSearchUrl(entry.url, version) || urls.has(entry.url))
      throw new Error(`historical documentation archive ${version} has duplicate or unsafe search URLs`);
    urls.add(entry.url);
  }
}

function validateArchivedRecord(record) {
  if (
    !isPlainObject(record) ||
    !isSafeInternalPath(record.path) ||
    !isSafeText(record.title) ||
    !isSafeText(record.description) ||
    !isSafeText(record.category) ||
    !/^[A-Za-z0-9_-]+\.md$/u.test(record.file)
  )
    throw new Error("historical documentation archive has an unsafe page record");
  if (record.shortTitle !== undefined && !isSafeText(record.shortTitle))
    throw new Error("historical documentation archive has an unsafe page record");
  if (record.sourceLabel !== undefined && !isSafeText(record.sourceLabel))
    throw new Error("historical documentation archive has an unsafe page record");
  if (
    record.sourceUrl !== undefined &&
    (typeof record.sourceUrl !== "string" || !record.sourceUrl.startsWith("https://"))
  )
    throw new Error("historical documentation archive has an unsafe page record");
}

function isSafeDocsPath(path) {
  return typeof path === "string" && /^\/docs\/(?:[a-z0-9-]+\/)*$/u.test(path);
}

function isSafeInternalPath(path) {
  return typeof path === "string" && /^\/(?:[a-z0-9-]+\/)*$/u.test(path);
}

function isSafeArchivedSearchUrl(url, version) {
  if (typeof url !== "string" || /[\\\u0000-\u001f]/u.test(url)) return false;
  if (url.startsWith("/docs/")) return new RegExp(`^/docs/${escapeRegExp(version)}/(?:[a-z0-9-]+/)*$`, "u").test(url);
  return isSafeInternalPath(url) || /^https:\/\//u.test(url);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function isFriendlyDocumentationVersion(value) {
  return typeof value === "string" && FRIENDLY_DOCUMENTATION_VERSION.test(value);
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeText(value) {
  return typeof value === "string" && value.length <= 20_000 && !/[\u0000-\u001f]/u.test(value);
}

function unsafeArchivedHtml(value) {
  return value.length > 500_000 || /<(?:script|iframe|object)\b|\son[a-z]+\s*=|javascript:/iu.test(value);
}

function validateCurrentSnapshotArchive({ archives, currentArchive, website }) {
  const retained = archives.find(archive => archive.documentationVersion === website.documentation.version);
  if (!retained) throw new Error(`missing immutable snapshot archive for Vireo ${website.documentation.version}`);
  if (
    retained.contentSha256 !== currentArchive.contentSha256 ||
    retained.archiveSha256 !== currentArchive.archiveSha256
  )
    throw new Error(
      `Vireo ${website.documentation.version} snapshot content or search changed; generate and review its archive or publish a new documentation version`,
    );
}

function createVersionsModel(documentationPolicy) {
  const current = documentationPolicy.releases.find(release => release.id === documentationPolicy.currentRelease);
  return {
    schemaVersion: 2,
    currentRelease: documentationPolicy.currentRelease,
    currentDocumentationVersion: current?.documentationVersion,
    releases: documentationPolicy.releases.map(release => ({
      documentationVersion: release.documentationVersion,
      exactId: release.id,
      status: release.status,
      npm: release.npm,
      jvm: release.jvm,
      template: release.template,
      documentationUrl: `/docs/${release.documentationVersion}/`,
      referenceUrl: `${documentationPolicy.publicBaseUrl}/versions/${release.id}/`,
    })),
  };
}

function renderRobots(website) {
  return `User-agent: *\nAllow: /\nSitemap: ${website.canonicalUrl}sitemap.xml\n`;
}

function renderSitemap(website, pages) {
  const canonicalPages = pages.filter(page => !page.versioned && !page.noIndex);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${canonicalPages
    .map(page => `  <url><loc>${escapeXml(new URL(page.path, website.canonicalUrl).href)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}

function validateInternalLinks({ outputRoot, pages }) {
  const available = new Set(pages.map(page => page.path));
  available.add("/404.html");
  const problems = [];
  for (const page of pages) {
    const html = readFileSync(routeDestination(outputRoot, page.path), "utf8");
    for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/gu)) {
      const destination = match[1];
      if (destination.startsWith("/assets/") || destination === "/sitemap.xml") continue;
      if (existsSync(join(outputRoot, destination.slice(1)))) continue;
      const normalized = destination.endsWith(".html") || destination.endsWith("/") ? destination : `${destination}/`;
      if (!available.has(normalized) && !existsSync(routeDestination(outputRoot, normalized))) {
        problems.push(`${page.path} links to missing internal route ${destination}`);
      }
    }
  }
  if (problems.length > 0)
    throw new Error(`website internal-link validation failed:\n${problems.map(problem => `- ${problem}`).join("\n")}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildWebsite();
