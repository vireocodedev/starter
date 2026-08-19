import { Button, Stack, TextField, ThemeProvider, createTheme, type Theme } from "@mui/material";
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
                <TextField
                  fullWidth
                  label="Team name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={event => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
            <Button type="submit" variant="contained">
              Save team
            </Button>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
