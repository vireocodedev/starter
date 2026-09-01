import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const BASE_EXCLUSIONS = [
  ".github/CODEOWNERS",
  ".github/workflows/flagship-demo.yml",
  ".github/workflows/support-evidence.yml",
  ".github/workflows/template-release.yml",
  "compose.demo.yaml",
  "contracts/flagship-demo-policy.json",
  "contracts/platform-support-policy.json",
  "contracts/template-release-policy.json",
  "scripts/flagship-demo-policy.mjs",
  "scripts/flagship-proof-policy.mjs",
  "scripts/platform-support-policy.mjs",
  "scripts/public-contract-policy.mjs",
  "scripts/reset-flagship-demo.sh",
  "scripts/template-release-policy.mjs",
  "scripts/template-release-policy.test.mjs",
  "scripts/verification-pipeline-policy.mjs",
  "scripts/vireo-package-compatibility-policy.mjs",
  "scripts/write-support-evidence.mjs",
  "scripts/write-template-release-manifest.mjs",
  "scripts/verify-template.sh",
  ".performance-evidence/",
  ".verification-evidence/",
  "deploy/hetzner/",
  "docs/assets/flagship-overview.png",
  "docs/flagship-demo.md",
  "docs/flagship.md",
  "docs/platform-support-evidence.md",
  "docs/recipes/rehearse-demo-reset.md",
  "docs/tutorials/evaluate-flagship.md",
  "docs/verification-performance.md",
  "frontend/docs/LOADING_STATE_AUDIT.md",
];

const FRONTEND_EXCLUSIONS = [
  ".github/workflows/",
  ".github/dependabot.yml",
  ".vscode/",
  ".gitleaks.toml",
  ".java-version",
  ".nvmrc",
  "build.gradle",
  "compose.dev.yaml",
  "compose.smoke.yaml",
  "compose.yaml",
  "gradle.properties",
  "gradle/",
  "gradlew",
  "gradlew.bat",
  "settings.gradle",
  "deploy/",
  "contracts/",
  "scripts/verify.sh",
  "playwright.demo.config.ts",
  "playwright.deployment.config.ts",
  "tests/demo/",
  "tests/deployment/",
  "tests/e2e/",
];

const FRONTEND_BACKEND_PREFIXES = ["src/main/java/", "src/test/java/", "src/main/resources/", "src/test/resources/"];

const FRONTEND_BACKEND_SUFFIXES = [".java", ".gradle"];
const TEMPLATE_ONLY_VERIFIER_REFERENCE =
  /(?:verify-template\.sh|flagship-(?:demo|proof)-policy\.mjs|platform-support-policy\.mjs|public-contract-policy\.mjs|reset-flagship-demo\.sh|template-release-policy\.mjs|verification-pipeline-policy\.mjs|vireo-package-compatibility-policy\.mjs|write-template-release-manifest\.mjs|release:policy)/gu;
const INITIAL_APPLICATION_VERSION = "0.1.0";

function walk(root, directory = root) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(root, path));
    else if (entry.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files.sort();
}

function matchesExcludedPath(path, excluded) {
  return excluded.endsWith("/") ? path.startsWith(excluded) : path === excluded;
}

function isFrontendBackendArtifact(path) {
  return (
    FRONTEND_BACKEND_PREFIXES.some(prefix => path.startsWith(prefix)) ||
    FRONTEND_BACKEND_SUFFIXES.some(suffix => path.endsWith(suffix))
  );
}

export function assertGeneratedProjectExclusions(files, profile) {
  const excluded = [...BASE_EXCLUSIONS, ...(profile === "frontend" ? FRONTEND_EXCLUSIONS : [])];
  const present = files.filter(
    path =>
      excluded.some(rule => matchesExcludedPath(path, rule)) ||
      (profile === "frontend" && isFrontendBackendArtifact(path)),
  );
  if (present.length > 0) throw new Error(`${profile} projection contains excluded paths: ${present.join(", ")}`);
}

function text(path) {
  return readFileSync(path, "utf8");
}

function readGeneratedCiConcurrency(root) {
  const source = text(join(root, ".github", "workflows", "ci.yml"));
  const concurrency = source.match(/^concurrency:\s*\n(?<body>(?:^[ \t]+[^\n]*(?:\n|$))*)/mu)?.groups?.body;
  if (!concurrency) throw new Error("Generated ci.yml must declare a concurrency block.");
  const groups = [...concurrency.matchAll(/^\s+group:\s*(\S(?:.*\S)?)\s*$/gmu)].map(match => match[1]);
  const cancelValues = [...concurrency.matchAll(/^\s+cancel-in-progress:\s*(true|false)\s*$/gmu)].map(
    match => match[1],
  );
  if (groups.length !== 1 || cancelValues.length !== 1) {
    throw new Error("Generated ci.yml concurrency block must declare one group and cancel-in-progress value.");
  }
  return { group: groups[0], cancelInProgress: cancelValues[0] === "true" };
}

