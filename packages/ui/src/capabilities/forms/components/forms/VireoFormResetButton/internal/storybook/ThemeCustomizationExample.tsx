import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormResetButton: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
          dirty: { borderColor: "#f59e0b", color: "#fbbf24" },
          root: { fontWeight: 700 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { releaseName: "August launch" } });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Section label="Release" variant="plain" layout="stack">
            <form.Field name="releaseName">
              {field => (
                <VireoLabelBox label="Release name">
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Release name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
          <form.Actions>
            <form.ResetButton>Discard edits</form.ResetButton>
          </form.Actions>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
