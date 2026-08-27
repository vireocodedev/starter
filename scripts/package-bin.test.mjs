import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { resolvePackageBin } from "./package-bin.mjs";

function withPackage(manifest, assertion) {
  const directory = mkdtempSync(join(tmpdir(), "vireo-package-bin-"));
  try {
    writeFileSync(join(directory, "package.json"), JSON.stringify(manifest));
    assertion(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("resolves a preferred executable from an object bin field", () => {
  withPackage({ name: "tool", bin: { tool: "bin/tool.js", helper: "bin/helper.js" } }, directory => {
    assert.equal(resolvePackageBin(directory, ["helper"]), join(directory, "bin/helper.js"));
  });
});

test("resolves the sole executable exposed by an aliased package", () => {
  withPackage({ name: "@typescript/typescript6", bin: { tsc6: "./bin/tsc6" } }, directory => {
    assert.equal(resolvePackageBin(directory, ["tsc"]), join(directory, "bin/tsc6"));
  });
});

test("resolves a string bin field", () => {
  withPackage({ name: "@scope/tool", bin: "cli.js" }, directory => {
    assert.equal(resolvePackageBin(directory), join(directory, "cli.js"));
  });
});

test("rejects ambiguous and escaping executable definitions", () => {
  withPackage({ name: "tool", bin: { one: "one.js", two: "two.js" } }, directory => {
    assert.throws(() => resolvePackageBin(directory), /uniquely identifiable executable/);
  });
  withPackage({ name: "tool", bin: "../outside.js" }, directory => {
    assert.throws(() => resolvePackageBin(directory), /outside its package directory/);
  });
});
