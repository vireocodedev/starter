import {
  createTheme,
  type PaletteMode,
  type PaletteOptions,
  type Shadows,
  type Theme,
  type ThemeOptions,
} from "@mui/material/styles";
import { VIREO_MOTION_TOKENS } from "@/core/constants/motion.constants";

export type VireoThemeMode = Extract<PaletteMode, "light" | "dark">;

export type VireoSemanticTokens = {
  surface: { canvas: string; raised: string; sunken: string; overlay: string };
  border: { subtle: string; strong: string };
  focus: { ring: string };
};

export type VireoSemanticTokenOptions = {
  [TGroup in keyof VireoSemanticTokens]?: Partial<VireoSemanticTokens[TGroup]>;
};

export type VireoPaletteSurfaces = VireoSemanticTokens["surface"] & {
  /** Default content surface. Kept as an alias for existing `surface.base` consumers. */
  base: string;
};

declare module "@mui/material/styles" {
  interface Theme {
    vireo: VireoSemanticTokens;
  }

  interface ThemeOptions {
    vireo?: VireoSemanticTokenOptions;
  }

  interface Palette {
    surface: VireoPaletteSurfaces;
  }

  interface PaletteOptions {
    surface?: Partial<VireoPaletteSurfaces>;
  }
}

const VIREO_FONT_FAMILY = [
  "Inter",
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "sans-serif",
].join(", ");

export const VIREO_THEME_SHADOWS = [
  "none",
  "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)",
  "0 2px 4px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.06)",
  "0 4px 8px -2px rgba(16, 24, 40, 0.10), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
  "0 6px 12px -3px rgba(16, 24, 40, 0.12), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
  "0 8px 16px -4px rgba(16, 24, 40, 0.14), 0 3px 6px -3px rgba(16, 24, 40, 0.08)",
  "0 10px 20px -5px rgba(16, 24, 40, 0.16), 0 4px 8px -4px rgba(16, 24, 40, 0.08)",
  "0 12px 24px -6px rgba(16, 24, 40, 0.16), 0 5px 10px -5px rgba(16, 24, 40, 0.08)",
  "0 14px 28px -7px rgba(16, 24, 40, 0.18), 0 6px 12px -6px rgba(16, 24, 40, 0.08)",
  "0 16px 32px -8px rgba(16, 24, 40, 0.18), 0 7px 14px -7px rgba(16, 24, 40, 0.09)",
  "0 18px 36px -9px rgba(16, 24, 40, 0.20), 0 8px 16px -8px rgba(16, 24, 40, 0.09)",
  "0 20px 40px -10px rgba(16, 24, 40, 0.20), 0 9px 18px -9px rgba(16, 24, 40, 0.10)",
  "0 22px 44px -11px rgba(16, 24, 40, 0.22), 0 10px 20px -10px rgba(16, 24, 40, 0.10)",
  "0 24px 48px -12px rgba(16, 24, 40, 0.22), 0 11px 22px -11px rgba(16, 24, 40, 0.10)",
  "0 26px 52px -13px rgba(16, 24, 40, 0.24), 0 12px 24px -12px rgba(16, 24, 40, 0.11)",
  "0 28px 56px -14px rgba(16, 24, 40, 0.24), 0 13px 26px -13px rgba(16, 24, 40, 0.11)",
  "0 30px 60px -15px rgba(16, 24, 40, 0.26), 0 14px 28px -14px rgba(16, 24, 40, 0.12)",
  "0 32px 64px -16px rgba(16, 24, 40, 0.26), 0 15px 30px -15px rgba(16, 24, 40, 0.12)",
  "0 34px 68px -17px rgba(16, 24, 40, 0.28), 0 16px 32px -16px rgba(16, 24, 40, 0.13)",
  "0 36px 72px -18px rgba(16, 24, 40, 0.28), 0 17px 34px -17px rgba(16, 24, 40, 0.13)",
  "0 38px 76px -19px rgba(16, 24, 40, 0.30), 0 18px 36px -18px rgba(16, 24, 40, 0.14)",
  "0 40px 80px -20px rgba(16, 24, 40, 0.30), 0 19px 38px -19px rgba(16, 24, 40, 0.14)",
  "0 42px 84px -21px rgba(16, 24, 40, 0.32), 0 20px 40px -20px rgba(16, 24, 40, 0.15)",
  "0 44px 88px -22px rgba(16, 24, 40, 0.32), 0 21px 42px -21px rgba(16, 24, 40, 0.15)",
  "0 46px 92px -23px rgba(16, 24, 40, 0.34), 0 22px 44px -22px rgba(16, 24, 40, 0.16)",
] as Shadows;

