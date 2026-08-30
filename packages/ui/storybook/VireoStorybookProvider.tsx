import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { VireoTemporalLocalizationProvider, type VireoTemporalLocale } from "@vireocodedev/ui/localization";
import { createVireoTheme, type VireoThemeMode } from "@vireocodedev/ui/theme";
import React from "react";

export type VireoStorybookProviderProps = {
  children: React.ReactNode;
  /** Temporal locale used by stories that do not demonstrate localization. @default 'en' */
  temporalLocale?: VireoTemporalLocale;
  /** Review color scheme. Nested providers inherit the nearest explicit mode. @default 'dark' */
  themeMode?: VireoThemeMode;
  /** Review writing direction. Nested providers inherit the nearest explicit direction. @default 'ltr' */
  themeDirection?: "ltr" | "rtl";
};

const vireoStorybookReviewThemes = {
  "dark-ltr": createVireoTheme({ mode: "dark", direction: "ltr" }),
  "dark-rtl": createVireoTheme({ mode: "dark", direction: "rtl" }),
  "light-ltr": createVireoTheme({ mode: "light", direction: "ltr" }),
  "light-rtl": createVireoTheme({ mode: "light", direction: "rtl" }),
} as const;

const VireoStorybookThemeContext = React.createContext<{ direction: "ltr" | "rtl"; mode: VireoThemeMode }>({
  direction: "ltr",
  mode: "dark",
});

/** Reproduces the shared dark Vireo review surface used by executable Storybook examples. */
export function VireoStorybookProvider({
  children,
  temporalLocale = "en",
  themeDirection,
  themeMode,
}: VireoStorybookProviderProps) {
  const inheritedTheme = React.useContext(VireoStorybookThemeContext);
  const resolvedThemeMode = themeMode ?? inheritedTheme.mode;
  const resolvedThemeDirection = themeDirection ?? inheritedTheme.direction;
  const reviewTheme = vireoStorybookReviewThemes[`${resolvedThemeMode}-${resolvedThemeDirection}`];
  return (
    <VireoStorybookThemeContext.Provider value={{ direction: resolvedThemeDirection, mode: resolvedThemeMode }}>
      <ThemeProvider theme={reviewTheme}>
        <VireoTemporalLocalizationProvider locale={temporalLocale}>
          <CssBaseline />
          <Box color="text.primary" dir={resolvedThemeDirection} sx={{ minWidth: 0, width: "100%" }}>
            {children}
          </Box>
        </VireoTemporalLocalizationProvider>
      </ThemeProvider>
    </VireoStorybookThemeContext.Provider>
  );
}
