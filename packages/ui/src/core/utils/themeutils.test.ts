import { createTheme } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { VIREO_MOTION_TOKENS } from "@/core/constants/motion.constants";
import { createDarkTheme } from "./themeutils";

describe("createDarkTheme", () => {
  it("preserves motion and transition policy from the source theme", () => {
    const lightTheme = createTheme({
      motion: { reducedMotion: "system" },
      transitions: {
        duration: { standard: VIREO_MOTION_TOKENS.duration.standard },
        easing: { easeInOut: VIREO_MOTION_TOKENS.easing.standard },
      },
    });

    const darkTheme = createDarkTheme(lightTheme);

    expect(darkTheme.motion.reducedMotion).toBe("system");
    expect(darkTheme.transitions.duration.standard).toBe(VIREO_MOTION_TOKENS.duration.standard);
    expect(darkTheme.transitions.easing.easeInOut).toBe(VIREO_MOTION_TOKENS.easing.standard);
  });
});