export const VIREO_THEME_BASE_OPTIONS = {
  cssVariables: true,
  motion: { reducedMotion: "system" },
  shape: { borderRadius: 10 },
  shadows: VIREO_THEME_SHADOWS,
  spacing: 8,
  transitions: {
    duration: {
      shortest: VIREO_MOTION_TOKENS.duration.micro,
      shorter: VIREO_MOTION_TOKENS.duration.exit,
      short: VIREO_MOTION_TOKENS.duration.exit,
      standard: VIREO_MOTION_TOKENS.duration.standard,
      complex: VIREO_MOTION_TOKENS.duration.emphasized,
      enteringScreen: VIREO_MOTION_TOKENS.duration.enter,
      leavingScreen: VIREO_MOTION_TOKENS.duration.exit,
    },
    easing: {
      easeInOut: VIREO_MOTION_TOKENS.easing.standard,
      easeOut: VIREO_MOTION_TOKENS.easing.enter,
      easeIn: VIREO_MOTION_TOKENS.easing.exit,
      sharp: VIREO_MOTION_TOKENS.easing.exit,
    },
  },
  typography: {
    fontFamily: VIREO_FONT_FAMILY,
    h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.12 },
    h2: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.18 },
    h3: { fontSize: "1.5rem", fontWeight: 650, letterSpacing: "-0.018em", lineHeight: 1.25 },
    h4: { fontSize: "1.25rem", fontWeight: 650, letterSpacing: "-0.012em", lineHeight: 1.3 },
    h5: { fontSize: "1.125rem", fontWeight: 650, lineHeight: 1.35 },
    h6: { fontSize: "1rem", fontWeight: 650, lineHeight: 1.4 },
    body1: { fontSize: "1rem", lineHeight: 1.55 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    subtitle1: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.45 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.45 },
    caption: { fontSize: "0.75rem", lineHeight: 1.4 },
    button: { fontSize: "0.875rem", fontWeight: 650, letterSpacing: 0, lineHeight: 1.25, textTransform: "none" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          "@media (forced-colors: active)": {
            "&.MuiButton-contained": {
              backgroundColor: "ButtonFace",
              border: "1px solid ButtonText",
              color: "ButtonText",
              forcedColorAdjust: "none",
            },
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": { outline: `2px solid ${theme.vireo.focus.ring}`, outlineOffset: 2 },
        }),
      },
    },
    MuiCard: { defaultProps: { elevation: 0, variant: "outlined" } },
    MuiChip: {
      styleOverrides: {
        root: {
          "@media (forced-colors: active)": {
            "&.MuiChip-filled": {
              backgroundColor: "Canvas",
              border: "1px solid CanvasText",
              color: "CanvasText",
              forcedColorAdjust: "none",
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: theme => ({
        body: { backgroundColor: theme.vireo.surface.canvas },
        "::selection": { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
      }),
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
} as const satisfies ThemeOptions;

export const VIREO_THEME_FOUNDATIONS = {
  light: {
    palette: {
      mode: "light",
      primary: { main: "#0170a3", light: "#36c7fa", dark: "#004d73", contrastText: "#ffffff" },
      secondary: { main: "#6941c6", light: "#9e77ed", dark: "#53389e", contrastText: "#ffffff" },
      error: { main: "#b42318", contrastText: "#ffffff" },
      warning: { main: "#b54708", contrastText: "#ffffff" },
      info: { main: "#026aa2", contrastText: "#ffffff" },
      success: { main: "#027a48", contrastText: "#ffffff" },
      background: { default: "#f8fafc", paper: "#ffffff" },
      divider: "#cbd5e1",
      text: { primary: "#101828", secondary: "#475467", disabled: "#98a2b3" },
      action: {
        hover: "rgba(16, 24, 40, 0.05)",
        selected: "rgba(1, 112, 163, 0.10)",
        focus: "rgba(1, 112, 163, 0.14)",
        disabled: "rgba(16, 24, 40, 0.38)",
        disabledBackground: "rgba(16, 24, 40, 0.08)",
      },
    },
    vireo: {
      surface: { canvas: "#f8fafc", raised: "#ffffff", sunken: "#f2f4f7", overlay: "#ffffff" },
      border: { subtle: "#e4e7ec", strong: "#98a2b3" },
      focus: { ring: "#0170a3" },
    },
  },
  dark: {
    palette: {
      mode: "dark",
      primary: { main: "#36c7fa", light: "#7cd9fd", dark: "#0170a3", contrastText: "#101828" },
      secondary: { main: "#b692f6", light: "#d6bbfb", dark: "#7f56d9", contrastText: "#101828" },
      error: { main: "#fda29b", contrastText: "#101828" },
      warning: { main: "#fec84b", contrastText: "#101828" },
      info: { main: "#7cd9fd", contrastText: "#101828" },
      success: { main: "#6ce9a6", contrastText: "#101828" },
      background: { default: "#080d18", paper: "#1d2939" },
      divider: "#344054",
      text: { primary: "#f9fafb", secondary: "#98a2b3", disabled: "#667085" },
      action: {
        hover: "rgba(249, 250, 251, 0.07)",
        selected: "rgba(54, 199, 250, 0.14)",
        focus: "rgba(54, 199, 250, 0.18)",
        disabled: "rgba(249, 250, 251, 0.38)",
        disabledBackground: "rgba(249, 250, 251, 0.10)",
      },
    },
    vireo: {
      surface: { canvas: "#080d18", raised: "#1d2939", sunken: "#101828", overlay: "#263448" },
      border: { subtle: "#344054", strong: "#667085" },
      focus: { ring: "#7cd9fd" },
    },
  },
} as const satisfies Record<VireoThemeMode, { palette: PaletteOptions; vireo: VireoSemanticTokens }>;

export type VireoThemeOptions = Omit<ThemeOptions, "palette" | "vireo"> & {
  mode?: VireoThemeMode;
  palette?: Omit<PaletteOptions, "mode">;
  vireo?: VireoSemanticTokenOptions;
};

function mergeThemeOptions(...sources: Array<ThemeOptions | undefined>): ThemeOptions {
  const mergeObjects = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
    for (const [key, value] of Object.entries(source)) {
      const targetValue = target[key];
      const canMerge =
        value != null &&
        targetValue != null &&
        typeof value === "object" &&
        typeof targetValue === "object" &&
        !Array.isArray(value) &&
        !Array.isArray(targetValue);
      target[key] = canMerge
        ? mergeObjects({ ...(targetValue as Record<string, unknown>) }, value as Record<string, unknown>)
        : value;
    }
    return target;
  };

  return sources.reduce<ThemeOptions>(
    (merged, source) =>
      source == null
        ? merged
        : (mergeObjects(merged as Record<string, unknown>, source as Record<string, unknown>) as ThemeOptions),
    {},
  );
}

/** Creates the canonical Vireo MUI theme with coherent light/dark, type, surface, elevation, and motion defaults. */
export function createVireoTheme({ mode = "light", palette, vireo, ...options }: VireoThemeOptions = {}): Theme {
  const foundation = VIREO_THEME_FOUNDATIONS[mode];
  const semanticTokens = mergeThemeOptions({ vireo: foundation.vireo }, vireo == null ? undefined : { vireo })
    .vireo as VireoSemanticTokens;
  const paletteSurface: VireoPaletteSurfaces = {
    ...semanticTokens.surface,
    base: semanticTokens.surface.raised,
    ...palette?.surface,
  };
  return createTheme(
    mergeThemeOptions(VIREO_THEME_BASE_OPTIONS, foundation, options, {
      palette: { ...palette, mode, surface: paletteSurface },
      vireo: semanticTokens,
    }),
  );
}

/** Reverses the numeric entries of an arbitrary shade scale without changing named entries. */
export function reverseNumericScale<T extends Record<string, unknown>>(scale: T): Partial<T> {
  const entries = Object.entries(scale)
    .filter(([key]) => /^\d+$/.test(key))
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  return Object.fromEntries(entries.map(([key], index) => [key, entries[entries.length - 1 - index][1]])) as Partial<T>;
}

function stripChannelKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !key.endsWith("Channel")));
}

function deriveDarkPalette(lightTheme: Theme): PaletteOptions {
  const derivedKeys = new Set(["action", "background", "divider", "mode", "text"]);
  return Object.fromEntries(
    Object.entries(lightTheme.palette)
      .filter(([key]) => !derivedKeys.has(key))
      .map(([key, value]) => [
        key,
        value && typeof value === "object" ? stripChannelKeys(value as Record<string, unknown>) : value,
      ]),
  ) as PaletteOptions;
}

/**
 * @deprecated Prefer `createVireoTheme({ mode: "dark" })` so both schemes share one source of truth.
 * Derives a dark theme while preserving the source theme's non-color foundations and brand palette channels.
 */
export function createDarkTheme(lightTheme: Theme, overrides?: ThemeOptions): Theme {
  return createTheme(
    mergeThemeOptions(
      {
        breakpoints: { values: { ...lightTheme.breakpoints.values } },
        components: lightTheme.components,
        cssVariables: lightTheme.vars == null ? undefined : true,
        direction: lightTheme.direction,
        mixins: lightTheme.mixins,
        motion: { ...lightTheme.motion },
        shape: { ...lightTheme.shape },
        shadows: [...lightTheme.shadows] as Shadows,
        spacing: lightTheme.spacing,
        transitions: {
          duration: { ...lightTheme.transitions.duration },
          easing: { ...lightTheme.transitions.easing },
        },
        typography: { ...lightTheme.typography },
        vireo: lightTheme.vireo,
        zIndex: { ...lightTheme.zIndex },
      },
      overrides,
      {
        palette: { ...deriveDarkPalette(lightTheme), ...overrides?.palette, mode: "dark" },
      },
    ),
  );
}
