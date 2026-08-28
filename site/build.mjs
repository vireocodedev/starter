import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(siteRoot, "..");

export function buildWebsite({ root = repositoryRoot, outputRoot = join(root, "site/dist") } = {}) {
  const sitePolicy = readJson(join(root, "site/site-policy.json"));
  const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
  const currentRelease = documentationPolicy.releases.find(
    candidate => candidate.id === documentationPolicy.currentRelease,
  );

  if (!currentRelease) {
    throw new Error(`current documentation release ${documentationPolicy.currentRelease} is not declared`);
  }

  mkdirSync(join(outputRoot, "assets"), { recursive: true });
  cpSync(join(root, "site/assets"), join(outputRoot, "assets"), { recursive: true });

  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  writeFileSync(join(outputRoot, "index.html"), renderLanding(website));
  writeFileSync(join(outputRoot, "404.html"), renderNotFound(website));
  writeFileSync(join(outputRoot, "robots.txt"), renderRobots(website));
  writeFileSync(join(outputRoot, "sitemap.xml"), renderSitemap(website));
  writeFileSync(join(outputRoot, "healthz"), "ok\n");
  writeFileSync(join(outputRoot, ".nojekyll"), "");
  writeJson(join(outputRoot, "site.json"), website);

  console.log(
    `Website built for ${website.currentRelease.id}: create-vireo ${website.currentRelease.createVireo}, ` +
      `${website.currentRelease.npm.length - 1} scoped npm packages, and JVM ${website.currentRelease.jvm.version}.`,
  );

  return website;
}

export function createWebsiteModel({ documentationPolicy, sitePolicy }) {
  const release = documentationPolicy.releases.find(candidate => candidate.id === documentationPolicy.currentRelease);
  if (!release) throw new Error(`current release ${documentationPolicy.currentRelease} is missing`);
  const createVireo = release.npm.find(entry => entry.package === "create-vireo");
  if (!createVireo) throw new Error(`documentation release ${release.id} does not declare create-vireo`);

  return {
    schemaVersion: 1,
    canonicalUrl: sitePolicy.canonicalUrl,
    title: sitePolicy.title,
    description: sitePolicy.description,
    maturity: sitePolicy.maturity,
    links: {
      ...sitePolicy.links,
      source: release.releaseLinks.source,
      npm: release.releaseLinks.npm,
      maven: release.releaseLinks.jvm,
      compatibility: release.releaseLinks.compatibility,
      migration: release.releaseLinks.migration,
    },
    currentRelease: {
      id: release.id,
      createVireo: createVireo.version,
      documentationUrl: `${documentationPolicy.publicBaseUrl}/versions/${release.id}/`,
      npm: release.npm,
      jvm: release.jvm,
    },
    releases: documentationPolicy.releases.map(candidate => ({
      id: candidate.id,
      status: candidate.status,
      url: `${documentationPolicy.publicBaseUrl}/versions/${candidate.id}/`,
    })),
  };
}

