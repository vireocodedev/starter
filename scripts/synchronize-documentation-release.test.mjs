import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { synchronizeDocumentationRelease } from "./synchronize-documentation-release.mjs";

test("synchronizes current documentation package versions", () => {
  const root = mkdtempSync(join(tmpdir(), "vireo-documentation-release-"));
  try {
    mkdirSync(join(root, "contracts"));
    mkdirSync(join(root, "packages", "cli"), { recursive: true });
    mkdirSync(join(root, "packages", "sqlite"));
    writeJson(join(root, "packages", "cli", "package.json"), {
      name: "create-vireo",
      version: "0.3.0",
    });
    writeJson(join(root, "packages", "sqlite", "package.json"), {
      name: "@vireocodedev/sqlite",
      version: "0.2.2",
    });
    writeJson(join(root, "contracts", "documentation-release-policy.json"), {
      schemaVersion: 1,
      currentRelease: "current",
      releases: [
        {
          id: "current",
          npm: [
            { package: "create-vireo", version: "0.2.0" },
            { package: "@vireocodedev/sqlite", version: "0.2.1" },
          ],
        },
      ],
    });

    synchronizeDocumentationRelease(root);

    const policy = JSON.parse(readFileSync(join(root, "contracts", "documentation-release-policy.json"), "utf8"));
    assert.deepEqual(policy.releases[0].npm, [
      { package: "create-vireo", version: "0.3.0" },
      { package: "@vireocodedev/sqlite", version: "0.2.2" },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
