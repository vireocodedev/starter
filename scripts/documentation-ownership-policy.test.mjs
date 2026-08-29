import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  checkCheckedInDocumentationOwnership,
  classifyDocumentationPath,
  validateDocumentationInventory,
  validateDocumentationOwnershipContract,
} from "./lib/documentation-ownership-contract.mjs";

const contract = JSON.parse(readFileSync("contracts/documentation-ownership-contract.json", "utf8"));
const clone = value => structuredClone(value);

test("the checked-in documentation inventory has one valid ownership classification", () => {
  const result = checkCheckedInDocumentationOwnership(process.cwd(), contract);
  assert.deepEqual(result.problems, []);
  assert.ok(result.documents.length > 100);
});

test("current, versioned, historical, generated, and application documents resolve semantically", () => {
  assert.equal(
    classifyDocumentationPath(contract, "starter", "site/content/getting-started.md")?.category,
    "canonical",
  );
  assert.equal(classifyDocumentationPath(contract, "starter", "packages/ui/README.md")?.category, "exact-version");
  assert.equal(
    classifyDocumentationPath(contract, "starter", "docs/roadmap/execution-plan.md")?.category,
    "historical",
  );
  assert.equal(classifyDocumentationPath(contract, "generated-output", "search-index.json")?.category, "generated");
  assert.equal(
    classifyDocumentationPath(contract, "generated-application", "SECURITY.md")?.category,
    "application-owned",
  );
});

test("an unknown document fails closed", () => {
  assert.ok(
    validateDocumentationInventory(contract, [
      { repository: "starter", path: "unowned/new-guide.md", title: "New guide" },
    ]).includes("starter:unowned/new-guide.md is unclassified"),
  );
});

test("equal-specificity ownership conflicts are rejected", () => {
  const conflicting = clone(contract);
  conflicting.rules.push({
    id: "conflicting-readme",
    repository: "starter",
    category: "historical",
    paths: ["README.md"],
    prefixes: [],
  });
  assert.match(validateDocumentationOwnershipContract(conflicting).join("\n"), /README\.md is owned by both/u);
  assert.throws(() => classifyDocumentationPath(conflicting, "starter", "README.md"), /conflicting ownership rules/u);
});

test("conflicting duplicate titles require an exact canonical resolution", () => {
  const documents = [
    { repository: "starter", path: "site/content/security.md", title: "Security" },
    { repository: "starter", path: "docs/security/incident-response.md", title: "Security" },
  ];
  const changed = clone(contract);
  changed.rules[0].paths.push("docs/security/incident-response.md");
  assert.match(validateDocumentationInventory(changed, documents).join("\n"), /duplicate title "security"/u);
});

test("stale duplicate-title exceptions are rejected", () => {
  const changed = clone(contract);
  changed.duplicateTitleResolutions.push({
    normalizedTitle: "unused exception",
    canonicalPath: "site/content/security.md",
    paths: ["docs/security/incident-response.md", "site/content/security.md"],
    purpose: "test corruption",
  });
  const result = checkCheckedInDocumentationOwnership(process.cwd(), changed);
  assert.match(result.problems.join("\n"), /duplicate title resolution "unused exception" is stale/u);
});
