import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSwitchField: {
        defaultProps: { labelPlacement: "start" },
        styleOverrides: {
          label: { color: "#c4b5fd", fontWeight: 700 },
          checked: {
            position: "relative",
            "&::before": {
              borderInlineStart: "3px solid",
              borderColor: "#34d399",
              borderRadius: 4,
              content: '""',
              insetBlock: 4,
              insetInlineStart: -10,
              position: "absolute",
            },
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { experimentalFeatures: true },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Section label="Switch example" variant="plain" layout="stack">
            <form.Field name="experimentalFeatures">
              {field => <field.SwitchField label="Enable experimental features" />}
            </form.Field>
            <form.Actions>
              <form.SubmitButton variant="contained">Save features</form.SubmitButton>
            </form.Actions>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
