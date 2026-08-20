import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
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
          <Stack spacing={2}>
            <form.Field name="teamName">
              {field => (
                <VireoLabelBox label="Team name">
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Team name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.SubmitButton variant="contained">Save team</form.SubmitButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
