import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publishedCoordinates } from "./changeset-publish-adapter.mjs";

describe("Changesets publication output adapter", () => {
  it("extracts scoped package coordinates from Changesets v3 output", () => {
    assert.deepEqual(
      publishedCoordinates(`
◇  Successfully published:
@vireocodedev/history@0.2.0
@vireocodedev/ui@0.2.0
◇  Created git tags.
`),
      ["@vireocodedev/history@0.2.0", "@vireocodedev/ui@0.2.0"],
    );
  });

  it("ignores unrelated output and strips terminal control sequences", () => {
    assert.deepEqual(
      publishedCoordinates(
        "\u001B[1G\u001B[J◇  Successfully published:\n@vireocodedev/query@0.2.0\n\u001B[?25h◇  Created git tags.\n",
      ),
      ["@vireocodedev/query@0.2.0"],
    );
  });

  it("returns no coordinates when publication did not occur", () => {
    assert.deepEqual(publishedCoordinates("0 packages are already published.\n"), []);
  });
});
