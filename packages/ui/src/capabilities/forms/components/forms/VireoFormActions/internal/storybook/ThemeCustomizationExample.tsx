import { Button, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormActions: {
        styleOverrides: {
          layout: {
            backgroundColor: "rgba(167, 139, 250, 0.12)",
            border: "1px solid #a78bfa",
            borderRadius: 8,
            padding: 16,
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoFormActions>
          <Button variant="outlined">Reset</Button>
          <Button variant="contained">Publish</Button>
        </VireoFormActions>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
