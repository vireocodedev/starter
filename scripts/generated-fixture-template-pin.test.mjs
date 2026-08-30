import assert from "node:assert/strict";
import test from "node:test";

import {
  assertGeneratedFixtureTemplatePin,
  assertGeneratedFixtureTemplatePinFromRepository,
} from "./lib/generated-fixture-template-pin.mjs";

const templateCommit = "11e1795a798d5dbaee9344b8ff207d5b0ea59657";
const contract = { current: { template: { commit: templateCommit } } };

test("requires the built create-vireo template pin to match the release contract", () => {
  assert.equal(assertGeneratedFixtureTemplatePin({ contract, templateCommit }), templateCommit);
  assert.throws(
    () => assertGeneratedFixtureTemplatePin({ contract, templateCommit: "0".repeat(40) }),
    /Generated fixture template pin mismatch/u,
  );
});

test("fails closed when the release contract or built template pin is malformed", () => {
  assert.throws(
    () =>
      assertGeneratedFixtureTemplatePin({ contract: { current: { template: { commit: "short" } } }, templateCommit }),
    /current\.template\.commit/u,
  );
  assert.throws(() => assertGeneratedFixtureTemplatePin({ contract, templateCommit: "short" }), /TEMPLATE_COMMIT/u);
});

test("loads the release contract through the injected reader before comparing the template pin", async () => {
  const reads = [];
  await assertGeneratedFixtureTemplatePinFromRepository({
    repositoryRoot: "/repository",
    templateCommit,
    readContract: async (...args) => {
      reads.push(args);
      return JSON.stringify(contract);
    },
  });
  assert.deepEqual(reads, [["/repository/contracts/ecosystem-release-contract.json", "utf8"]]);
});
