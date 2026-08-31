import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contractPath = new URL("../contracts/ecosystem-release-contract.json", import.meta.url);
const { validateEcosystemContract, validatePublicWorkspaceLockEntries, validateTemplateCoordinates } =
  await import("./ecosystem-contract-policy.mjs");

test("rejects public workspace lockfile version drift", () => {
  const packages = [{ directory: "create-vireo", name: "create-vireo", version: "0.6.0" }];
  assert.deepEqual(
    validatePublicWorkspaceLockEntries({ packages: { "packages/create-vireo": { version: "0.6.0" } } }, packages),
    [],
  );
  assert.match(
    validatePublicWorkspaceLockEntries({ packages: { "packages/create-vireo": { version: "0.5.0" } } }, packages).join(
      "\n",
    ),
    /create-vireo must be 0\.6\.0/u,
  );
});

test("compares documentation Template coordinates semantically", () => {
  const expected = {
    repository: "https://github.com/vireocodedev/vireo-template",
    version: "0.6.0",
    tag: "starter-template@0.6.0",
    commit: "a".repeat(40),
    releaseUrl: "https://github.com/vireocodedev/vireo-template/releases/tag/starter-template%400.6.0",
  };
  const reordered = {
    commit: expected.commit,
    repository: expected.repository,
    releaseUrl: expected.releaseUrl,
    tag: expected.tag,
    version: expected.version,
  };

  assert.deepEqual(validateTemplateCoordinates(reordered, expected, "documentation Template"), []);
  assert.match(
    validateTemplateCoordinates(
      { ...reordered, tag: "starter-template@0.5.0" },
      expected,
      "documentation Template",
    ).join("\n"),
    /documentation Template tag/u,
  );
});

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

test("rejects template release coordinates that drift from create-vireo", () => {
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  contract.current.template.version = "9.9.9";
  contract.current.template.tag = "starter-template@9.9.9";
  contract.current.template.releaseUrl = "https://example.test/template";
  contract.compatibility.sets[0].templateVersion = "9.9.9";
  contract.compatibility.sets[0].templateTag = "starter-template@9.9.9";
  contract.compatibility.sets[0].templateReleaseUrl = "https://example.test/template";

  const result = validateEcosystemContract(contract);

  for (const expected of ["Template version", "Template tag", "Template release URL"]) {
    assert.ok(
      result.problems.some(problem => problem.includes(expected)),
      expected,
    );
  }
});