function hasExactGeneratedConcurrencyPolicy(value, expected) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 2 &&
    value.group === expected.group &&
    value.cancelInProgress === expected.cancelInProgress
  );
}

export function assertGeneratedProjectIdentity(root, profile, identity) {
  const metadata = JSON.parse(text(join(root, ".vireo/project.json")));
  for (const [field, value] of Object.entries({ profile, ...identity })) {
    if (metadata[field] !== value) throw new Error(`Generated metadata must contain ${field}=${JSON.stringify(value)}`);
  }
  const surfaces = ["README.md", "SECURITY.md", "SUPPORT.md", ".github/ISSUE_TEMPLATE/config.yml"];
  const joined = surfaces.map(path => text(join(root, path))).join("\n");
  for (const value of [identity.repositoryUrl, identity.supportUrl, identity.securityContact]) {
    if (!joined.includes(value)) throw new Error(`Generated public identity must render ${value}`);
  }
  if (/github\.com\/vireocodedev\/(?:starter|starter-template|vireo|vireo-template)/iu.test(joined)) {
    throw new Error("Generated public identity inherits a Vireo repository, support, or security route.");
  }
}

export function assertGeneratedProjectTemplateMetadata(root, template) {
  const metadata = JSON.parse(text(join(root, ".vireo/project.json")));
  const expected = {
    templateCommit: template.commit,
    templateVersion: template.version,
    templateTag: template.tag,
    createdBy: `create-vireo@${template.version}`,
  };
  for (const [field, value] of Object.entries(expected)) {
    if (metadata[field] !== value) throw new Error(`Generated metadata must contain ${field}=${JSON.stringify(value)}`);
  }
}

export function assertGeneratedApplicationPackage(root, profile) {
  const packageJson = JSON.parse(text(join(root, "package.json")));
  if (packageJson.version !== INITIAL_APPLICATION_VERSION) {
    throw new Error(`Generated ${profile} package version must be ${INITIAL_APPLICATION_VERSION}.`);
  }
  if (packageJson.scripts?.["release:policy"] !== undefined) {
    throw new Error("Generated package.json must not retain the Template release:policy script.");
  }
  const metadata = JSON.parse(text(join(root, ".vireo/project.json")));
  const expectedVireo = `npx --yes --package=${metadata.createdBy} vireo`;
  if (packageJson.scripts?.vireo !== expectedVireo) {
    throw new Error(`Generated package vireo script must pin ${metadata.createdBy}.`);
  }
  if (profile !== "full-stack") return;

  const frontendPackage = JSON.parse(text(join(root, "frontend", "package.json")));
  if (frontendPackage.scripts?.["toolchain:check"] !== "node ../scripts/toolchain-policy.mjs") {
    throw new Error("Generated frontend toolchain:check must not invoke the Template platform-support wrapper.");
  }
  const toolchainPolicy = text(join(root, "scripts", "toolchain-policy.mjs"));
  if (toolchainPolicy.includes("platform-support-policy")) {
    throw new Error("Generated toolchain policy must not depend on the excluded Template platform-support policy.");
  }
}

export function assertGeneratedWorkflowPolicy(root, profile) {
  if (profile !== "full-stack") return;
  const policy = JSON.parse(text(join(root, "contracts", "github-actions-policy.json")));
  const workflows = policy.requiredConcurrencyWorkflows;
  if (!workflows || typeof workflows !== "object" || Array.isArray(workflows) || !("ci.yml" in workflows)) {
    throw new Error("Generated GitHub Actions policy must retain the ci.yml concurrency workflow.");
  }
  const ciConcurrency = readGeneratedCiConcurrency(root);
  if (!hasExactGeneratedConcurrencyPolicy(workflows["ci.yml"], ciConcurrency)) {
    throw new Error("Generated GitHub Actions ci.yml concurrency policy must exactly match ci.yml.");
  }
  if ("template-release.yml" in workflows) {
    throw new Error("Generated GitHub Actions policy must not retain template-release.yml.");
  }
}

