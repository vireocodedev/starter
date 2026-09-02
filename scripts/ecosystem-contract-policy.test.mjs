import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contractPath = new URL("../contracts/ecosystem-release-contract.json", import.meta.url);
const {
  validateCandidatePackageFloors,
  validateEcosystemContract,
  validateProjectUpgradeTemplateCheckout,
  validatePublicWorkspaceLockEntries,
  validateTemplateCoordinates,
} = await import("./ecosystem-contract-policy.mjs");

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

test("rejects a release provenance identity that could drift across a repository rename", () => {
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  contract.npmPublicationProvenance.repositoryId = "not-stable";
  contract.npmPublicationProvenance.workflowRef = "refs/heads/release";

  const result = validateEcosystemContract(contract);

  assert.ok(result.problems.some(problem => problem.includes("npm provenance repository id")));
  assert.ok(result.problems.some(problem => problem.includes("npm provenance workflow ref")));
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

test("candidate Vireo dependencies exactly match the current public coordinate subset", () => {
  const publicNode = {
    frontendDependencies: {
      "@vireocodedev/history": "^0.2.2",
      "@vireocodedev/ui": "^0.3.0",
    },
  };
  const currentNpm = [
    { name: "@vireocodedev/history", version: "0.2.2" },
    { name: "@vireocodedev/ui", version: "0.3.1" },
  ];
  assert.deepEqual(
    validateCandidatePackageFloors(
      { frontendDependencies: { "@vireocodedev/history": "^0.2.2", "@vireocodedev/ui": "^0.3.1" } },
      publicNode,
      currentNpm,
    ),
    [],
  );
  assert.match(
    validateCandidatePackageFloors(
      { frontendDependencies: { "@vireocodedev/history": "^0.2.2", "@vireocodedev/ui": "^0.3.0" } },
      publicNode,
      currentNpm,
    ).join("\n"),
    /@vireocodedev\/ui must exactly equal current public \^0\.3\.1/u,
  );
  assert.match(
    validateCandidatePackageFloors(
      { frontendDependencies: { "@vireocodedev/history": "^0.2.2", "@vireocodedev/ui": "^0.3.2" } },
      publicNode,
      currentNpm,
    ).join("\n"),
    /@vireocodedev\/ui must exactly equal current public \^0\.3\.1/u,
  );
  assert.match(
    validateCandidatePackageFloors(
      { frontendDependencies: { "@vireocodedev/history": "^0.2.2", "@vireocodedev/sqlite": "^0.2.3" } },
      publicNode,
      currentNpm,
    ).join("\n"),
    /@vireocodedev\/ui must exactly equal[\s\S]*@vireocodedev\/sqlite is not declared/u,
  );
});

test("project-upgrade CI checks out the immutable active Template target", () => {
  const commit = "a".repeat(40);
  const workflow = `steps:\n  - uses: actions/checkout@sha\n    with:\n      repository: vireocodedev/vireo-template\n      ref: ${commit}\n`;
  assert.deepEqual(validateProjectUpgradeTemplateCheckout(workflow, commit), []);
  assert.match(
    validateProjectUpgradeTemplateCheckout(workflow, "b".repeat(40)).join("\n"),
    /must match active target/u,
  );
  assert.match(validateProjectUpgradeTemplateCheckout("steps: []\n", commit).join("\n"), /exactly one/u);
  assert.match(validateProjectUpgradeTemplateCheckout(`${workflow}${workflow}`, commit).join("\n"), /exactly one/u);
});