export function renderLanding(website) {
  const { currentRelease, links, maturity } = website;
  const scopedPackages = currentRelease.npm.filter(entry => entry.package !== "create-vireo");
  const npmVersions = [...new Set(scopedPackages.map(entry => entry.version))].join(", ");
  const packageRows = currentRelease.npm
    .map(entry => `<li><code>${escapeHtml(entry.package)}</code><span>${escapeHtml(entry.version)}</span></li>`)
    .join("");
  const releaseOptions = website.releases
    .map(
      release =>
        `<option value="${escapeHtml(release.url)}"${
          release.id === currentRelease.id ? " selected" : ""
        }>${escapeHtml(release.id)} · ${escapeHtml(release.status)}</option>`,
    )
    .join("");
  const createCommand = "npm create vireo@latest my-app";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(website.description)}" />
    <meta name="theme-color" content="#07111f" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(website.title)}" />
    <meta property="og:description" content="${escapeHtml(website.description)}" />
    <meta property="og:url" content="${escapeHtml(website.canonicalUrl)}" />
    <meta name="twitter:card" content="summary" />
    <link rel="canonical" href="${escapeHtml(website.canonicalUrl)}" />
    <link rel="stylesheet" href="assets/site.css" />
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
    <title>${escapeHtml(website.title)}</title>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="shell site-header__inner">
        <a class="brand" href="./" aria-label="Vireo Framework home">
          ${vireoMark()}
          <span>Vireo Framework <small>by Vireo Code</small></span>
        </a>
        <nav class="site-nav" aria-label="Primary navigation">
          <a href="${escapeHtml(links.documentation)}">Docs</a>
          <a href="${escapeHtml(links.demo)}">Demo</a>
          <a href="${escapeHtml(links.versions)}">Versions</a>
          <a href="${escapeHtml(links.source)}">GitHub</a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section class="shell hero" aria-labelledby="hero-title">
        <div>
          <p class="eyebrow">React + Spring Boot · operational applications</p>
          <h1 id="hero-title">Ship the business workflow, not another foundation.</h1>
          <p class="hero__lede">Vireo connects responsive React UI, Spring Boot modules, cross-stack generation, versioned contracts, and production-shaped operations while leaving domain code in your application.</p>
          <div class="actions">
            <a class="button button--primary" href="${escapeHtml(links.demo)}">Open the live demo</a>
            <a class="button" href="${escapeHtml(links.quickstart)}">Follow the quickstart</a>
          </div>
        </div>
        <aside class="command-card" aria-label="Create a Vireo application">
          <div class="command-card__label">
            <span>Create from the public release</span>
            <button class="copy-button" type="button" data-copy-command="${escapeHtml(createCommand)}">Copy</button>
          </div>
          <code>${escapeHtml(createCommand)}</code>
          <span class="visually-hidden" aria-live="polite" data-copy-status></span>
        </aside>
      </section>

      <div class="proof-strip" aria-label="Current public proof">
        <div class="shell proof-strip__inner">
          <div class="proof"><strong>create-vireo ${escapeHtml(currentRelease.createVireo)}</strong><span>Public project creation and upgrade CLI</span></div>
          <div class="proof"><strong>npm ${escapeHtml(npmVersions)}</strong><span>${scopedPackages.length} scoped framework packages</span></div>
          <div class="proof"><strong>JVM ${escapeHtml(currentRelease.jvm.version)}</strong><span>${currentRelease.jvm.modules.length} Maven Central modules</span></div>
          <div class="proof"><strong>Live HTTPS demo</strong><span>Seeded, monitored, and reset daily</span></div>
        </div>
      </div>

      <section class="shell section" aria-labelledby="path-title">
        <div class="section-heading">
          <h2 id="path-title">One connected path.</h2>
          <p>Evaluate the experience, create an ordinary application, inspect the exact public contracts, and keep the release boundary visible throughout.</p>
        </div>
        <div class="cards">
          ${pathCard("01", "Try the workflow", "Use the seeded Item application without installing anything. The demo is a public sandbox with no uptime SLA.", links.demo, "Open demo")}
          ${pathCard("02", "Create your application", "Run the public CLI, then use doctor and the root workflow to start the React and Spring Boot halves.", links.quickstart, "Read quickstart")}
          ${pathCard("03", "Generate a vertical slice", "Generate application-owned migration, backend, frontend, localization, stories, and tests from one reviewed schema.", links.tutorial, "Follow tutorial")}
        </div>
      </section>

      <section class="shell section section--compact" aria-labelledby="release-title">
        <div class="release-layout">
          <div class="release-panel">
            <p class="eyebrow">Version-aware by construction</p>
            <h2 id="release-title">Current documentation snapshot</h2>
            <p>The site is generated from the same release policy that verifies package manifests and JVM coordinates. Stable documentation aliases point to <a href="${escapeHtml(currentRelease.documentationUrl)}"><code>${escapeHtml(currentRelease.id)}</code></a>.</p>
            <div class="release-meta">
              <span class="pill">create-vireo ${escapeHtml(currentRelease.createVireo)}</span>
              <span class="pill">npm ${escapeHtml(npmVersions)}</span>
              <span class="pill">JVM ${escapeHtml(currentRelease.jvm.version)}</span>
            </div>
            <ul class="package-list" aria-label="Current public package versions">${packageRows}</ul>
            <label for="release-select">Open a documentation release</label>
            <select class="release-select" id="release-select" data-release-select>${releaseOptions}</select>
          </div>
          <aside class="boundary" aria-labelledby="boundary-title">
            <p class="eyebrow">${escapeHtml(maturity.label)} · reviewed ${escapeHtml(maturity.reviewed)}</p>
            <h2 id="boundary-title">Useful now. Honest about what remains.</h2>
            <p><strong>${escapeHtml(maturity.summary)}</strong></p>
            <ul>
              <li>Applications own domain rules, authorization policy, data sensitivity, and conflict decisions.</li>
              <li>The Template demonstrates an offline shell; it does not claim arbitrary offline domain synchronization.</li>
              <li>The hosted flagship and automated fixtures are not evidence of independent adoption.</li>
            </ul>
            <a href="${escapeHtml(links.compatibility)}">Read compatibility and maturity boundaries</a>
          </aside>
        </div>
      </section>

      <section class="shell section" aria-labelledby="explore-title">
        <div class="section-heading">
          <h2 id="explore-title">Everything connects from here.</h2>
          <p>Use the layer that answers your current question; all technical references retain their exact release identity.</p>
        </div>
        <div class="link-grid">
          ${linkTile(links.documentation, "Searchable documentation", "Storybook guides plus TypeScript and JVM reference")}
          ${linkTile(links.typescriptApi, "TypeScript API", "Declared package exports and signatures")}
          ${linkTile(links.jvmApi, "JVM API", "Aggregate Javadocs for the current module family")}
          ${linkTile(links.architecture, "Architecture", "Request path, ownership, and deployment shape")}
          ${linkTile(links.comparison, "Comparison", "Where Vireo fits and where alternatives fit better")}
          ${linkTile(links.security, "Security", "Private reporting, supported versions, and response policy")}
          ${linkTile(links.roadmap, "Roadmap", "Evidence gates, current maturity, and remaining work")}
          ${linkTile(links.discussions, "Community", "Questions, ideas, announcements, and design discussion")}
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="shell site-footer__inner">
        <p>Vireo Framework by Vireo Code. Public source and packages under the MIT license. The current line is production-shaped 0.x software, not a blanket production-readiness claim.</p>
        <a href="${escapeHtml(links.feedback)}">Share evaluation feedback</a>
      </div>
    </footer>
    <script src="assets/site.js" defer></script>
  </body>
