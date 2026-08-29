import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveGateExecution } from "./run-ecosystem-gate.mjs";

const contract = JSON.parse(
  readFileSync(new URL("../contracts/ecosystem-release-contract.json", import.meta.url), "utf8"),
);

test("resolves each named gate to a shell-free execution", () => {
  for (const name of ["fast", "full", "release"]) {
    const execution = resolveGateExecution(contract, name);
    assert.ok(execution.executable);
    assert.ok(execution.arguments.length > 0);
    assert.ok(execution.scope);
  }
});

test("rejects unknown and malformed gate definitions", () => {
  assert.throws(() => resolveGateExecution(contract, "missing"), /Unknown ecosystem gate/u);
  assert.throws(
    () => resolveGateExecution({ gates: { unsafe: { execution: { executable: "sh" } } } }, "unsafe"),
    /no valid execution contract/u,
  );
});