export function assertGeneratedProjectReleaseIdentity(root, profile) {
  const policyPath = join(root, "scripts", "project-identity-policy.mjs");
  if (!existsSync(policyPath)) throw new Error("Generated project is missing scripts/project-identity-policy.mjs.");
  const policy = text(policyPath);
  if (
    !policy.includes("IDENTITY_CONTRACT") ||
    !policy.includes("--release") ||
    !policy.includes(`EXPECTED_PROFILE = "${profile}"`)
  ) {
    throw new Error("Generated project identity policy does not embed the release identity contract.");
  }
  const packageJson = JSON.parse(text(join(root, "package.json")));
  const expectedScripts = {
    "identity:check": "node scripts/project-identity-policy.mjs",
    "identity:check:release": "node scripts/project-identity-policy.mjs --release",
    "verify:release": "corepack npm run identity:check:release && corepack npm run verify",
  };
  for (const [name, command] of Object.entries(expectedScripts)) {
    if (packageJson.scripts?.[name] !== command)
      throw new Error(`Generated package script ${name} must run the project identity policy.`);
  }
  if (!text(join(root, "README.md")).includes("corepack npm run verify:release")) {
    throw new Error("Generated README must document verify:release.");
  }
}

export function assertGeneratedMarkdownLinks(root, files = walk(root)) {
  const failures = [];
  for (const path of files.filter(path => path.endsWith(".md"))) {
    const source = text(join(root, path));
    for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu)) {
      const target = match[1].trim().replace(/^<|>$/gu, "");
      if (!target || /^(?:https?:|mailto:|#)/iu.test(target)) continue;
      const localTarget = decodeURIComponent(target.split("#", 1)[0].split("?", 1)[0]);
      if (!localTarget) continue;
      const resolved = resolve(dirname(join(root, path)), localTarget);
      const relativeTarget = relative(root, resolved);
      if (
        relativeTarget === ".." ||
        relativeTarget.startsWith(`..${sep}`) ||
        !existsSync(resolved) ||
        (!statSync(resolved).isFile() && !statSync(resolved).isDirectory())
      ) {
        failures.push(`${path} -> ${target}`);
      }
    }
  }
  if (failures.length > 0) throw new Error(`Generated Markdown contains broken relative links: ${failures.join(", ")}`);
}

export function assertGeneratedVerificationSplit(root, profile, files = walk(root)) {
  const textFiles = files.filter(path => /\.(?:json|md|mjs|sh|ya?ml)$/u.test(path));
  const templateOnlyReferences = textFiles.flatMap(path =>
    [...text(join(root, path)).matchAll(TEMPLATE_ONLY_VERIFIER_REFERENCE)].map(match => `${path} -> ${match[0]}`),
  );
  if (templateOnlyReferences.length > 0) {
    throw new Error(`Generated project references a template-only verifier: ${templateOnlyReferences.join(", ")}`);
  }
  if (profile === "full-stack") {
    const verify = text(join(root, "scripts/verify.sh"));
    const workflow = text(join(root, ".github/workflows/ci.yml"));
    if (
      /verify-template|flagship-(?:demo|proof)/u.test(verify) ||
      !verify.includes('"project-identity|Project identity|node scripts/project-identity-policy.mjs"') ||
      !workflow.includes("./scripts/verify.sh")
    ) {
      throw new Error("Full-stack project does not use the app-safe verification split.");
    }
    assertGeneratedVerificationBudgetAlignment(root);
  } else {
    if (existsSync(join(root, "scripts/verify.sh")) || !existsSync(join(root, "scripts/verify-frontend-profile.sh"))) {
      throw new Error("Frontend project must contain only its frontend verifier.");
    }
    const frontendVerify = text(join(root, "scripts/verify-frontend-profile.sh"));
    if (!/^steps=\(\n\s*"Project identity\|node scripts\/project-identity-policy\.mjs"/mu.test(frontendVerify)) {
      throw new Error("Frontend project must run the creation-phase identity check first.");
    }
  }
}

export function assertGeneratedVerificationBudgetAlignment(root) {
  const verify = text(join(root, "scripts/verify.sh"));
  const budget = JSON.parse(text(join(root, "contracts/verification-budget-policy.json")));
  const verifyStages = [...verify.matchAll(/^\s*"([a-z0-9-]+)\|/gmu)].map(match => match[1]).sort();
  const budgetStages = Object.keys(budget.stages ?? {}).sort();
  if (JSON.stringify(verifyStages) !== JSON.stringify(budgetStages)) {
    throw new Error(
      `Generated verifier and budget stages disagree: verifier=${verifyStages.join(",")} budget=${budgetStages.join(",")}`,
    );
  }
}

export function assertExactGeneratedProject({ root, profile, identity, template }) {
  const files = walk(root);
  assertGeneratedProjectExclusions(files, profile);
  assertGeneratedProjectIdentity(root, profile, identity);
  assertGeneratedProjectTemplateMetadata(root, template);
  assertGeneratedApplicationPackage(root, profile);
  assertGeneratedProjectReleaseIdentity(root, profile);
  assertGeneratedWorkflowPolicy(root, profile);
  assertGeneratedVerificationSplit(root, profile, files);
  assertGeneratedMarkdownLinks(root, files);
  return files;
}
