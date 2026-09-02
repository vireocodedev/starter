import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { sanitizeEvidence, writeEvidenceAtomically } from "./anonymous-consumer-evidence.mjs";

test("evidence redacts credentials and is atomically published", () => {
  const root = mkdtempSync(join(tmpdir(), "anonymous-evidence-"));
  const path = join(root, "evidence", "evidence.json");
  assert.deepEqual(sanitizeEvidence({ npmToken: "private", output: "Bearer private" }), {
    npmToken: "[redacted]",
    output: "Bearer [redacted]",
  });
  writeEvidenceAtomically(path, { npmToken: "private", nested: { authorization: "private" } });
  assert.equal(existsSync(path), true);
  assert.doesNotMatch(readFileSync(path, "utf8"), /private/u);
});
