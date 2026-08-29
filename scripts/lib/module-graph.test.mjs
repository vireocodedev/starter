import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { matchWorkspaceSpecifier, resolveWorkspaceSpecifier } from "./module-graph.mjs";

test("resolves current workspace package names and subpaths from manifests", () => {
  const packagesRoot = mkdtempSync(join(tmpdir(), "vireo-module-graph-"));
  try {
    const uiRoot = join(packagesRoot, "ui");
    mkdirSync(join(uiRoot, "src", "capabilities", "forms"), { recursive: true });
    writeFileSync(
      join(uiRoot, "package.json"),
      `${JSON.stringify({
        name: "@vireocodedev/ui",
        exports: { "./forms": { import: "./dist/capabilities/forms/public.js" } },
      })}\n`,
    );
    const source = join(uiRoot, "src", "capabilities", "forms", "public.ts");
    writeFileSync(source, "export const formContract = true;\n");

    const match = matchWorkspaceSpecifier("@vireocodedev/ui/forms", packagesRoot);
    assert.equal(match?.workspace.name, "@vireocodedev/ui");
    assert.equal(match?.subpath, "./forms");
    assert.equal(resolveWorkspaceSpecifier("@vireocodedev/ui/forms", packagesRoot)?.file, source);
    assert.equal(matchWorkspaceSpecifier("@vireocodedev/starter-ui/forms", packagesRoot), undefined);
  } finally {
    rmSync(packagesRoot, { recursive: true, force: true });
  }
});
