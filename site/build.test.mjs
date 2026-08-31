import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { brotliCompressSync, brotliDecompressSync } from "node:zlib";
import {
  buildWebsite,
  createArchivedVersionedPages,
  createReferenceSearchIndex,
  createSnapshotDigest,
  createWebsiteModel,
  decodeSnapshotArchive,
  removeMetadataHeading,
  validateSnapshotArchivePayload,
  validateSnapshotArchiveVersions,
} from "./build.mjs";
import { renderMarkdown } from "./markdown.mjs";

const sitePolicy = {
  canonicalUrl: "https://vireocode.com/",
  title: "Vireo Framework documentation",
  description: "A sufficiently detailed Vireo documentation website description for rendering and policy tests.",
  maturity: { label: "Public 0.x", summary: "Public beta is not yet claimed.", reviewed: "2026-08-28" },
  links: {
    documentation: "https://vireocode.com/docs/",
    versions: "https://vireocode.com/versions/",
    demo: "https://demo.vireocode.com",
  },
};

const documentationPolicy = {
  publicBaseUrl: "https://vireocodedev.github.io/vireo",
  currentRelease: "npm-0.3.0_jvm-0.2.0",
  releases: [
    {
      id: "npm-0.3.0_jvm-0.2.0",
      documentationVersion: "0.2",
      documentationLabel: "Vireo 0.2",
      status: "current",
      npm: [
        { package: "create-vireo", version: "0.3.0" },
        { package: "@vireocodedev/ui", version: "0.2.2" },
      ],
      jvm: { group: "com.vireocode", version: "0.2.0", modules: ["vireo-core"] },
      template: { repository: "https://example.com/template", commit: "a".repeat(40) },
      releaseLinks: {
        source: "https://example.com/source",
        npm: "https://example.com/npm",
        jvm: "https://example.com/maven",
      },
    },
  ],
};
const contentManifest = JSON.parse(readFileSync(new URL("./content/manifest.json", import.meta.url), "utf8"));

test("derives friendly and exact release identities from one policy", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });

  assert.equal(website.schemaVersion, 2);
  assert.equal(website.documentation.version, "0.2");
  assert.equal(website.currentRelease.id, documentationPolicy.currentRelease);
  assert.equal(website.currentRelease.createVireo, "0.3.0");
  assert.equal(
    website.links.storybook,
    `https://vireocodedev.github.io/vireo/versions/${documentationPolicy.currentRelease}/storybook/`,
  );
  assert.equal(website.links.source, documentationPolicy.releases[0].releaseLinks.source);
});

test("renders trusted documentation markdown with headings, code and tables", () => {
  const rendered = renderMarkdown(
    `## Configure\n\nUse **one** adapter.\n\n\`\`\`ts\nconst ready = true;\n\`\`\`\n\n| Mode | Value |\n| --- | --- |\n| Mock | local |`,
  );

  assert.deepEqual(rendered.headings, [{ anchor: "configure", label: "Configure", level: 2 }]);
  assert.match(rendered.html, /<strong>one<\/strong>/u);
  assert.match(rendered.html, /data-copy-code/u);
  assert.match(rendered.html, /<table>/u);
});

