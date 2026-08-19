import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { TextField } from "@mui/material";
import { VireoFormSection } from "@vireocodedev/starter-ui";

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
          <TextField label="Recovery email" fullWidth />
        </VireoFormSection>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
