import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  allocateReferenceSymbolAnchors,
  countHtmlIdAttributes,
  referenceSymbolBaseAnchor,
} from "./lib/reference-symbol-anchors.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("allocates deterministic, collision-free anchors while preserving the first legacy base", () => {
  const symbols = ["Foo", "foo-2", "foo", "FOO", "foo-3", "foo"];
  const expected = ["symbol-foo", "symbol-foo-2", "symbol-foo-4", "symbol-foo-5", "symbol-foo-3", "symbol-foo-6"];
  assert.deepEqual(allocateReferenceSymbolAnchors(symbols), expected);
  assert.deepEqual(allocateReferenceSymbolAnchors(symbols), expected);
  assert.deepEqual(allocateReferenceSymbolAnchors(["Foo", "foo"]), ["symbol-foo", "symbol-foo-2"]);
  assert.deepEqual(allocateReferenceSymbolAnchors(["Foo", "foo", "foo$2"]), [
    "symbol-foo",
    "symbol-foo-3",
    "symbol-foo-2",
  ]);
  assert.equal(referenceSymbolBaseAnchor("Foo / Bar"), "symbol-foo-bar");
  assert.equal(referenceSymbolBaseAnchor("UPPER_CASE"), "symbol-upper_case");
});

test("counts only whitespace-prefixed HTML id attributes", () => {
  const counts = countHtmlIdAttributes(
    `<article id="symbol-one" data-id="ignored"><div id = 'symbol-two'></div><span id="symbol-one"></span>id="text"</article>`,
  );
  assert.deepEqual(
    [...counts],
    [
      ["symbol-one", 2],
      ["symbol-two", 1],
    ],
  );
  assert.equal(counts.has("ignored"), false);
  assert.equal(counts.has("text"), false);
});

test("covers the existing case-only create-vireo and UI public export pairs", async () => {
  const [createVireo, ui] = await Promise.all(
    ["create-vireo", "ui"].map(directory =>
      readFile(join(repositoryRoot, "packages", directory, "api-surface.json"), "utf8").then(JSON.parse),
    ),
  );
  const createSymbols = createVireo.entryPoints["."].exports;
  const uiSymbols = ui.entryPoints["."].exports;
  for (const [symbols, pair] of [
    [createSymbols, ["EntityNames", "entityNames"]],
    [uiSymbols, ["VireoFormActionsClasses", "vireoFormActionsClasses"]],
  ]) {
    assert.ok(
      pair.every(symbol => symbols.includes(symbol)),
      "surface must retain " + pair.join(" and "),
    );
    const anchors = allocateReferenceSymbolAnchors(symbols);
    assert.deepEqual(
      pair.map(symbol => anchors[symbols.indexOf(symbol)]),
      ["symbol-" + pair[0].toLowerCase(), "symbol-" + pair[0].toLowerCase() + "-2"],
    );
  }
});
