import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { OutlinedInput, ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoLabelBox: {
        defaultProps: { fontWeight: 700, required: true },
        styleOverrides: {
          root: { padding: 16, border: "1px solid #a78bfa", borderRadius: 12, backgroundColor: "#171225" },
          label: { color: "#c4b5fd" },
          helperText: { color: "#a78bfa" },
          content: { paddingTop: 4 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoLabelBox label="Account name" helperText="Theme defaults and per-slot overrides">
          <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />
        </VireoLabelBox>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
