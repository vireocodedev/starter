import { VireoStopwatch } from "@vireocodedev/starter-ui";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoStopwatch: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(167, 139, 250, 0.12)",
            border: "1px solid #a78bfa",
            borderRadius: 6,
            color: "#a78bfa",
            fontSize: "1rem",
            padding: "8px 12px",
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
        <VireoStopwatch
          startDate={Date.UTC(2026, 0, 1, 9, 0, 0)}
          endDate={Date.UTC(2026, 0, 1, 9, 42, 17)}
          label="Customized duration"
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
