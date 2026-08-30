import { createTheme, type Theme } from "@mui/material/styles";
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

  it("preserves the complete consumer theme foundation", () => {
    const shadows = [...createTheme().shadows] as Theme["shadows"];
    shadows[1] = "0 1px 2px rgb(1 2 3 / 40%)";
    const lightTheme = createTheme({
      breakpoints: { values: { xs: 0, sm: 500, md: 800, lg: 1_100, xl: 1_400 } },
      direction: "rtl",
      palette: { secondary: { main: "#654321" } },
      shadows,
      spacing: 10,
      zIndex: { drawer: 777 },
    });

    const darkTheme = createDarkTheme(lightTheme);

    expect(darkTheme.spacing(1)).toBe("10px");
    expect(darkTheme.breakpoints.values.sm).toBe(500);
    expect(darkTheme.shadows[1]).toBe("0 1px 2px rgb(1 2 3 / 40%)");
    expect(darkTheme.zIndex.drawer).toBe(777);
    expect(darkTheme.direction).toBe("rtl");
    expect(darkTheme.palette.secondary.main).toBe("#654321");
  });

  it("regenerates CSS variables from the final dark palette", () => {
    const lightTheme = createTheme({
      cssVariables: { cssVarPrefix: "vireo" },
      palette: { background: { default: "#eeeeee" } },
      spacing: 10,
    });

    const darkTheme = createDarkTheme(lightTheme, {
      palette: { background: { default: "#111111" } },
    });

    expect(darkTheme.palette.mode).toBe("dark");
    expect(darkTheme.palette.background.default).toBe("#111111");
    expect(darkTheme.vars?.palette.background.default).toBe("var(--vireo-palette-background-default, #111111)");
    expect(darkTheme.spacing(1)).toContain("10px");
  });
});
