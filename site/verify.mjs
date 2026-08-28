import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sitePolicy = readJson(join(root, "site/site-policy.json"));
const documentationPolicy = readJson(join(root, "contracts/documentation-release-policy.json"));
const artifactRequested = process.argv.includes("--artifact");
const unexpectedArguments = process.argv.slice(2).filter(argument => argument !== "--artifact");
const problems = [];

if (unexpectedArguments.length > 0) problems.push(`unexpected arguments: ${unexpectedArguments.join(" ")}`);
if (sitePolicy.schemaVersion !== 1) problems.push("site policy schemaVersion must be 1");
if (sitePolicy.canonicalUrl !== "https://vireocode.com/") {
  problems.push("site policy canonicalUrl must be https://vireocode.com/");
}
if (typeof sitePolicy.title !== "string" || sitePolicy.title.length < 20) {
  problems.push("site policy must provide a descriptive title");
}
if (typeof sitePolicy.description !== "string" || sitePolicy.description.length < 80) {
  problems.push("site policy must provide a useful search/social description");
}
if (!/^\d{4}-\d{2}-\d{2}$/u.test(sitePolicy.maturity?.reviewed ?? "")) {
  problems.push("site maturity must have a reviewed YYYY-MM-DD date");
}
if (!sitePolicy.maturity?.summary?.includes("not yet claimed")) {
  problems.push("site maturity must preserve the explicit unclaimed-readiness boundary");
}

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
  "discussions",
  "feedback",
  "contributing",
];
for (const name of requiredLinks) {
  const value = sitePolicy.links?.[name];
  if (typeof value !== "string" || !value.startsWith("https://")) {
    problems.push(`site link ${name} must be an HTTPS URL`);
  }
}
if (!sitePolicy.links?.documentation?.startsWith(`${documentationPolicy.publicBaseUrl}/`)) {
  problems.push("site documentation link must use the versioned documentation host");
}
if (sitePolicy.links?.demo !== "https://demo.vireocode.com") {
  problems.push("site demo link must use the canonical public flagship host");
}

const currentRelease = documentationPolicy.releases?.find(release => release.id === documentationPolicy.currentRelease);
if (!currentRelease) {
  problems.push(`current documentation release ${documentationPolicy.currentRelease} is missing`);
} else if (!currentRelease.npm?.some(entry => entry.package === "create-vireo")) {
  problems.push(`current documentation release ${currentRelease.id} must declare create-vireo`);
}

if (artifactRequested && currentRelease) validateArtifact(currentRelease);

if (problems.length > 0) {
  console.error("Website policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Website policy passed for ${documentationPolicy.currentRelease}${
    artifactRequested ? ", including the standalone production artifact" : ""
  }.`,
);

function validateArtifact(release) {
  const outputRoot = join(root, "site/dist");
  const requiredPaths = [
    ".nojekyll",
    "404.html",
    "assets/favicon.svg",
    "assets/site.css",
    "assets/site.js",
    "healthz",
    "index.html",
    "robots.txt",
    "site.json",
    "sitemap.xml",
  ];
  for (const path of requiredPaths) {
    if (!existsSync(join(outputRoot, path))) problems.push(`website artifact is missing ${path}`);
  }
  if (!existsSync(join(outputRoot, "index.html")) || !existsSync(join(outputRoot, "site.json"))) return;

  const html = readFileSync(join(outputRoot, "index.html"), "utf8");
  const generated = readJson(join(outputRoot, "site.json"));
  if (generated.canonicalUrl !== sitePolicy.canonicalUrl) {
    problems.push("generated website canonical URL drifted from site policy");
  }
  if (generated.currentRelease?.id !== release.id) {
    problems.push("generated website release drifted from documentation policy");
  }
  const createVireo = release.npm.find(entry => entry.package === "create-vireo");
  if (generated.currentRelease?.createVireo !== createVireo?.version) {
    problems.push("generated website create-vireo version drifted from documentation policy");
  }
  if (JSON.stringify(generated.currentRelease?.npm) !== JSON.stringify(release.npm)) {
    problems.push("generated website npm versions drifted from documentation policy");
  }
  if (JSON.stringify(generated.currentRelease?.jvm) !== JSON.stringify(release.jvm)) {
    problems.push("generated website JVM versions drifted from documentation policy");
  }

  for (const expected of [
    sitePolicy.canonicalUrl,
    sitePolicy.links.documentation,
    sitePolicy.links.demo,
    sitePolicy.links.quickstart,
    release.id,
    `create-vireo ${createVireo.version}`,
    "assets/site.css",
    "assets/site.js",
  ]) {
    if (!html.includes(expected)) problems.push(`generated website is missing ${expected}`);
  }
  for (const forbidden of ["undefined", 'vireocodedev.github.io/starter" rel="canonical']) {
    if (html.includes(forbidden)) problems.push(`generated website contains forbidden value ${forbidden}`);
  }
  if (readFileSync(join(outputRoot, "healthz"), "utf8") !== "ok\n") {
    problems.push("website healthz response must be exactly ok");
  }
  if (!readFileSync(join(outputRoot, "sitemap.xml"), "utf8").includes(sitePolicy.canonicalUrl)) {
    problems.push("website sitemap must contain the canonical root URL");
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
