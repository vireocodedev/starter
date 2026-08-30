import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { VIREO_MOTION_TOKENS, VIREO_REDUCED_MOTION_MEDIA_QUERY } from "@/core/public";
import { createVireoTheme } from "@/core/utils/themeutils";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readPackageFile = (path: string) => readFileSync(join(packageRoot, path), "utf8");

describe("Vireo motion policy", () => {
  it("maps canonical MUI transitions and overlays to Vireo timing with system reduction", () => {
    const theme = createVireoTheme();

    expect(theme.motion.reducedMotion).toBe("system");
    expect(theme.transitions.duration.standard).toBe(VIREO_MOTION_TOKENS.duration.standard);
    expect(theme.transitions.duration.enteringScreen).toBe(VIREO_MOTION_TOKENS.duration.enter);
    expect(theme.transitions.duration.leavingScreen).toBe(VIREO_MOTION_TOKENS.duration.exit);
  });

  it("keeps authored navigation and screen-stack travel behind the shared reduced-motion branch", () => {
    const applicationNavigation = readPackageFile(
      "src/capabilities/application-navigation/components/navigation/VireoApplicationNavigation/VireoApplicationNavigation.styled.ts",
    );
    const slidingScreenStack = readPackageFile(
      "src/core/components/layout/VireoSlidingScreenStack/VireoSlidingScreenStack.styled.ts",
    );

    expect(VIREO_REDUCED_MOTION_MEDIA_QUERY).toBe("@media (prefers-reduced-motion: reduce)");
    expect(applicationNavigation).toContain("[VIREO_REDUCED_MOTION_MEDIA_QUERY]");
    expect(slidingScreenStack).toContain("[VIREO_REDUCED_MOTION_MEDIA_QUERY]");
    expect(slidingScreenStack).toContain("VIREO_MOTION_TOKENS.duration.standard");
  });

  it("gives the mobile full-screen surface semantic enter/exit timing and MUI reduction behavior", () => {
    const overlay = readPackageFile(
      "src/capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/VireoResponsiveOverlayFrame.tsx",
    );

    expect(overlay).toContain("VIREO_MOTION_TOKENS.duration.enter");
    expect(overlay).toContain("VIREO_MOTION_TOKENS.duration.exit");
    expect(overlay).toContain("disablePrefersReducedMotion={false}");
  });
});