</html>\n`;
}

export function renderNotFound(website) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Page not found · Vireo Framework</title>
    <style>:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif}body{display:grid;min-height:100vh;margin:0;place-items:center;background:#07111f;color:#f5f8fc}main{width:min(42rem,calc(100% - 2rem))}p{color:#a9bad0;font-size:1.1rem}a{color:#7cd9fd}</style>
  </head>
  <body><main><p>404 · Vireo Framework</p><h1>This route is not part of the current site.</h1><p>Return to the product overview or open the current versioned documentation.</p><p><a href="${escapeHtml(website.canonicalUrl)}">Vireo home</a> · <a href="${escapeHtml(website.links.documentation)}">Documentation</a></p></main></body>
</html>\n`;
}

function renderRobots(website) {
  return `User-agent: *\nAllow: /\nSitemap: ${website.canonicalUrl}sitemap.xml\n`;
}

function renderSitemap(website) {
  const routes = [""];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map(route => `  <url><loc>${escapeXml(new URL(route, website.canonicalUrl).href)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}

function pathCard(number, title, description, href, action) {
  return `<article class="card"><span class="card__number">${escapeHtml(number)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a href="${escapeHtml(href)}">${escapeHtml(action)} →</a></article>`;
}

function linkTile(href, title, description) {
  return `<a href="${escapeHtml(href)}">${escapeHtml(title)}<span>${escapeHtml(description)}</span></a>`;
}

function vireoMark() {
  return `<svg viewBox="0 0 40 40" role="img" aria-label=""><path fill="#36c7fa" d="M6 7h10l4 8 4-8h10L20 35 6 7Z"/><path fill="#f0b44c" d="M15 7h10l-5 10-5-10Z"/></svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    buildWebsite();
  } catch (error) {
    console.error(`Website build failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
