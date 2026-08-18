import { VIREO_STORY_SURFACE_BACKGROUND, vireoStorybookTheme } from "./storybook-theme";
import "./preview.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { Preview } from "@storybook/react-vite";
import React from "react";

const reviewTheme = createTheme({
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
      default: VIREO_STORY_SURFACE_BACKGROUND,
      paper: "#1d2939",
    },
    divider: "#344054",
    text: {
      primary: "#f9fafb",
      secondary: "#98a2b3",
    },
  },
});

const preview: Preview = {
  decorators: [
    Story => (
      <ThemeProvider theme={reviewTheme}>
        <CssBaseline />
        <div className="vireo-story-surface">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: "padded",
    controls: {
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: vireoStorybookTheme,
      controls: {
        sort: "requiredFirst",
      },
    },
    backgrounds: {
      disable: true,
    },
  },
  tags: ["autodocs"],
};

export default preview;
