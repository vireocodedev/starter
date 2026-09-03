import assert from "node:assert/strict";
import test from "node:test";
import { classifyReleaseRunArtifacts } from "./release-run-artifacts.mjs";

const payload = artifacts => ({ total_count: artifacts.length, artifacts });
const artifact = (id, name) => ({ id, name });

test("selects only exact retained Central intent and receipt names", () => {
  const result = classifyReleaseRunArtifacts(
    payload([
      artifact(1, "maven-central-intent-123-1"),
      artifact(2, "maven-central-receipt-123-1"),
      artifact(3, "maven-central-promotion-attempt-123-1"),
      artifact(4, "other"),
    ]),
    "123",
  );
  assert.deepEqual(
    result.intents.map(value => value.id),
    [1],
  );
  assert.deepEqual(
    result.receipts.map(value => value.id),
    [2],
  );
  assert.deepEqual(
    result.promotionAttempts.map(value => value.id),
    [3],
  );
});

test("fails closed for a truncated or malformed paginated artifact response", () => {
  assert.throws(
    () =>
      classifyReleaseRunArtifacts({ total_count: 2, artifacts: [artifact(1, "maven-central-intent-123-1")] }, "123"),
    /incomplete or malformed/u,
  );
  assert.throws(
    () => classifyReleaseRunArtifacts(payload([{ id: "1", name: "maven-central-intent-123-1" }]), "123"),
    /invalid artifact identity/u,
  );
});
