import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { VireoTemporalLocalizationProvider, type VireoTemporalLocale } from "@vireocodedev/starter-ui/localization";
import type React from "react";

export type VireoStorybookProviderProps = {
  children: React.ReactNode;
  /** Temporal locale used by stories that do not demonstrate localization. @default 'en' */
  temporalLocale?: VireoTemporalLocale;
};

const vireoStorybookReviewTheme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#36c7fa",
      light: "#7cd9fd",
      dark: "#0170a3",
      contrastText: "#101828",
    },
    background: {
      default: "#080d18",
      paper: "#1d2939",
    },
    divider: "#344054",
    text: {
      primary: "#f9fafb",
      secondary: "#98a2b3",
    },
  },
});

/** Reproduces the shared dark Vireo review surface used by executable Storybook examples. */
export function VireoStorybookProvider({ children, temporalLocale = "en" }: VireoStorybookProviderProps) {
  return (
    <ThemeProvider theme={vireoStorybookReviewTheme}>
      <VireoTemporalLocalizationProvider locale={temporalLocale}>
        <CssBaseline />
        <Box width="100%" minWidth={0} color="text.primary">
          {children}
        </Box>
      </VireoTemporalLocalizationProvider>
    </ThemeProvider>
  );
}
