import { VireoJsonViewer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoJsonViewer: {
        defaultProps: { maxHeight: 280 },
        styleOverrides: {
          root: { borderColor: "#a78bfa", borderRadius: 12, boxShadow: "0 12px 32px rgb(76 29 149 / 18%)" },
          toolbar: { padding: 4, borderRadius: 8, backgroundColor: "rgb(46 16 101 / 90%)" },
          copyButton: { color: "#c4b5fd" },
          content: { color: "#ede9fe", backgroundColor: "#171225" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Box sx={{ maxWidth: 720 }}>
          <VireoJsonViewer
            data={{ requestId: "req_01J5V8JH28X7K3P1", status: "failed" }}
            copyLabel="Copy JSON to clipboard"
            copiedLabel="JSON copied"
          />
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
