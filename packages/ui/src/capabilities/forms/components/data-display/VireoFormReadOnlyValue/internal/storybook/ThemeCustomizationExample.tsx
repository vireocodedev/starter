import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoFormReadOnlyValue } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormReadOnlyValue: {
        styleOverrides: {
          value: {
            color: "primary.main",
            fontWeight: 700,
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
        <VireoFormReadOnlyValue label="Plan">Enterprise</VireoFormReadOnlyValue>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
