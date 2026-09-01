import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APPLICATION_PROJECTION_CATEGORIES,
  classifyProjectionPath,
  validateApplicationIdentity,
  validateApplicationProjectionContract,
} from "./lib/application-projection-contract.mjs";

const contract = JSON.parse(readFileSync("contracts/application-projection-contract.json", "utf8"));
const clone = value => structuredClone(value);

test("the checked-in application projection contract is semantically valid", () => {
  assert.deepEqual(validateApplicationProjectionContract(contract), []);
  assert.deepEqual(Object.keys(contract.categories).sort(), [...APPLICATION_PROJECTION_CATEGORIES].sort());
});

test("flagship operations and historical evidence are excluded from every project profile", () => {
  for (const profile of contract.profiles) {
    for (const path of [
      ".github/workflows/flagship-demo.yml",
      ".github/workflows/support-evidence.yml",
      ".performance-evidence/lighthouse.json",
      ".verification-evidence/latest.json",
      "contracts/flagship-demo-policy.json",
      "deploy/hetzner/deploy.sh",
      "docs/flagship.md",
    ]) {
      assert.equal(classifyProjectionPath(contract, path, profile)?.disposition, "exclude", `${profile}: ${path}`);
    }
  }
});

test("template release operations are excluded from every project profile", () => {
  for (const profile of contract.profiles) {
    for (const path of [
      ".github/workflows/template-release.yml",
      "contracts/template-release-policy.json",
      "scripts/template-release-policy.mjs",
      "scripts/template-release-policy.test.mjs",
      "scripts/write-template-release-manifest.mjs",
    ]) {
      const classification = classifyProjectionPath(contract, path, profile);
      assert.equal(classification?.category, "maintainer-only", `${profile}: ${path}`);
      assert.equal(classification?.disposition, "exclude", `${profile}: ${path}`);
    }
  }
});

test("template maintainer policy wrappers are excluded from full-stack projects", () => {
  for (const path of [
    "contracts/platform-support-policy.json",
    "scripts/platform-support-policy.mjs",
    "scripts/public-contract-policy.mjs",
    "scripts/verification-pipeline-policy.mjs",
    "scripts/vireo-package-compatibility-policy.mjs",
  ]) {
    const classification = classifyProjectionPath(contract, path, "full-stack");
    assert.equal(classification?.category, "maintainer-only", path);
    assert.equal(classification?.disposition, "exclude", path);
    assert.equal(classifyProjectionPath(contract, path, "frontend")?.disposition, "exclude", `frontend: ${path}`);
  }
});

test("classification is profile-aware, specificity-based, and fail closed", () => {
  assert.equal(classifyProjectionPath(contract, "frontend/src/app/App.tsx", "frontend")?.category, "application-owned");
  assert.equal(
    classifyProjectionPath(contract, "frontend/package.json", "frontend")?.category,
    "substitution-required",
  );
  assert.equal(classifyProjectionPath(contract, "scripts/setup.mjs", "full-stack")?.category, "managed");
  assert.equal(
    classifyProjectionPath(contract, "docs/recipes/rehearse-demo-reset.md", "full-stack")?.category,
    "maintainer-only",
  );
  assert.equal(
    classifyProjectionPath(contract, "docs/recipes/rehearse-demo-reset.md", "frontend")?.category,
    "maintainer-only",
  );
  assert.equal(
    classifyProjectionPath(contract, "frontend/pwa-policy.mjs", "full-stack")?.category,
    "substitution-required",
  );
  assert.equal(classifyProjectionPath(contract, "pwa-policy.mjs", "frontend")?.category, "substitution-required");
  assert.equal(
    classifyProjectionPath(contract, "frontend/scripts/app-identity-html.mjs", "full-stack")?.category,
    "managed",
  );
  assert.equal(classifyProjectionPath(contract, "scripts/app-identity-html.mjs", "frontend")?.category, "managed");
  assert.equal(
    classifyProjectionPath(contract, "frontend/scripts/app-identity-html.d.mts", "full-stack")?.category,
    "managed",
  );
  assert.equal(classifyProjectionPath(contract, "scripts/app-identity-html.d.mts", "frontend")?.category, "managed");
  assert.equal(
    classifyProjectionPath(contract, "frontend/tests/contract/pwa-contract.test.mjs", "full-stack")?.category,
    "managed",
  );
  assert.equal(
    classifyProjectionPath(contract, "tests/contract/pwa-contract.test.mjs", "frontend")?.category,
    "managed",
  );
  assert.equal(classifyProjectionPath(contract, ".gitignore", "frontend")?.category, "maintainer-only");
  assert.equal(classifyProjectionPath(contract, "frontend/scripts/verify.sh", "full-stack")?.category, "managed");
  assert.equal(classifyProjectionPath(contract, "frontend/scripts/verify.sh", "frontend")?.category, "maintainer-only");
  assert.equal(
    classifyProjectionPath(contract, "scripts/project-identity-policy.mjs", "full-stack")?.category,
    "managed",
  );
  assert.equal(
    classifyProjectionPath(contract, "scripts/public-contract-policy.mjs", "full-stack")?.category,
    "maintainer-only",
  );
  assert.equal(classifyProjectionPath(contract, ".vscode/settings.json", "full-stack")?.category, "optional");
  assert.equal(classifyProjectionPath(contract, ".vscode/settings.json", "frontend")?.category, "maintainer-only");
  assert.equal(
    classifyProjectionPath(contract, "frontend/tests/pwa/production-pwa.spec.ts", "full-stack")?.category,
    "managed",
  );
  assert.equal(classifyProjectionPath(contract, "tests/pwa/production-pwa.spec.ts", "frontend")?.category, "managed");
  assert.equal(classifyProjectionPath(contract, "frontend/vite.config.ts", "full-stack")?.category, "managed");
  assert.equal(classifyProjectionPath(contract, "vite.config.ts", "frontend")?.category, "managed");
  for (const path of [
    "index.html",
    "nginx.conf",
    "playwright.pwa.config.ts",
    "scripts/verify-frontend-profile.sh",
    "scripts/vireo-frontend-doctor.mjs",
    "scripts/project-identity-policy.mjs",
  ]) {
    assert.equal(classifyProjectionPath(contract, path, "frontend")?.category, "managed", path);
  }
  assert.equal(
    classifyProjectionPath(contract, "frontend/src/app/ui/localization/resources/app.en.ts", "full-stack")?.category,
    "application-owned",
  );
  assert.equal(
    classifyProjectionPath(contract, "src/app/ui/localization/resources/app.en.ts", "frontend")?.category,
    "maintainer-only",
  );
  assert.equal(
    classifyProjectionPath(contract, "frontend/src/app/ui/localization/resources/app.en.ts", "frontend")?.category,
    "application-owned",
  );
  assert.equal(
    classifyProjectionPath(contract, "frontend/public/icons/icon-192x192.png", "full-stack")?.category,
    "application-owned",
  );
  assert.equal(
    classifyProjectionPath(contract, "public/icons/icon-192x192.png", "frontend")?.category,
    "application-owned",
  );
  assert.equal(classifyProjectionPath(contract, "new-maintainer-surface.txt", "full-stack"), undefined);
});

