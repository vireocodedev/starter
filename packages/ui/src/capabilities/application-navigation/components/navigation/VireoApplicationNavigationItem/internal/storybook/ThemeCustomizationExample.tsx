import { HomeOutlined } from "@mui/icons-material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material";
import { VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function ThemeCustomizationExample() {
  const outerTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme(outerTheme, {
        components: {
          VireoApplicationNavigationItem: {
            styleOverrides: { root: { border: "1px solid rgba(245, 158, 11, 0.45)" } },
          },
        },
      }),
    [outerTheme],
  );
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoApplicationNavigationItem
          href="#home"
          icon={<HomeOutlined />}
          label="Home"
          selected
          sx={{ maxWidth: 320 }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