test("federates exact TypeScript and JVM symbols into main-site search", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  const index = createReferenceSearchIndex({ website });
  const pageLayout = index.find(entry => entry.label === "VireoPageLayout");
  const baseService = index.find(entry => entry.label === "BaseService");
  const entityNames = index.find(entry => entry.label === "EntityNames");
  const entityNamesValue = index.find(entry => entry.label === "entityNames");
  const formActionsClasses = index.find(entry => entry.label === "VireoFormActionsClasses");
  const formActionsClassesValue = index.find(entry => entry.label === "vireoFormActionsClasses");

  assert.ok(index.length > 1_000);
  assert.match(pageLayout?.url ?? "", /api\/typescript\/vireocodedev-ui--root\.html#symbol-vireopagelayout$/u);
  assert.match(baseService?.url ?? "", /api\/jvm\/com\/vireocode\/vireo\/base\/BaseService\.html$/u);
  assert.match(entityNames?.url ?? "", /create-vireo--root\.html#symbol-entitynames$/u);
  assert.match(entityNamesValue?.url ?? "", /create-vireo--root\.html#symbol-entitynames-2$/u);
  assert.match(formActionsClasses?.url ?? "", /vireocodedev-ui--root\.html#symbol-vireoformactionsclasses$/u);
  assert.match(formActionsClassesValue?.url ?? "", /vireocodedev-ui--root\.html#symbol-vireoformactionsclasses-2$/u);
  const typeScriptUrls = index.filter(entry => entry.category === "TypeScript API").map(entry => entry.url);
  assert.equal(new Set(typeScriptUrls).size, typeScriptUrls.length);
});

test("makes manifest metadata the sole page H1", () => {
  assert.equal(removeMetadataHeading("# Configure\n\n## Database\n", "Configure"), "\n## Database\n");
  assert.throws(() => removeMetadataHeading("## Configure\n", "Configure"), /must begin with one H1/u);
  assert.throws(() => removeMetadataHeading("# Setup\n", "Configure"), /does not match manifest title/u);
  assert.throws(
    () => removeMetadataHeading("# Configure\n\n# Another title\n", "Configure"),
    /must not contain a second H1/u,
  );
});

test("pins Design system documentation to reviewable source contracts", () => {
  const designSystem = contentManifest.sections.find(section => section.label === "Design system");
  assert.equal(designSystem?.pages.length, 9);
  for (const page of designSystem?.pages ?? []) {
    assert.match(
      page.sourceUrl ?? "",
      /^https:\/\/github\.com\/vireocodedev\/(?:vireo|vireo-template)\/blob\/[a-f0-9]{40}\//u,
    );
    assert.doesNotMatch(page.sourceUrl ?? "", /\/main\//u);
    assert.equal(typeof page.sourceLabel, "string");
    assert.ok(page.sourceLabel.trim().length > 0);
  }
});

test("pins offline documentation and refuses silent Vireo 0.3 snapshot drift", () => {
  const pages = [...contentManifest.sections.flatMap(section => section.pages), ...contentManifest.standalone];
  const offline = pages.find(page => page.path === "/docs/offline/");
  assert.equal(
    offline?.sourceUrl,
    "https://github.com/vireocodedev/vireo-template/blob/a670d7f95f720a91705c7c156d19e605582fb4c8/docs/offline.md",
  );
  assert.match(offline?.sourceLabel ?? "", /Pinned Starter Template offline contract/u);
  assert.match(
    readFileSync(new URL("./content/offline.md", import.meta.url), "utf8"),
    /does not include SQLite or `vireo-offline` dependencies/u,
  );
  assert.match(
    readFileSync(new URL("./content/offline.md", import.meta.url), "utf8"),
    /b068ba6b51c4c93430b0fed167cd3427e7082277/u,
  );
  const snapshot = JSON.parse(readFileSync(new URL("./content/snapshots/0.3.json", import.meta.url), "utf8"));
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.encoding, "brotli-base64-json");
  assert.equal(snapshot.contentSha256, createSnapshotDigest({ contentManifest }));
  const archived = JSON.parse(brotliDecompressSync(Buffer.from(snapshot.payload, "base64")).toString("utf8"));
  assert.ok(archived.searchIndex.some(entry => entry.category === "TypeScript API"));
  assert.ok(archived.searchIndex.some(entry => entry.url === "/examples/"));
  assert.ok(archived.searchIndex.some(entry => entry.url === "/docs/0.3/offline/"));
});

test("rejects malformed historical archive inputs before they can write routes", () => {
  const validDigest = "a".repeat(64);
  assert.throws(
    () => decodeSnapshotArchive({ fileName: "0.4.json", snapshot: { documentationVersion: "0.3", schemaVersion: 2 } }),
    /filename\/version mismatch/u,
  );
  assert.throws(
    () =>
      decodeSnapshotArchive({
        fileName: "0.3.json",
        snapshot: {
          archiveSha256: validDigest,
          contentSha256: validDigest,
          documentationVersion: "0.3",
          encoding: "brotli-base64-json",
          payload: "A".repeat(512 * 1024 + 1),
          schemaVersion: 2,
        },
      }),
    /unsafe payload/u,
  );
  assert.throws(
    () =>
      decodeSnapshotArchive({
        fileName: "0.3.json",
        snapshot: {
          archiveSha256: validDigest,
          contentSha256: validDigest,
          documentationVersion: "0.3",
          encoding: "brotli-base64-json",
          payload: "AAAA",
          schemaVersion: 2,
        },
      }),
    /corrupt or exceeds/u,
  );
  const decompressionBomb = brotliCompressSync(Buffer.alloc(4 * 1024 * 1024 + 1)).toString("base64");
  assert.throws(
    () =>
      decodeSnapshotArchive({
        fileName: "0.3.json",
        snapshot: {
          archiveSha256: validDigest,
          contentSha256: validDigest,
          documentationVersion: "0.3",
          encoding: "brotli-base64-json",
          payload: decompressionBomb,
          schemaVersion: 2,
        },
      }),
    /corrupt or exceeds/u,
  );
  assert.throws(
    () =>
      validateSnapshotArchivePayload({
        version: "0.3",
        payload: {
          allPageRecords: [{ category: "x", description: "x", file: "x.md", path: "/docs/a/", title: "x" }],
          documentation: { label: "Vireo 0.3", version: "0.3" },
          navigation: [],
          pages: [
            {
              basePath: "/docs/a/",
              category: "x",
              description: "x",
              file: "x.md",
              headings: [],
              html: "",
              path: "/docs/a/",
              title: "x",
            },
            {
              basePath: "/docs/a/",
              category: "x",
              description: "x",
              file: "x.md",
              headings: [],
              html: "",
              path: "/docs/a/",
              title: "x",
            },
          ],
          searchIndex: [],
        },
      }),
    /duplicate/u,
  );
  assert.throws(
    () =>
      validateSnapshotArchivePayload({
        version: "0.3",
        payload: {
          allPageRecords: [],
          documentation: { label: "Vireo 0.3", version: "0.3" },
          navigation: [],
          pages: [
            {
              basePath: "/docs/../escape/",
              category: "x",
              description: "x",
              file: "x.md",
              headings: [],
              html: "",
              path: "/docs/../escape/",
              title: "x",
            },
          ],
          searchIndex: [],
        },
      }),
    /unsafe rendered page/u,
  );
});

test("requires exactly one archive for every retained policy version", () => {
  const documentationPolicy = { releases: [{ documentationVersion: "0.3" }, { documentationVersion: "0.4" }] };
  assert.doesNotThrow(() =>
    validateSnapshotArchiveVersions({
      archives: [{ documentationVersion: "0.3" }, { documentationVersion: "0.4" }],
      documentationPolicy,
    }),
  );
  assert.throws(
    () => validateSnapshotArchiveVersions({ archives: [{ documentationVersion: "0.3" }], documentationPolicy }),
    /exactly match/u,
  );
  assert.throws(
    () =>
      validateSnapshotArchiveVersions({
        archives: [{ documentationVersion: "0.3" }, { documentationVersion: "0.3" }],
        documentationPolicy,
      }),
    /unique/u,
  );
});

test("retains versioned article routes independently of a later current version", () => {
  const retained = createArchivedVersionedPages({
    documentation: { version: "0.3" },
    pages: [{ basePath: "/docs/offline/", html: "<p>archived</p>", headings: [], title: "Offline behavior" }],
  });
  const futureCurrentVersion = "0.4";
  assert.equal(futureCurrentVersion, "0.4");
  assert.deepEqual(
    retained.map(page => [page.path, page.searchIndexUrl, page.html]),
    [["/docs/0.3/offline/", "/docs/0.3/search-index.json", "<p>archived</p>"]],
  );
});

test("builds the complete multi-page, searchable and versioned website artifact", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "vireo-website-"));
  try {
    const result = buildWebsite({ outputRoot });

    assert.equal(result.website.documentation.version, "0.3");
    assert.ok(result.pages.length >= 50);
    assert.ok(result.searchIndex.length > 1_000);
    const manifestCanonicalUrls = [
      ...contentManifest.sections.flatMap(section => section.pages),
      ...contentManifest.standalone,
    ].map(page => (page.path.endsWith("/") ? page.path : `${page.path}/`));
    assert.ok(
      result.searchIndex.length > manifestCanonicalUrls.length,
      "federated search must be a superset of canonical content",
    );
    assert.equal(new Set(result.searchIndex.map(entry => entry.url)).size, result.searchIndex.length);
    for (const url of manifestCanonicalUrls) {
      assert.equal(result.searchIndex.filter(entry => entry.url === url).length, 1, `${url} must remain searchable`);
    }
    for (const path of [
      "index.html",
      "docs/index.html",
      "docs/0.3/index.html",
      "docs/getting-started/frontend-only/index.html",
      "docs/concepts/architecture/index.html",
      "docs/design-system/index.html",
      "docs/design-system/visual-language/index.html",
      "docs/design-system/loading-states/index.html",
      "docs/cli/doctor/index.html",
      "storybook/index.html",
      "reference/typescript/index.html",
      "versions/index.html",
      "search-index.json",
      "docs/0.3/search-index.json",
      "versions.json",
      "site.json",
      "manifest.webmanifest",
      "sw.js",
      "sitemap.xml",
    ]) {
      assert.equal(existsSync(join(outputRoot, path)), true, `missing ${path}`);
    }

    const landing = readFileSync(join(outputRoot, "index.html"), "utf8");
    const docs = readFileSync(join(outputRoot, "docs/index.html"), "utf8");
    const components = readFileSync(join(outputRoot, "docs/components/index.html"), "utf8");
    const designSystem = readFileSync(join(outputRoot, "docs/design-system/index.html"), "utf8");
    const visualLanguage = readFileSync(join(outputRoot, "docs/design-system/visual-language/index.html"), "utf8");
    const examples = readFileSync(join(outputRoot, "examples/index.html"), "utf8");
    const snapshot = readFileSync(join(outputRoot, "docs/0.3/index.html"), "utf8");
    const versionedSearch = JSON.parse(readFileSync(join(outputRoot, "docs/0.3/search-index.json"), "utf8"));
    const manifest = JSON.parse(readFileSync(join(outputRoot, "manifest.webmanifest"), "utf8"));
    const worker = readFileSync(join(outputRoot, "sw.js"), "utf8");
    const sitemap = readFileSync(join(outputRoot, "sitemap.xml"), "utf8");
    for (const page of result.pages) {
      const html = readFileSync(
        page.path === "/" ? join(outputRoot, "index.html") : join(outputRoot, page.path.slice(1), "index.html"),
        "utf8",
      );
      assert.equal(html.match(/<h1(?:\s|>)/gu)?.length, 1, `${page.path} must render exactly one H1`);
    }
    const notFound = readFileSync(join(outputRoot, "404.html"), "utf8");
    assert.equal(notFound.match(/<h1(?:\s|>)/gu)?.length, 1, "404 page must render exactly one H1");
    for (const expected of [
      "Build the workflow.",
      "--profile frontend",
      "data-search-open",
      "/docs/getting-started/",
    ]) {
      assert.match(landing, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")));
    }
    assert.doesNotMatch(landing, /data-navigation-toggle/u);
    assert.match(landing, /data-search-icon/u);
    assert.match(landing, /property="og:image"/u);
    assert.match(landing, /name="twitter:card" content="summary_large_image"/u);
    assert.match(landing, /application\/ld\+json/u);
    assert.match(landing, /flagship-overview\.png/u);
    assert.match(landing, /current pinned Starter Template/u);
    assert.match(docs, /Vireo documentation/u);
    assert.match(docs, /On this page/u);
    assert.match(docs, /Design system/u);
    assert.match(docs, /data-navigation-toggle/u);
    const componentHeader = components.match(/<nav class="site-nav"[^>]*>.*?<\/nav>/su)?.[0] ?? "";
    const componentSidebar = components.match(/<aside class="docs-sidebar"[^>]*>.*?<\/aside>/su)?.[0] ?? "";
    const examplesHeader = examples.match(/<nav class="site-nav"[^>]*>.*?<\/nav>/su)?.[0] ?? "";
    assert.doesNotMatch(componentHeader, /href="\/docs\/" aria-current="page"/u);
    assert.match(componentHeader, /href="\/docs\/components\/" aria-current="page"/u);
    assert.match(examplesHeader, /href="\/examples\/" aria-current="page"/u);
    assert.match(componentSidebar, /href="\/examples\/"/u);
    assert.match(componentSidebar, /href="\/reference\/"/u);
    assert.match(componentSidebar, /href="\/docs\/design-system\/"/u);
    assert.match(components, /data-theme-target="light"/u);
    assert.match(components, /data-theme-icon="dark"/u);
    assert.match(designSystem, /Visual language/u);
    assert.match(designSystem, /Loading states/u);
    assert.match(visualLanguage, /semantic surfaces/u);
    assert.match(visualLanguage, /VISUAL_LANGUAGE\.md/u);
    assert.match(
      visualLanguage,
      /href="https:\/\/github\.com\/vireocodedev\/vireo-template\/blob\/a670d7f95f720a91705c7c156d19e605582fb4c8\/frontend\/docs\/VISUAL_LANGUAGE\.md"/u,
    );
    assert.match(sitemap, /https:\/\/vireocode\.com\/docs\/design-system\/loading-states\//u);
    assert.match(snapshot, /Vireo 0.3 snapshot/u);
    assert.match(snapshot, /rel="canonical" href="https:\/\/vireocode.com\/docs\/"/u);
    assert.match(snapshot, /data-search-index-url="\/docs\/0\.3\/search-index\.json"/u);
    assert.ok(versionedSearch.some(entry => entry.url === "/docs/0.3/offline/"));
    assert.ok(
      versionedSearch
        .filter(entry => entry.url.startsWith("/docs/"))
        .every(entry => entry.url.startsWith("/docs/0.3/")),
    );
    assert.match(landing, /\/assets\/site\.[a-f0-9]{12}\.css/u);
    assert.match(landing, /\/assets\/site\.[a-f0-9]{12}\.js/u);
    assert.equal(manifest.start_url, "/docs/");
    assert.equal(manifest.scope, "/");
    assert.match(worker, /const CACHE = "vireo-docs-[a-f0-9]{16}"/u);
    assert.match(worker, /"\/docs\/0\.3\/search-index\.json"/u);
    assert.match(worker, /url\.origin !== self\.location\.origin/u);
    assert.match(worker, /caches\.open\(CACHE\).*cache\.match/su);
    assert.doesNotMatch(worker, /caches\.match\(/u);
    assert.doesNotMatch(worker, /skipWaiting/u);
    assert.match(docs, /aria-controls="documentation-navigation"/u);
    assert.match(docs, /data-navigation-close/u);
    assert.match(docs, /data-search-status="true" role="status" aria-live="polite"/u);
    assert.doesNotMatch(docs, /data-search-results="true" role="status"/u);
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("keeps offline enhancements resilient to denied browser storage", () => {
  const client = readFileSync(new URL("./assets/site.js", import.meta.url), "utf8");
  const app = readFileSync(new URL("./app.mjs", import.meta.url), "utf8");
  assert.match(client, /function readStorage/u);
  assert.match(client, /function writeStorage/u);
  assert.match(client, /try\s*\{\s*return\s+window\.localStorage\.getItem/u);
  assert.match(client, /navigator\.serviceWorker\.register\("\/sw\.js"\)/u);
  assert.match(client, /aria-modal/u);
  assert.match(client, /if \(navigationIsOpen\(\)\) return;/u);
  assert.match(client, /navigationPanel\?\.focus\(\)/u);
  assert.match(app, /aria-labelledby": "documentation-navigation-title"/u);
  assert.match(app, /id: "documentation-navigation-title"/u);
});

test("serves generated metadata fresh and content-addressed assets immutably", () => {
  const caddy = readFileSync(new URL("./Caddyfile", import.meta.url), "utf8");
  assert.match(caddy, /\/sw\.js/u);
  assert.match(caddy, /\/manifest\.webmanifest/u);
  assert.match(caddy, /docs\/\[\^\/\]\+\/search-index/u);
  assert.match(caddy, /max-age=31536000, immutable/u);
  assert.match(caddy, /@mutableAssets path \/assets\/favicon\.svg \/assets\/asset-manifest\.json/u);
  assert.doesNotMatch(caddy, /@assets path \/assets\/\*/u);
  assert.doesNotMatch(caddy, /max-age=300/u, "old mutable asset cache policy must not return");
});

test("worker reads only its named cache and returns a cached 404 for unknown offline navigation", async () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "vireo-worker-"));
  try {
    buildWebsite({ outputRoot });
    const worker = readFileSync(join(outputRoot, "sw.js"), "utf8");
    const listeners = new Map();
    const opened = [];
    const entries = new Map([
      ["/docs/0.3/offline/", new Response("known")],
      ["/404.html", new Response("not found")],
    ]);
    const cache = {
      addAll: async () => undefined,
      match: async request =>
        entries.get(new URL(typeof request === "string" ? request : request.url, "https://vireocode.com").pathname),
    };
    const caches = {
      open: async name => {
        opened.push(name);
        return cache;
      },
      keys: async () => ["other-cache"],
      delete: async () => true,
    };
    let fetchCalls = 0;
    runInNewContext(worker, {
      Buffer,
      Promise,
      Response,
      URL,
      caches,
      fetch: async () => {
        fetchCalls += 1;
        throw new Error("offline");
      },
      self: {
        addEventListener: (name, listener) => listeners.set(name, listener),
        clients: { claim: async () => undefined },
        location: { origin: "https://vireocode.com" },
      },
    });
    async function dispatch(request) {
      let response;
      listeners.get("fetch")({
        request,
        respondWith: value => {
          response = value;
        },
      });
      return response ? response.then(value => value) : undefined;
    }
    const known = await dispatch({ method: "GET", mode: "navigate", url: "https://vireocode.com/docs/0.3/offline/" });
    assert.equal(await known.text(), "known");
    assert.equal(fetchCalls, 0);
    const missing = await dispatch({ method: "GET", mode: "navigate", url: "https://vireocode.com/missing/" });
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), "not found");
    assert.equal(await dispatch({ method: "GET", mode: "navigate", url: "https://example.test/missing/" }), undefined);
    assert.ok(opened.every(name => name.startsWith("vireo-docs-")));
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("refuses a release without the public create command or human documentation version", () => {
  const missingCreate = structuredClone(documentationPolicy);
  missingCreate.releases[0].npm = missingCreate.releases[0].npm.filter(entry => entry.package !== "create-vireo");
  assert.throws(
    () => createWebsiteModel({ documentationPolicy: missingCreate, sitePolicy }),
    /does not declare create-vireo/u,
  );

  const missingVersion = structuredClone(documentationPolicy);
  delete missingVersion.releases[0].documentationVersion;
  assert.throws(() => createWebsiteModel({ documentationPolicy: missingVersion, sitePolicy }), /has no human version/u);
});
