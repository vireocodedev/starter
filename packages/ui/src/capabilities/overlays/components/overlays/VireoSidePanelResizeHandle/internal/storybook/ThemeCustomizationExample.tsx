import { VireoSidePanelResizeHandle } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoSidePanelResizeHandle: {
        styleOverrides: {
          root: { "&::after": { backgroundColor: "#a78bfa", opacity: 0.65 } },
          resizing: { "&::after": { backgroundColor: "#f472b6", opacity: 1 } },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Box
          sx={{
            position: "relative",
            width: 360,
            height: 240,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <VireoSidePanelResizeHandle
            isResizing
            onResizeStart={() => undefined}
            onResizeDoubleClick={() => undefined}
          />
          <Box sx={{ p: 3, color: "text.secondary" }}>Side-panel content</Box>
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
