import { TextField, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSection: {
        styleOverrides: {
          root: {
            maxWidth: 560,
          },
          content: {
            border: "1px solid #64748b",
            outline: "none",
            borderRadius: 12,
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
        <VireoFormSection label="Security">
          <VireoLabelBox label="Recovery email">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Recovery email" } }} />
          </VireoLabelBox>
        </VireoFormSection>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
