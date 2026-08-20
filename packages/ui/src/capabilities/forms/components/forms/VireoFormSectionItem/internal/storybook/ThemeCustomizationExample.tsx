import { Alert, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoFormSection, VireoFormSectionItem } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSectionItem: {
        styleOverrides: {
          root: {
            borderInlineStart: "4px solid #a78bfa",
            paddingInlineStart: 16,
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
        <VireoFormSection label="Deployment" maxColumns={2}>
          <VireoFormSectionItem span="full">
            <Alert severity="info">The deployment window applies to every selected environment.</Alert>
          </VireoFormSectionItem>
        </VireoFormSection>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
