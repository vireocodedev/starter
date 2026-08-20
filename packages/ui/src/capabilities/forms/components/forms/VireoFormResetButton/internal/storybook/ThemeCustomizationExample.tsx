import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
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
        <form.Form sx={{ maxWidth: 480 }}>
          <Stack spacing={2}>
            <form.Field name="releaseName">{field => <field.TextField label="Release name" />}</form.Field>
            <form.ResetButton>Discard edits</form.ResetButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
