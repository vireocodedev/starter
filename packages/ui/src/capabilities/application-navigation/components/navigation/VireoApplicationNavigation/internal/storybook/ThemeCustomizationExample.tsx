import { SettingsOutlined } from "@mui/icons-material";
import { Box, List, ListItem, ThemeProvider, createTheme, type Theme, useTheme } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function ThemeCustomizationExample() {
  const outerTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme(outerTheme, {
        components: {
          VireoApplicationNavigation: {
            styleOverrides: {
              content: ({ theme: activeTheme }: { theme: Theme }) => ({
                background: `linear-gradient(180deg, ${activeTheme.vireo.surface.raised}, ${activeTheme.vireo.surface.sunken})`,
              }),
            },
          },
        },
      }),
    [outerTheme],
  );
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
          <VireoApplicationNavigation navigationLabel="Primary navigation" expandedWidth={300} resizable={false}>
            <List sx={{ px: 1, py: 2 }}>
              <ListItem disablePadding>
                <VireoApplicationNavigationItem
                  href="#settings"
                  icon={<SettingsOutlined />}
                  label="Workspace settings"
                  selected
                />
              </ListItem>
            </List>
          </VireoApplicationNavigation>
          <Box sx={{ flex: 1, p: 3 }}>Theme defaults style every navigation instance.</Box>
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
