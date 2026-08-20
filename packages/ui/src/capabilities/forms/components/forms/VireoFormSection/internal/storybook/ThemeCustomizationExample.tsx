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
            borderRadius: 12,
          },
          layout: {
            rowGap: 24,
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
        <VireoFormSection label="Security" description="Recovery settings for account access.">
          <VireoLabelBox label="Recovery email">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Recovery email" } }} />
          </VireoLabelBox>
          <VireoLabelBox label="Backup phone">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Backup phone" } }} />
          </VireoLabelBox>
        </VireoFormSection>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
