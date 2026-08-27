import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  "CODE_OF_CONDUCT.md",
  "docs/COMPATIBILITY.md",
  "docs/EVALUATION.md",
  "docs/PUBLIC_API.md",
  "docs/TEMPORAL_VALUES.md",
  "packages/ui/docs/PUBLIC_SURFACE.md",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
];
const problems = [];

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) problems.push(`missing required public contract: ${path}`);
}

function requireText(path, fragments) {
  const text = readFileSync(join(root, path), "utf8");
  for (const fragment of fragments) {
    if (!text.includes(fragment)) problems.push(`${path} must contain ${JSON.stringify(fragment)}`);
  }
  return text;
}

requireText("README.md", [
  "SUPPORT.md",
  "GOVERNANCE.md",
  "docs/COMPATIBILITY.md",
  "docs/EVALUATION.md",
  "docs/PUBLIC_API.md",
  "packages/ui/docs/PUBLIC_SURFACE.md",
  "docs/TEMPORAL_VALUES.md",
]);
requireText("SUPPORT.md", ["SECURITY.md", "CODE_OF_CONDUCT.md"]);
requireText("GOVERNANCE.md", [".github/CODEOWNERS", "docs/COMPATIBILITY.md"]);
const compatibility = requireText("docs/COMPATIBILITY.md", [
  "deprecat",
  "migration",
  "peer dependency",
  "schema",
  "Template",
]);

const packageDirectories = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);
for (const directory of packageDirectories) {
  const manifestPath = join(root, "packages", directory, "package.json");
  if (!existsSync(manifestPath)) continue;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const value of [manifest.name, manifest.version]) {
    if (!compatibility.includes(value))
      problems.push(`docs/COMPATIBILITY.md must reflect ${manifest.name} ${manifest.version}`);
  }
}

const gradleProperties = readFileSync(join(root, "jvm/gradle.properties"), "utf8");
const jvmVersion = gradleProperties.match(/^version=(.+)$/m)?.[1];
if (!jvmVersion || !compatibility.includes(jvmVersion))
  problems.push("docs/COMPATIBILITY.md must reflect jvm/gradle.properties version");

for (const form of ["bug_report.yml", "feature_request.yml"]) {
  requireText(`.github/ISSUE_TEMPLATE/${form}`, ["name:", "description:", "body:"]);
}
requireText(".github/ISSUE_TEMPLATE/config.yml", ["blank_issues_enabled: false", "contact_links:"]);

const executableDocumentationClaims = [
  {
    documentation: "README.md",
    documentedCommand: "corepack npm ci",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "corepack npm ci",
  },
  {
    documentation: "README.md",
    documentedCommand: "corepack npm run verify",
    evidence: ".github/workflows/ci.yml",
    evidenceCommand: "corepack npm run verify",
  },
  {
    documentation: "README.md",
    documentedCommand: "corepack npm run build-storybook",
    evidence: ".github/workflows/storybook-pages.yml",
    evidenceCommand: "corepack npm run build-storybook",
  },
];

for (const claim of executableDocumentationClaims) {
  const documentation = readFileSync(join(root, claim.documentation), "utf8");
  const evidence = readFileSync(join(root, claim.evidence), "utf8");
  if (!documentation.includes(claim.documentedCommand)) {
    problems.push(`${claim.documentation} must document executable command ${claim.documentedCommand}`);
  }
  if (!evidence.includes(claim.evidenceCommand)) {
    problems.push(`${claim.evidence} must execute documented command ${claim.evidenceCommand}`);
  }
}

const markdownFiles = [];
function collectMarkdown(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "storybook-static"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectMarkdown(path);
    else if (entry.isFile() && entry.name.endsWith(".md")) markdownFiles.push(path);
  }
}
collectMarkdown(root);

for (const source of markdownFiles) {
  const markdown = readFileSync(source, "utf8");
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (!rawTarget || /^(?:https?:|mailto:|#)/.test(rawTarget)) continue;
    const target = decodeURIComponent(rawTarget.split("#", 1)[0].split("?", 1)[0]);
    if (!target) continue;
    const resolved = resolve(dirname(source), target);
    if (!existsSync(resolved)) problems.push(`${relative(root, source)} links to missing ${rawTarget}`);
    else if (!statSync(resolved).isFile() && !statSync(resolved).isDirectory())
      problems.push(`${relative(root, source)} links to unsupported ${rawTarget}`);
  }
}

if (problems.length > 0) {
  console.error("Public contract policy failed:\n");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Public contract policy passed: ${requiredFiles.length} surfaces, ${packageDirectories.length} npm workspaces, and ${markdownFiles.length} Markdown files checked.`,
);
console.log(`${executableDocumentationClaims.length} documented commands are bound to hosted execution evidence.`);
