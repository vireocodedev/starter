// Date picker translations
import "dayjs/locale/en";
import "dayjs/locale/hr";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import i18n from "i18next";
import React from "react";
import { type DecoratorFunction } from "storybook/internal/csf";
import { configureQueryClient } from "../src/features/@tanstack/react-query/lib";
import { configureI18nClient } from "../src/features/i18next/lib";
import { RgoQueryClientProvider } from "../src/providers/RgoQueryClientProvider/RgoQueryClientProvider";
import { RGO_LOCALE_NAMESPACE } from "../src/setup/config/RgoLocale";
import { darkTheme } from "./storybook-theme-dark";
import { lightTheme } from "./storybook-theme-light";

configureI18nClient(i18n, {
  ns: [RGO_LOCALE_NAMESPACE],
});

// react-query
const queryClient = configureQueryClient();

export const StorybookDecorator: DecoratorFunction = (Story, context) => {
  const { locale } = context.globals;

  // When the locale global changes
  // Set the new locale in i18n
  React.useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  // Get the active theme value from the story parameter
  const { theme } = context.globals;
  const storyTheme = theme === "dark" ? darkTheme : lightTheme;

  // Set the canvas background to match the theme
  const canvasElement = context.canvasElement?.parentElement;
  if (canvasElement) {
    canvasElement.style.backgroundColor = storyTheme.palette.background.default;
  }

  return (
    <React.Suspense fallback={<div>loading translations...</div>}>
      <RgoQueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
          <ThemeProvider theme={storyTheme}>
            <CssBaseline />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyItems: "center",
                backgroundColor: storyTheme.palette.background.default,
                padding: "1.5rem 1rem 1.125rem 1rem",
              }}
            >
              <div>
                <Story />
              </div>
            </div>
          </ThemeProvider>
        </LocalizationProvider>
      </RgoQueryClientProvider>
    </React.Suspense>
  );
};
