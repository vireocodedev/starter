import assert from "node:assert/strict";
import test from "node:test";
import {
  bundleReceipt,
  classifyCentralVisibility,
  expectedMavenPurls,
  finalizeReceipt,
  validateBundleReceipt,
} from "./maven-central-release-state.mjs";

test("classifies only all-absent or all-public Maven coordinates", () => {
  assert.equal(classifyCentralVisibility([404, 404, 404, 404, 404, 404]), "absent");
  assert.equal(classifyCentralVisibility([200, 200, 200, 200, 200, 200]), "public");
  assert.throws(() => classifyCentralVisibility([200, 404, 404, 404, 404, 404]), /partial/u);
});
test("binds Central receipt to the exact bundle, run, and expected PURLs", () => {
  const intent = bundleReceipt({
    version: "0.3.2",
    sha: "a".repeat(40),
    runId: 12,
    runAttempt: 1,
    bundle: "b".repeat(64),
  });
  assert.deepEqual(intent.purls, expectedMavenPurls("0.3.2"));
  assert.equal(
    finalizeReceipt(intent, "A1234567-1234-1234-1234-1234567890AB").deploymentId,
    "a1234567-1234-1234-1234-1234567890ab",
  );
  assert.throws(() => finalizeReceipt(intent, "not-a-uuid"), /UUID/u);
});
test("rejects a Maven upload intent unless every transaction field and PURL matches", () => {
  const expected = { version: "0.3.2", sha: "a".repeat(40), runId: 12, runAttempt: 1, bundle: "b".repeat(64) };
  const intent = bundleReceipt(expected);
  assert.deepEqual(validateBundleReceipt(intent, expected), intent);
  assert.throws(() => validateBundleReceipt({ ...intent, purls: intent.purls.slice(1) }, expected), /exactly bind/u);
  assert.throws(() => validateBundleReceipt({ ...intent, bundle: "c".repeat(64) }, expected), /exactly bind/u);
});
