import * as shell from "@vireocodedev/shell";
import { describe, expect, it } from "vitest";

describe("starter-shell public contract", () => {
  it("exposes only the framework-neutral shell primitives", () => {
    expect(Object.keys(shell).sort()).toEqual(
      [
        "OVERLAY_HISTORY_STATE_KEY",
        "ShellModeSchema",
        "ShellNavigationIdSchema",
        "ShellRouteKeySchema",
        "ShellRoutePathSchema",
        "createAuthRedirectState",
        "createOverlayHistoryRegistry",
        "createShellSitemap",
        "defineShellConfig",
        "defineShellPages",
        "defineShellSections",
        "generateShellPath",
        "getCommonOverlayPrefixLength",
        "getRequiredRouteParamNames",
        "isSafeInternalPath",
        "joinRoutePattern",
        "normalizeRoutePath",
        "readOverlayStack",
        "resolveOverlayHistoryAction",
        "resolvePostLoginPath",
        "shellNavigation",
        "withOverlayStack",
      ].sort(),
    );
  });
});
