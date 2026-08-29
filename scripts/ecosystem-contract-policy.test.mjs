import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contractPath = new URL("../contracts/ecosystem-release-contract.json", import.meta.url);
const { validateEcosystemContract } = await import("./ecosystem-contract-policy.mjs");

test("accepts the repository's internally consistent release contract", () => {
  const result = validateEcosystemContract();

  assert.deepEqual(result.problems, []);
  assert.match(result.summary, /Ecosystem release contract passed/u);
});

test("rejects an artifact version that drifts from its package manifest", () => {
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  contract.current.npm.find(entry => entry.name === "@vireocodedev/sqlite").version = "99.0.0";

  const result = validateEcosystemContract(contract);

  assert.ok(result.problems.some(problem => problem.includes("current npm artifacts")));
});
