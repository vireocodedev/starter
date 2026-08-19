import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoDelayedRender: {
        defaultProps: { delay: 400 },
        styleOverrides: {
          root: {
            display: "block",
            padding: 16,
            border: "2px dashed #a78bfa",
            borderRadius: 12,
            color: "#c4b5fd",
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
        <VireoDelayedRender>Themed delayed content</VireoDelayedRender>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
