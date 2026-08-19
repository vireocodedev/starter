import { Button, Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          inputLabel: { color: "#c4b5fd" },
          dirty: { borderInlineStart: "3px solid #f59e0b", paddingInlineStart: 12 },
          errorVisible: { borderInlineStartColor: "#f87171" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { releaseName: "" },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form sx={{ maxWidth: 480 }}>
          <Stack spacing={2}>
            <form.Field
              name="releaseName"
              validators={{ onChange: ({ value }) => (value.trim() ? undefined : "A release name is required.") }}
            >
              {field => <field.TextField errorDisplay="always" label="Release name" placeholder="August launch" />}
            </form.Field>
            <Button type="submit" variant="contained">
              Create release
            </Button>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
