import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/ui/localization";
import React from "react";
import type { VireoStorybookProviderProps } from "../../storybook/VireoStorybookProvider";
import { VireoStorybookThemeModeContext } from "./storybook-theme-context";

const reviewThemeOptions = {
  cssVariables: true,
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 8 },
} as const;

const themes = {
  dark: createTheme({
    ...reviewThemeOptions,
    palette: {
      mode: "dark",
      primary: { main: "#36c7fa", light: "#7cd9fd", dark: "#0170a3", contrastText: "#101828" },
      background: { default: "#080d18", paper: "#1d2939" },
      divider: "#344054",
      text: { primary: "#f9fafb", secondary: "#98a2b3" },
    },
  }),
  light: createTheme({
    ...reviewThemeOptions,
    palette: {
      mode: "light",
      primary: { main: "#0170a3", light: "#36c7fa", dark: "#004d73", contrastText: "#ffffff" },
      background: { default: "#f8fafc", paper: "#ffffff" },
      divider: "#cbd5e1",
      text: { primary: "#101828", secondary: "#475467" },
    },
  }),
} as const;

/** Test-only provider selected by the Storybook contract runner; never part of package output. */
export function VireoStorybookProvider({ children, temporalLocale = "en" }: VireoStorybookProviderProps) {
  const themeMode = React.useContext(VireoStorybookThemeModeContext);
  return (
    <ThemeProvider theme={themes[themeMode]}>
      <VireoTemporalLocalizationProvider locale={temporalLocale}>
        <CssBaseline />
        <Box color="text.primary" sx={{ minWidth: 0, width: "100%" }}>
          {children}
        </Box>
      </VireoTemporalLocalizationProvider>
    </ThemeProvider>
  );
}

export * from "../../storybook";
