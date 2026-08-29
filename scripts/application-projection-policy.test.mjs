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

test("classification is profile-aware, specificity-based, and fail closed", () => {
  assert.equal(classifyProjectionPath(contract, "frontend/src/app/App.tsx", "frontend")?.category, "application-owned");
  assert.equal(
    classifyProjectionPath(contract, "frontend/package.json", "frontend")?.category,
    "substitution-required",
  );
  assert.equal(classifyProjectionPath(contract, "scripts/setup.mjs", "full-stack")?.category, "managed");
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
      repositoryUrl: "https://github.com/vireocodedev/starter-template",
      securityContact: valid.supportUrl,
    }).join("\n"),
    /generated application[\s\S]*must be distinct/u,
  );
});
