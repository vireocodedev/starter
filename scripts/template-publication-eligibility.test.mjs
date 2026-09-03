import assert from "node:assert/strict";
import test from "node:test";
import { createVireoVersionChanged, templatePublicationEligibility } from "./template-publication-eligibility.mjs";

test("skips stale adopted Template receipts for ordinary ecosystem releases", () => {
  assert.deepEqual(templatePublicationEligibility({ changedCli: false, intent: { status: "adopted" } }), {
    shouldPlan: false,
    reason: "No CLI coordinate change or pending Template adoption",
  });
});
test("retains strict planning for changed or pending CLI adoption", () => {
  assert.equal(templatePublicationEligibility({ changedCli: true, intent: { status: "adopted" } }).shouldPlan, true);
  assert.equal(templatePublicationEligibility({ changedCli: false, intent: { status: "candidate" } }).shouldPlan, true);
});
test("metadata-only create-vireo manifest changes do not invoke stale Template planning", () => {
  assert.equal(
    createVireoVersionChanged({
      parentManifest: { version: "0.8.7", description: "before" },
      currentManifest: { version: "0.8.7", description: "after" },
    }),
    false,
  );
});
