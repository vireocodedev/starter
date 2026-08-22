import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expandBraces, globToRegExp, isExecutableStoryExample, matchesGlob } from "./ui-architecture.mjs";

describe("UI architecture path matching", () => {
  it("expands each explicit brace alternative", () => {
    assert.deepEqual(expandBraces("components/{forms,inputs}/{One,Two}/**"), [
      "components/forms/One/**",
      "components/forms/Two/**",
      "components/inputs/One/**",
      "components/inputs/Two/**",
    ]);
  });

  it("matches recursive and basename wildcards without crossing separators", () => {
    assert.equal(
      matchesGlob("components/inputs/RgoInputText/RgoInputText.tsx", "components/inputs/RgoInput*/**"),
      true,
    );
    assert.equal(
      matchesGlob("components/forms/RgoInputText/RgoInputText.tsx", "components/inputs/RgoInput*/**"),
      false,
    );
    assert.equal(matchesGlob("index.ts", "index.ts"), true);
  });

  it("escapes regular-expression metacharacters in literal paths", () => {
    const expression = globToRegExp("features/@tanstack/react-query/**");
    assert.equal(expression.test("features/@tanstack/react-query/index.ts"), true);
    assert.equal(expression.test("features/@tanstack/reactXquery/index.ts"), false);
  });

  it("recognizes only colocated executable story example modules", () => {
    assert.equal(
      isExecutableStoryExample("core/components/surfaces/VireoIconContainer/internal/storybook/DefaultExample.tsx"),
      true,
    );
    assert.equal(
      isExecutableStoryExample("core/components/surfaces/VireoIconContainer/VireoIconContainer.stories.tsx"),
      false,
    );
    assert.equal(
      isExecutableStoryExample("core/components/surfaces/VireoIconContainer/internal/storybook/fixtures.tsx"),
      false,
    );
  });
});
