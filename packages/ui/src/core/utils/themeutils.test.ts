import { createTheme, type Shadows } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { VIREO_MOTION_TOKENS } from "@/core/constants/motion.constants";
import { createDarkTheme, createVireoTheme, VIREO_THEME_SHADOWS } from "./themeutils";

describe("createVireoTheme", () => {
  it.each(["light", "dark"] as const)("creates the canonical %s foundation", mode => {
    const theme = createVireoTheme({ mode });

    expect(theme.palette.mode).toBe(mode);
    expect(theme.vars).toBeDefined();
    expect(theme.motion.reducedMotion).toBe("system");
    expect(theme.transitions.duration.standard).toBe(VIREO_MOTION_TOKENS.duration.standard);
    expect(theme.transitions.duration.enteringScreen).toBe(VIREO_MOTION_TOKENS.duration.enter);
    expect(theme.shape.borderRadius).toBe(10);
    expect(theme.shadows).toEqual(VIREO_THEME_SHADOWS);
    expect(theme.palette.background.default).toBe(theme.vireo.surface.canvas);
    expect(theme.palette.background.paper).toBe(theme.vireo.surface.raised);
    expect(theme.palette.surface.base).toBe(theme.vireo.surface.raised);
    expect(theme.palette.surface.sunken).toBe(theme.vireo.surface.sunken);
    expect(theme.vars?.palette.surface.base).toBeDefined();
    expect(theme.vars?.palette.surface.sunken).toBeDefined();
    expect(theme.vireo.focus.ring).toBe(mode === "light" ? "#0170a3" : "#7cd9fd");
  });

  it("deeply extends consumer palette, semantic tokens, and component overrides", () => {
    const theme = createVireoTheme({
      mode: "dark",
      palette: { primary: { main: "#ff7a00" } },
      vireo: { surface: { raised: "#24150a" } },
      components: { MuiButton: { defaultProps: { size: "small" } } },
    });

    expect(theme.palette.primary.main).toBe("#ff7a00");
    expect(theme.palette.primary.contrastText).toBe("#101828");
    expect(theme.vireo.surface.raised).toBe("#24150a");
    expect(theme.vireo.surface.canvas).toBe("#080d18");
    expect(theme.palette.surface.base).toBe("#24150a");
    expect(theme.palette.surface.raised).toBe("#24150a");
    expect(theme.components?.MuiButton?.defaultProps).toMatchObject({ disableElevation: true, size: "small" });
  });

  it("uses system colors for filled controls when forced colors are active", () => {
    const theme = createVireoTheme();

    expect(theme.components?.MuiButton?.styleOverrides?.root).toMatchObject({
      "@media (forced-colors: active)": {
        "&.MuiButton-contained": {
          backgroundColor: "ButtonFace",
          border: "1px solid ButtonText",
          color: "ButtonText",
          forcedColorAdjust: "none",
        },
      },
    });
    expect(theme.components?.MuiChip?.styleOverrides?.root).toMatchObject({
      "@media (forced-colors: active)": {
        "&.MuiChip-filled": {
          backgroundColor: "Canvas",
          border: "1px solid CanvasText",
          color: "CanvasText",
          forcedColorAdjust: "none",
        },
      },
    });
  });
});

describe("createDarkTheme", () => {
  it("preserves the source theme foundations and brand channels", () => {
    const shadows = Array.from({ length: 25 }, (_value, index) => `shadow-${index}`) as Shadows;
    const lightTheme = createTheme({
      cssVariables: true,
      breakpoints: { values: { xs: 0, sm: 500, md: 800, lg: 1_100, xl: 1_400 } },
      direction: "rtl",
      motion: { reducedMotion: "system" },
      shadows,
      spacing: 10,
      transitions: {
        duration: { standard: VIREO_MOTION_TOKENS.duration.standard },
        easing: { easeInOut: VIREO_MOTION_TOKENS.easing.standard },
      },
      zIndex: { drawer: 777 },
      palette: {
        mode: "light",
        primary: { main: "#123456" },
        secondary: { main: "#654321" },
      },
    });

    const darkTheme = createDarkTheme(lightTheme);

    expect(darkTheme.palette.mode).toBe("dark");
    expect(darkTheme.palette.primary.main).toBe("#123456");
    expect(darkTheme.palette.secondary.main).toBe("#654321");
    expect(darkTheme.spacing(1)).toContain("10px");
    expect(darkTheme.breakpoints.values.sm).toBe(500);
    expect(darkTheme.shadows[1]).toBe("shadow-1");
    expect(darkTheme.zIndex.drawer).toBe(777);
    expect(darkTheme.direction).toBe("rtl");
    expect(darkTheme.vars?.palette.secondary.main).toContain("#654321");
  });
});
