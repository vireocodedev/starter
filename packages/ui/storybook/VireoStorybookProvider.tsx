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
};

const vireoStorybookReviewThemes = {
  dark: createVireoTheme({ mode: "dark" }),
  light: createVireoTheme({ mode: "light" }),
} as const;

const VireoStorybookThemeModeContext = React.createContext<VireoThemeMode>("dark");

/** Reproduces the shared dark Vireo review surface used by executable Storybook examples. */
export function VireoStorybookProvider({ children, temporalLocale = "en", themeMode }: VireoStorybookProviderProps) {
  const inheritedThemeMode = React.useContext(VireoStorybookThemeModeContext);
  const resolvedThemeMode = themeMode ?? inheritedThemeMode;
  return (
    <VireoStorybookThemeModeContext.Provider value={resolvedThemeMode}>
      <ThemeProvider theme={vireoStorybookReviewThemes[resolvedThemeMode]}>
        <VireoTemporalLocalizationProvider locale={temporalLocale}>
          <CssBaseline />
          <Box color="text.primary" sx={{ minWidth: 0, width: "100%" }}>
            {children}
          </Box>
        </VireoTemporalLocalizationProvider>
      </ThemeProvider>
    </VireoStorybookThemeModeContext.Provider>
  );
}
