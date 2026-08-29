import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderWebsitePage } from "./app.mjs";
import { renderMarkdown } from "./markdown.mjs";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(siteRoot, "..");

export function buildWebsite({ root = repositoryRoot, outputRoot = join(root, "site/dist") } = {}) {
  const sitePolicy = readJson(join(root, "site/site-policy.json"));
  const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
  const contentManifest = readJson(join(root, "site/content/manifest.json"));
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  validateContentManifest({ contentManifest, root, website });

  if (existsSync(outputRoot)) rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(join(outputRoot, "assets"), { recursive: true });
  cpSync(join(root, "site/assets"), join(outputRoot, "assets"), { recursive: true });

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
    if (page.path.startsWith("/docs/")) {
      const versionedPath = page.path.replace("/docs/", `/docs/${website.documentation.version}/`);
      const versionedPage = {
        ...page,
        canonicalPath: page.path,
        documentationVersion: website.documentation.version,
        html: page.html.replaceAll('href="/docs/', `href="/docs/${website.documentation.version}/`),
        path: versionedPath,
        versioned: true,
      };
      writePage({ allPages: allPageRecords, navigation, outputRoot, page: versionedPage, website });
      renderedPages.push(versionedPage);
    }
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
  writeJson(join(outputRoot, "versions.json"), createVersionsModel(documentationPolicy));
  writeJson(join(outputRoot, "site.json"), website);
  writeFileSync(join(outputRoot, "robots.txt"), renderRobots(website));
  writeFileSync(join(outputRoot, "sitemap.xml"), renderSitemap(website, renderedPages));
  writeFileSync(join(outputRoot, "healthz"), "ok\n");
  writeFileSync(join(outputRoot, ".nojekyll"), "");
  validateInternalLinks({ outputRoot, pages: renderedPages });

  console.log(
    `Website built with React for Vireo ${website.documentation.version}: ${contentPages.length} canonical pages, ` +
      `${renderedPages.length} rendered routes, create-vireo ${website.currentRelease.createVireo}.`,
  );
  return { pages: renderedPages, searchIndex, website };
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
      for (const symbol of contract.exports ?? []) {
        records.push({
          category: "TypeScript API",
          description: `Public export from ${importPath}`,
          label: symbol,
          text: `${symbol} ${importPath}`,
          url: `${snapshot}api/typescript/${pageName}#${referenceSymbolAnchor(symbol)}`,
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

function referenceSymbolAnchor(symbol) {
  return `symbol-${symbol.toLocaleLowerCase().replace(/[^a-z0-9_-]+/gu, "-")}`;
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
    if (!existsSync(join(root, "site/content", record.file)))
      throw new Error(`${path} is missing content file ${record.file}`);
  }
  if (records.length < 24) throw new Error("the primary website must expose at least 24 canonical content pages");
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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildWebsite();
