import { SettingsOutlined } from "@mui/icons-material";
import { Box, List, ThemeProvider, createTheme } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const theme = createTheme({
  palette: { mode: "dark", primary: { main: "#a78bfa" } },
  components: {
    VireoApplicationNavigation: {
      styleOverrides: { content: { background: "linear-gradient(180deg, #17132d, #090712)" } },
    },
  },
});

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
          <VireoApplicationNavigation expandedWidth={300} resizable={false}>
            <List sx={{ px: 1, py: 2 }}>
              <VireoApplicationNavigationItem icon={<SettingsOutlined />} label="Workspace settings" selected />
            </List>
          </VireoApplicationNavigation>
          <Box sx={{ flex: 1, p: 3 }}>Theme defaults style every navigation instance.</Box>
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
