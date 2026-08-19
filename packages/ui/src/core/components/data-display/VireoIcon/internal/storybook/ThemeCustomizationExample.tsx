import { Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoIcon: {
        defaultProps: { width: 36, height: 36, strokeWidth: 1.5 },
        styleOverrides: { root: { color: "#a78bfa" } },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoIconRegistryProvider>
          <Stack direction="row" spacing={2} alignItems="center">
            <VireoIcon icon="check-circle" titleAccess="Verified" />
            <Typography color="text.primary">Theme-sized registry icon</Typography>
          </Stack>
        </VireoIconRegistryProvider>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
