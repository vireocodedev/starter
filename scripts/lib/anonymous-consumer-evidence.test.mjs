import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { sanitizeCommandTail, sanitizeEvidence, writeEvidenceAtomically } from "./anonymous-consumer-evidence.mjs";

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

test("failure tails are bounded and redact paths, URL credentials, query values, and named secrets", () => {
  const tail = sanitizeCommandTail(
    `prefix ${"x".repeat(5_000)} /tmp/vireo-anonymous-consumer-private/report?token=leak ` +
      "https://bruno:password@example.invalid/private?api_key=leak TOKEN=leak Bearer leak C:\\Users\\bruno\\secret",
  );

  assert.ok(Buffer.byteLength(tail) <= 4_096);
  for (const value of ["leak", "password", "bruno", "/tmp/", "C:\\Users"]) assert.equal(tail.includes(value), false);
  assert.match(tail, /\[redacted\]|\[path\]/u);
});
