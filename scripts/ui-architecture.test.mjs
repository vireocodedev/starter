import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  expandBraces,
  globToRegExp,
  isExecutableStoryExample,
  isStructuralComponentsDirectory,
  matchesGlob,
  missingVireoRuntimeOrchestration,
} from "./ui-architecture.mjs";

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

  it("enumerates integration-owned public component roots", () => {
    assert.equal(isStructuralComponentsDirectory("core/components"), true);
    assert.equal(isStructuralComponentsDirectory("capabilities/forms/components"), true);
    assert.equal(isStructuralComponentsDirectory("integrations/hello-pangea-dnd/components"), true);
    assert.equal(
      isStructuralComponentsDirectory(
        "integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/components",
      ),
      false,
    );
  });

  it("requires public runtime orchestration in the canonical component module", () => {
    const canonicalSource = `
      function useUtilityClasses() {}
      useThemeProps({});
      resolveSlotProps({}, {});
      useForkRef();
    `;

    assert.deepEqual(missingVireoRuntimeOrchestration(canonicalSource), []);
    assert.deepEqual(missingVireoRuntimeOrchestration("useThemeProps({});"), [
      "private useUtilityClasses",
      "resolveSlotProps call",
      "useForkRef call",
    ]);
    assert.deepEqual(
      missingVireoRuntimeOrchestration(
        "// function useUtilityClasses() {} resolveSlotProps({}, {}); useForkRef();\nuseThemeProps({});",
      ),
      ["private useUtilityClasses", "resolveSlotProps call", "useForkRef call"],
    );
  });
});
