import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoStatusDot: {
        styleOverrides: {
          root: {
            boxShadow: "0 0 0 4px rgba(167, 139, 250, 0.2)",
          },
          selected: {
            backgroundColor: "#a78bfa",
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
        <VireoStatusDot color="info" selected label="Customized selected status" />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
