import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootPackage = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
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
  "docs/PLATFORM_SUPPORT.md",
  "docs/VERIFICATION_PERFORMANCE.md",
  "docs/DOCUMENTATION_PORTAL.md",
  "docs/roadmap/phase-5/feedback-and-evidence.md",
  "docs/roadmap/phase-5/evidence/aggregate.json",
  "contracts/platform-support-policy.json",
  "contracts/ecosystem-release-contract.json",
  "contracts/public-release-attestation-policy.json",
  "contracts/documentation-release-policy.json",
  "contracts/public-beta-evidence-policy.json",
  "contracts/anonymous-consumer-gauntlet-policy.json",
  "contracts/template-adoption-policy.json",
  "contracts/template-adoption-intent.json",
  "docs/ANONYMOUS_CONSUMER_GAUNTLET.md",
  "site/content/manifest.json",
  "packages/ui/docs/PUBLIC_SURFACE.md",
  ".github/CODEOWNERS",
  ".github/rulesets/main.json",
  ".github/rulesets/release-tags.json",
  ".github/settings/actions.json",
  ".github/settings/selected-actions.json",
  ".github/settings/workflow-permissions.json",
  ".github/environments/package-release.json",
  ".github/environments/package-release.deployment-branch-policies.json",
  ".github/environments/package-release.live-assertions.json",
  ".github/environments/template-adoption.json",
  ".github/environments/template-adoption.deployment-branch-policies.json",
  ".github/environments/template-adoption.live-assertions.json",
  ".github/workflows/adopt-template-release.yml",
  ".github/environments/maven-central.json",
  ".github/environments/maven-central.deployment-branch-policies.json",
  ".github/environments/maven-central.live-assertions.json",
  ".github/environments/github-pages.json",
  ".github/environments/github-pages.deployment-branch-policies.json",
  ".github/environments/github-pages.live-assertions.json",
  ".github/labels/bug.json",
  ".github/labels/enhancement.json",
  ".github/labels/beta-feedback.json",
  ".github/labels/beta-adopter.json",
  "scripts/repository-security-policy.mjs",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/public_beta_feedback.yml",
  ".github/ISSUE_TEMPLATE/adopter_check_in.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  "docs/roadmap/phase-5/evidence/external-gate-readiness-2026-09-01.md",
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
  "docs/PLATFORM_SUPPORT.md",
  "docs/VERIFICATION_PERFORMANCE.md",
  "docs/DOCUMENTATION_PORTAL.md",
  "docs/roadmap/phase-5/feedback-and-evidence.md",
]);
requireText("docs/EVALUATION.md", [
  "https://github.com/vireocodedev/vireo/issues/new?template=public_beta_feedback.yml",
  "https://github.com/vireocodedev/vireo/issues/new?template=adopter_check_in.yml",
]);
requireText("SUPPORT.md", ["SECURITY.md", "CODE_OF_CONDUCT.md"]);
requireText("GOVERNANCE.md", [".github/CODEOWNERS", "docs/COMPATIBILITY.md"]);
if (
  rootPackage.scripts?.["security:repository"] !== "node scripts/repository-security-policy.mjs" ||
  !rootPackage.scripts?.["public:check"]?.includes("node scripts/repository-security-policy.mjs")
)
  problems.push("package.json must expose and run the repository security desired-state policy");
const compatibility = requireText("docs/COMPATIBILITY.md", [
  "deprecat",
  "migration",
  "peer dependency",
  "schema",
  "Template",
]);
const releasePolicy = JSON.parse(readFileSync(join(root, "contracts/documentation-release-policy.json"), "utf8"));
const currentRelease = releasePolicy.releases?.find(release => release.id === releasePolicy.currentRelease);
if (!currentRelease) {
  problems.push(`current release ${releasePolicy.currentRelease} is not declared`);
}

function requireArtifactVersionRow(path, artifact, version) {
  const rows = readFileSync(join(root, path), "utf8").split("\n");
  const matchingRows = rows
    .filter(line => line.startsWith("|") && line.includes(artifact))
    .map(line =>
      line
        .split("|")
        .slice(1, -1)
        .map(cell => cell.trim()),
    );
  if (matchingRows.length !== 1 || !matchingRows[0].includes(version)) {
    problems.push(`${path} must contain exactly one ${artifact} table row at ${version}`);
  }
}

for (const entry of currentRelease?.npm ?? []) {
  requireArtifactVersionRow("README.md", entry.package, entry.version);
  requireArtifactVersionRow("docs/COMPATIBILITY.md", entry.package, entry.version);
}
if (currentRelease?.jvm?.version) {
  requireArtifactVersionRow("docs/COMPATIBILITY.md", `${currentRelease.jvm.group}:vireo-*`, currentRelease.jvm.version);
}

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

for (const form of ["bug_report.yml", "feature_request.yml", "public_beta_feedback.yml", "adopter_check_in.yml"]) {
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
    evidenceCommand: "corepack npm run gate:fast",
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
const websiteContentRoot = join(root, "site/content");
const websiteManifest = JSON.parse(readFileSync(join(websiteContentRoot, "manifest.json"), "utf8"));
const websiteRoutes = new Set([
  "/",
  "/versions.json",
  ...websiteManifest.sections.flatMap(section => section.pages.map(page => page.path)),
  ...websiteManifest.standalone.map(page => page.path),
]);
const websiteLinkTokens = new Set(["{{STORYBOOK_URL}}", "{{TYPESCRIPT_API_URL}}", "{{JVM_API_URL}}"]);
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
    if (source.startsWith(`${websiteContentRoot}/`) && websiteLinkTokens.has(target)) continue;
    if (source.startsWith(`${websiteContentRoot}/`) && target.startsWith("/")) {
      if (!websiteRoutes.has(target))
        problems.push(`${relative(root, source)} links to undeclared website route ${rawTarget}`);
      continue;
    }
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
