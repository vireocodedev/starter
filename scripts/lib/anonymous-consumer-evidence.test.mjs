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
  assert.match(tail, /\[redacted\]|\[path\]|\[truncated command output\]/u);
});

test("complete failure tails redact paths, URL userinfo, queries, and named credentials", () => {
  const tail = sanitizeCommandTail(
    "TOKEN=leak /tmp/private/report?token=leak https://bruno:password@example.invalid/private?api_key=leak",
  );

  for (const value of ["leak", "password", "bruno", "/tmp/"]) assert.equal(tail.includes(value), false);
  assert.match(tail, /\[redacted\]/u);
  assert.match(tail, /\[path\]/u);
});

test("a cut-off first line is discarded instead of preserving a secret suffix", () => {
  const tail = sanitizeCommandTail(`${"partial-secret-suffix".repeat(8)}\nTOKEN=other-secret\nsafe`, {
    maximumBytes: 64,
  });

  assert.ok(Buffer.byteLength(tail) <= 64);
  assert.match(tail, /^\[truncated command output\]/u);
  for (const value of ["partial-secret-suffix", "other-secret"]) assert.equal(tail.includes(value), false);
});

test("truncated multibyte tails honor the exact byte bound without replacement characters", () => {
  const tail = sanitizeCommandTail(`discarded-prefix\n${"🦊".repeat(10)}`, { maximumBytes: 35 });

  assert.equal(Buffer.byteLength(tail), 35);
  assert.equal(tail, Buffer.from(tail, "utf8").toString("utf8"));
  assert.equal(tail.endsWith("🦊🦊"), true);
});