test("the validator rejects ambiguous and missing ownership decisions", () => {
  const ambiguous = clone(contract);
  ambiguous.rules.push({
    id: "ambiguous-security",
    category: "application-owned",
    profiles: ["full-stack"],
    paths: ["SECURITY.md"],
    prefixes: [],
  });
  assert.match(validateApplicationProjectionContract(ambiguous).join("\n"), /SECURITY\.md is declared by both/u);

  const missing = clone(contract);
  missing.rules = missing.rules.map(rule => ({
    ...rule,
    paths: rule.paths.filter(path => path !== ".github/workflows/flagship-demo.yml"),
  }));
  assert.match(validateApplicationProjectionContract(missing).join("\n"), /flagship-demo\.yml is unclassified/u);
});

test("creation permits explicit unresolved release routes but release validation blocks them", () => {
  const identity = {
    projectName: "inventory-app",
    displayName: "Inventory App",
    ownerName: "UNRESOLVED_VIREO_OWNER_NAME",
    repositoryUrl: "UNRESOLVED_VIREO_REPOSITORY_URL",
    supportUrl: "UNRESOLVED_VIREO_SUPPORT_URL",
    securityContact: "UNRESOLVED_VIREO_SECURITY_CONTACT",
  };
  assert.deepEqual(validateApplicationIdentity(contract, identity, "creation"), []);
  assert.deepEqual(validateApplicationIdentity(contract, identity, "release"), [
    "ownerName is unresolved",
    "repositoryUrl is unresolved",
    "supportUrl is unresolved",
    "securityContact is unresolved",
  ]);
});

test("release identity must be application-owned and route security separately", () => {
  const valid = {
    projectName: "inventory-app",
    displayName: "Inventory App",
    ownerName: "Acme Operations",
    repositoryUrl: "https://github.com/acme/inventory-app",
    supportUrl: "https://support.acme.example/inventory",
    securityContact: "mailto:security@acme.example",
  };
  assert.deepEqual(validateApplicationIdentity(contract, valid), []);
  assert.match(
    validateApplicationIdentity(contract, {
      ...valid,
      repositoryUrl: "https://github.com/vireocodedev/vireo-template",
      securityContact: valid.supportUrl,
    }).join("\n"),
    /must not inherit a Vireo[\s\S]*must be distinct/u,
  );
  for (const identity of [
    {
      ...valid,
      supportUrl: "https://support.acme.example/inventory",
      securityContact: "https://support.acme.example/inventory/",
    },
    {
      ...valid,
      supportUrl: "mailto:Security@acme.example",
      securityContact: "mailto:security@acme.example",
    },
  ]) {
    assert.match(
      validateApplicationIdentity(contract, identity).join("\n"),
      /supportUrl and securityContact must be distinct/u,
    );
  }
});
