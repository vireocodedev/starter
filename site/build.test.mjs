import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";
import { buildWebsite, createWebsiteModel } from "./build.mjs";
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
  publicBaseUrl: "https://vireocodedev.github.io/starter",
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

test("derives friendly and exact release identities from one policy", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });

  assert.equal(website.schemaVersion, 2);
  assert.equal(website.documentation.version, "0.2");
  assert.equal(website.currentRelease.id, documentationPolicy.currentRelease);
  assert.equal(website.currentRelease.createVireo, "0.3.0");
  assert.equal(
    website.links.storybook,
    `https://vireocodedev.github.io/starter/versions/${documentationPolicy.currentRelease}/storybook/`,
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

test("builds the complete multi-page, searchable and versioned website artifact", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "vireo-website-"));
  try {
    const result = buildWebsite({ outputRoot });

    assert.equal(result.website.documentation.version, "0.2");
    assert.ok(result.pages.length >= 50);
    assert.ok(result.searchIndex.length >= 30);
    for (const path of [
      "index.html",
      "docs/index.html",
      "docs/0.2/index.html",
      "docs/getting-started/frontend-only/index.html",
      "docs/concepts/architecture/index.html",
      "docs/cli/doctor/index.html",
      "storybook/index.html",
      "reference/typescript/index.html",
      "versions/index.html",
      "search-index.json",
      "versions.json",
      "site.json",
      "sitemap.xml",
    ]) {
      assert.equal(existsSync(join(outputRoot, path)), true, `missing ${path}`);
    }

    const landing = readFileSync(join(outputRoot, "index.html"), "utf8");
    const docs = readFileSync(join(outputRoot, "docs/index.html"), "utf8");
    const components = readFileSync(join(outputRoot, "docs/components/index.html"), "utf8");
    const examples = readFileSync(join(outputRoot, "examples/index.html"), "utf8");
    const snapshot = readFileSync(join(outputRoot, "docs/0.2/index.html"), "utf8");
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
    assert.match(docs, /Vireo documentation/u);
    assert.match(docs, /On this page/u);
    assert.match(docs, /data-navigation-toggle/u);
    const componentHeader = components.match(/<nav class="site-nav"[^>]*>.*?<\/nav>/su)?.[0] ?? "";
    const componentSidebar = components.match(/<aside class="docs-sidebar"[^>]*>.*?<\/aside>/su)?.[0] ?? "";
    const examplesHeader = examples.match(/<nav class="site-nav"[^>]*>.*?<\/nav>/su)?.[0] ?? "";
    assert.doesNotMatch(componentHeader, /href="\/docs\/" aria-current="page"/u);
    assert.match(componentHeader, /href="\/docs\/components\/" aria-current="page"/u);
    assert.match(examplesHeader, /href="\/examples\/" aria-current="page"/u);
    assert.match(componentSidebar, /href="\/examples\/"/u);
    assert.match(componentSidebar, /href="\/reference\/"/u);
    assert.match(components, /data-theme-target="light"/u);
    assert.match(components, /data-theme-icon="dark"/u);
    assert.match(snapshot, /Vireo 0.2 snapshot/u);
    assert.match(snapshot, /rel="canonical" href="https:\/\/vireocode.com\/docs\/"/u);
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
