import assert from "node:assert/strict";
import test from "node:test";
import { createWebsiteModel, renderLanding, renderNotFound } from "./build.mjs";

const sitePolicy = {
  canonicalUrl: "https://vireocode.com/",
  title: "Vireo",
  description: "Description",
  maturity: { label: "Public 0.x", summary: "Not a production claim.", reviewed: "2026-08-28" },
  links: {
    documentation: "docs/",
    versions: "versions/",
    typescriptApi: "api/typescript/",
    jvmApi: "api/jvm/",
    demo: "https://demo.vireocode.com",
    template: "https://github.com/vireocodedev/starter-template",
    quickstart: "https://example.com/quickstart",
    tutorial: "https://example.com/tutorial",
    comparison: "https://example.com/comparison",
    architecture: "https://example.com/architecture",
    security: "https://example.com/security",
    roadmap: "https://example.com/roadmap",
    discussions: "https://example.com/discussions",
    feedback: "https://example.com/feedback",
  },
};

const documentationPolicy = {
  publicBaseUrl: "https://vireocodedev.github.io/starter",
  currentRelease: "npm-0.3.0_jvm-0.2.0",
  releases: [
    {
      id: "npm-0.3.0_jvm-0.2.0",
      status: "current",
      npm: [
        { package: "create-vireo", version: "0.3.0" },
        { package: "@vireocodedev/ui", version: "0.2.2" },
      ],
      jvm: { group: "com.vireocode", version: "0.2.0", modules: ["vireo-core"] },
      releaseLinks: {
        source: "https://example.com/source",
        npm: "https://example.com/npm",
        jvm: "https://example.com/maven",
        compatibility: "https://example.com/compatibility",
        migration: "https://example.com/migration",
      },
    },
  ],
};

test("derives the website release from the documentation policy", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });

  assert.equal(website.currentRelease.id, documentationPolicy.currentRelease);
  assert.equal(website.currentRelease.createVireo, "0.3.0");
  assert.deepEqual(website.currentRelease.npm, documentationPolicy.releases[0].npm);
  assert.equal(website.currentRelease.jvm.version, "0.2.0");
  assert.equal(website.links.source, documentationPolicy.releases[0].releaseLinks.source);
});

test("renders the connected and version-aware public surface", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  const html = renderLanding(website);

  for (const expected of [
    documentationPolicy.currentRelease,
    "create-vireo 0.3.0",
    "@vireocodedev/ui",
    "JVM 0.2.0",
    sitePolicy.links.demo,
    sitePolicy.links.documentation,
    sitePolicy.links.quickstart,
    "production-shaped 0.x software, not a blanket production-readiness claim",
  ]) {
    assert.match(html, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("renders a useful no-index 404 page", () => {
  const website = createWebsiteModel({ documentationPolicy, sitePolicy });
  const html = renderNotFound(website);

  assert.match(html, /meta name="robots" content="noindex"/);
  assert.match(html, /href="docs\/"/);
  assert.match(html, /Vireo home/);
});

test("refuses a release without the public create command", () => {
  const invalidPolicy = structuredClone(documentationPolicy);
  invalidPolicy.releases[0].npm = invalidPolicy.releases[0].npm.filter(entry => entry.package !== "create-vireo");

  assert.throws(
    () => createWebsiteModel({ documentationPolicy: invalidPolicy, sitePolicy }),
    /does not declare create-vireo/,
  );
});
