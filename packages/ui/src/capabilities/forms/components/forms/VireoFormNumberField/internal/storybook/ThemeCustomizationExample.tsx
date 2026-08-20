import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormNumberField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          inputLabel: { color: "#c4b5fd" },
          htmlInput: { fontVariantNumeric: "tabular-nums" },
          dirty: {
            position: "relative",
            "&::before": {
              borderInlineStart: "3px solid",
              borderColor: "#f59e0b",
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
    defaultValues: { target: 85 as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form sx={{ maxWidth: 480 }}>
          <Stack spacing={2}>
            <form.Field name="target">
              {field => <field.NumberField helperText="Theme-owned compact numeric field." label="Target score" />}
            </form.Field>
            <form.SubmitButton variant="contained">Save target</form.SubmitButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
