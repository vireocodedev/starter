import assert from "node:assert/strict";
import test from "node:test";
import { validatePackageIdentity, validateProductIdentity } from "./product-identity-policy.mjs";

test("accepts all current public product metadata", () => {
  assert.deepEqual(validateProductIdentity().problems, []);
});

test("rejects retired identity and registry routes that cannot guide a consumer", () => {
  const problems = validatePackageIdentity(
    {
      name: "@vireocodedev/example",
      description: "A vireocodedev starter product package.",
      homepage: "https://example.invalid",
      bugs: { url: "https://example.invalid/issues" },
      repository: { url: "https://example.invalid/repository", directory: "packages/wrong" },
    },
    "example",
  );

  assert.ok(problems.some(problem => problem.includes("identify Vireo")));
  assert.ok(problems.some(problem => problem.includes("retired product terminology")));
  assert.ok(problems.some(problem => problem.includes("homepage")));
  assert.ok(problems.some(problem => problem.includes("bugs URL")));
  assert.ok(problems.some(problem => problem.includes("source directory")));
});
