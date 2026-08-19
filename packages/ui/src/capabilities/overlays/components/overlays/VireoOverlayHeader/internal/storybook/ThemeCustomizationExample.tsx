import { VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoOverlayHeader: {
        defaultProps: { sticky: false },
        styleOverrides: {
          root: { borderBottomWidth: 3, borderBottomColor: "#a78bfa" },
          title: { color: "#a78bfa", fontWeight: 700 },
          closeButton: { borderRadius: 4 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <VireoOverlayHeader title="Edit invoice" closeLabel="Close themed overlay" onClose={() => {}} />
          <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
