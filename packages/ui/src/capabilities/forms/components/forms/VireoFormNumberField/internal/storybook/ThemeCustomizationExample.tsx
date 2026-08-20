import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormNumberField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          htmlInput: { color: "#c4b5fd", fontVariantNumeric: "tabular-nums" },
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
        <form.Form>
          <form.Section label="Target" variant="plain" layout="stack">
            <form.Field name="target">
              {field => (
                <VireoLabelBox label="Target score">
                  <field.NumberField
                    helperText="Theme-owned compact numeric field."
                    slotProps={{ htmlInput: { "aria-label": "Target score" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Actions>
              <form.SubmitButton variant="contained">Save target</form.SubmitButton>
            </form.Actions>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
