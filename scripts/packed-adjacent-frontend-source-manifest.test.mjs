import assert from "node:assert/strict";
import test from "node:test";
import { packedAdjacentFrontendSourceManifest } from "./lib/packed-adjacent-frontend-source-manifest.mjs";

test("builds a packed adjacent frontend manifest with every exact managed root script", () => {
  assert.deepEqual(
    packedAdjacentFrontendSourceManifest({
      packedSource: {
        rootVireoScript: "npx --yes --package=create-vireo@0.8.2 vireo",
        managedRootScripts: { "doctor:json": "node scripts/vireo-frontend-doctor.mjs --json" },
      },
      dependencies: { "@vireocodedev/ui": "^0.3.0", react: "^19.0.0" },
    }),
    {
      name: "packed-adjacent-upgrade-fixture",
      scripts: {
        vireo: "npx --yes --package=create-vireo@0.8.2 vireo",
        "doctor:json": "node scripts/vireo-frontend-doctor.mjs --json",
      },
      dependencies: { "@vireocodedev/ui": "^0.3.0", react: "^19.0.0" },
    },
  );
});

test("builds a minimal manifest when the packed source has no managed root scripts", () => {
  assert.deepEqual(
    packedAdjacentFrontendSourceManifest({
      packedSource: { rootVireoScript: "npx --yes --package=create-vireo@0.8.3 vireo" },
      dependencies: {},
    }),
    {
      name: "packed-adjacent-upgrade-fixture",
      scripts: { vireo: "npx --yes --package=create-vireo@0.8.3 vireo" },
      dependencies: {},
    },
  );
});

test("preserves JSON-derived __proto__ managed scripts as own manifest entries", () => {
  const managedRootScripts = JSON.parse('{"__proto__":"node scripts/provenance.mjs"}');
  const manifest = packedAdjacentFrontendSourceManifest({
    packedSource: { rootVireoScript: "npx --yes --package=create-vireo@0.8.3 vireo", managedRootScripts },
    dependencies: {},
  });
  assert.equal(Object.hasOwn(manifest.scripts, "__proto__"), true);
  assert.equal(manifest.scripts.__proto__, "node scripts/provenance.mjs");
});

test("fails closed for malformed source records and conflicting Vireo scripts", () => {
  const dependencies = { react: "^19.0.0" };
  assert.throws(() => packedAdjacentFrontendSourceManifest({ packedSource: {}, dependencies }), /rootVireoScript/u);
  assert.throws(
    () =>
      packedAdjacentFrontendSourceManifest({
        packedSource: { rootVireoScript: "vireo", managedRootScripts: [] },
        dependencies,
      }),
    /managedRootScripts/u,
  );
  assert.throws(
    () =>
      packedAdjacentFrontendSourceManifest({
        packedSource: { rootVireoScript: "vireo", managedRootScripts: { vireo: "other-vireo" } },
        dependencies,
      }),
    /conflicts/u,
  );
  assert.throws(
    () => packedAdjacentFrontendSourceManifest({ packedSource: { rootVireoScript: "vireo" }, dependencies: null }),
    /dependencies/u,
  );
});
