import { createTheme, type Theme, type ThemeOptions } from "@mui/material/styles";

/**
 * Palette channel names that contain numeric shade scales (50–950).
 * These are reversed when generating a dark theme so that lighter shades
 * become darker and vice-versa.
 */
const PALETTE_CHANNELS_WITH_NUMERIC_SCALE = [
  "primary",
  "secondary",
  "grey",
  "success",
  "warning",
  "info",
  "error",
] as const;

const DERIVED_THEME_KEYS = [
  "colorSchemes",
  "defaultColorScheme",
  "generateStyleSheets",
  "generateThemeVars",
  "getColorSchemeSelector",
  "getCssVar",
  "shouldSkipGeneratingVar",
  "vars",
] as const;

/**
 * Strips MUI-internal `*Channel` properties (e.g. `mainChannel`, `paperChannel`)
 * from a resolved palette object so that `createTheme` recomputes them fresh
 * from the actual color values.
 */
function stripChannelKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !key.endsWith("Channel")));
}

/**
 * Reverses the numeric shade entries (keys that are purely digits, e.g. 50, 100, …, 900)
 * of a palette channel object while keeping non-numeric keys (e.g. `main`, `light`, `dark`,
 * `contrastText`) intact.
 *
 * @example
 * reverseNumericScale({ 100: "#light", 900: "#dark", main: "#keep" })
 * // → { 100: "#dark", 900: "#light" }
 */
export function reverseNumericScale<T extends Record<string, unknown>>(scale: T): Partial<T> {
  const entries = Object.entries(scale)
    .filter(([k]) => /^\d+$/.test(k))
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const reversed: Record<string, unknown> = {};
  entries.forEach((_entry, idx) => {
    reversed[entries[idx][0]] = entries[entries.length - 1 - idx][1];
  });
  return reversed as Partial<T>;
}

/**
 * Creates a dark MUI theme derived from an existing light theme.
 *
 * The function:
 * 1. Copies `shape`, `typography`, `cssVariables`, `components`, `motion`, and transitions from the light theme.
 * 2. Reverses numeric palette scales (50–950) on primary, grey, success, warning, info, and error
 *    so that lighter shades map to darker values and vice-versa.
 * 3. Sets `palette.mode` to `"dark"`, letting MUI apply its standard dark-mode defaults
 *    for `text`, `background`, `divider`, and `action` colors.
 * 4. Spreads an optional `overrides` object on top, giving full control over any property.
 *
 * @param lightTheme - A fully resolved MUI `Theme` (typically created with `createTheme()`
 *   using `palette.mode: "light"`).
 * @param overrides - Optional `ThemeOptions` spread onto the derived dark theme options.
 *   Use this to customize background colors, text colors, component overrides, etc.
 *
 * @example
 * ```ts
 * // Minimal — just pass the light theme
 * const THEME_DARK = createDarkTheme(THEME_LIGHT);
 *
 * // With overrides
 * const THEME_DARK = createDarkTheme(THEME_LIGHT, {
 *   palette: {
 *     background: {
 *       paper: THEME_LIGHT.palette.grey[800],
 *       default: THEME_LIGHT.palette.grey[900],
 *     },
 *   },
 * });
 * ```
 */
export function createDarkTheme(lightTheme: Theme, overrides?: ThemeOptions): Theme {
  // Build reversed palette channels, stripping stale *Channel properties
  // from the resolved light palette so createTheme recomputes them fresh.
  const reversedPalette: Record<string, unknown> = {};

  for (const channel of PALETTE_CHANNELS_WITH_NUMERIC_SCALE) {
    const lightChannel = lightTheme.palette[channel] as unknown as Record<string, unknown>;
    reversedPalette[channel] = {
      ...stripChannelKeys(lightChannel),
      ...reverseNumericScale(lightChannel),
    };
  }

  const darkPaletteDefaults = createTheme({ palette: { mode: "dark" } }).palette;
  const sourceThemeOptions = { ...lightTheme } as Record<string, unknown>;

  const cssVariables = lightTheme.vars
    ? ({
        colorSchemeSelector: sourceThemeOptions.colorSchemeSelector,
        cssVarPrefix: sourceThemeOptions.cssVarPrefix,
        rootSelector: sourceThemeOptions.rootSelector,
        shouldSkipGeneratingVar: sourceThemeOptions.shouldSkipGeneratingVar,
      } as NonNullable<Exclude<ThemeOptions["cssVariables"], boolean>>)
    : false;

  // A resolved MUI theme contains derived color-scheme state and CSS-variable
  // generators. Passing those values back into createTheme retains light-mode
  // variable fallbacks, so remove them and let MUI regenerate the dark scheme.
  for (const key of DERIVED_THEME_KEYS) delete sourceThemeOptions[key];

  // Recreate the theme from the complete source foundation so consumer spacing,
  // breakpoints, shadows, direction, z-index, mixins, and custom augmentations
  // survive. Replace only mode-owned semantic palette values, then regenerate
  // all CSS-variable channels from the definitive dark palette in one pass.
  return createTheme({
    ...sourceThemeOptions,
    cssVariables,
    ...overrides,
    palette: {
      ...stripChannelKeys(lightTheme.palette as unknown as Record<string, unknown>),
      mode: "dark",
      common: stripChannelKeys(lightTheme.palette.common as unknown as Record<string, unknown>),
      text: stripChannelKeys(darkPaletteDefaults.text as unknown as Record<string, unknown>),
      background: stripChannelKeys(darkPaletteDefaults.background as unknown as Record<string, unknown>),
      divider: darkPaletteDefaults.divider,
      action: stripChannelKeys(darkPaletteDefaults.action as unknown as Record<string, unknown>),
      ...reversedPalette,
      ...overrides?.palette,
    },
  });
}
