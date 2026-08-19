import { VireoDockedSidePanel, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/starter-ui/storybook/VireoDockedSidePanel";
import { Box, ThemeProvider, Typography, createTheme } from "@mui/material";

const theme = createTheme({
  components: {
    VireoDockedSidePanel: {
      styleOverrides: {
        root: { paddingLeft: 6, backgroundColor: "#2e1065" },
        surface: { borderLeft: "3px solid #a78bfa", boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.38)" },
      },
    },
  },
});

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={outerTheme => createTheme(outerTheme, theme)}>
        <VireoDockedSidePanelWorkspaceFrame>
          <VireoDockedSidePanel open width={420} minWidth={280} maxWidth={620}>
            <VireoOverlayHeader title="Invoice details" />
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">Theme defaults style every docked panel consistently.</Typography>
            </Box>
          </VireoDockedSidePanel>
        </VireoDockedSidePanelWorkspaceFrame>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
