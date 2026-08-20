import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoForm: {
        styleOverrides: {
          root: {
            borderInlineStart: "3px solid #a78bfa",
            paddingInlineStart: 20,
          },
          dirty: {
            borderInlineStartColor: "#f59e0b",
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { teamName: "Platform" },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Section label="Team" variant="plain" layout="stack">
            <form.Field name="teamName">
              {field => (
                <VireoLabelBox label="Team name">
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Team name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
          <form.Actions>
            <form.SubmitButton variant="contained">Save team</form.SubmitButton>
          </form.Actions>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
