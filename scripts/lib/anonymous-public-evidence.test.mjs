import assert from "node:assert/strict";
import test from "node:test";
import { validateAnonymousPublicEvidence } from "./anonymous-public-evidence.mjs";

test("public evidence requires all exact npm and Maven subjects", () => {
  const release = { npm: [{ name: "create-vireo", version: "1.2.3" }], maven: { group: "com.example", version: "4.5.6", modules: ["core"] } };
  const manifest = { versions: { npm: { "create-vireo": "1.2.3" }, maven: { group: "com.example", version: "4.5.6" } }, subjects: [{ ecosystem: "npm", name: "create-vireo", version: "1.2.3", sha256: "a".repeat(64) }, { coordinate: "com.example:core:4.5.6" }] };
  assert.deepEqual(validateAnonymousPublicEvidence({ manifest, release }), []);
  assert.match(validateAnonymousPublicEvidence({ manifest: {}, release }).join("\n"), /create-vireo/u);
});
