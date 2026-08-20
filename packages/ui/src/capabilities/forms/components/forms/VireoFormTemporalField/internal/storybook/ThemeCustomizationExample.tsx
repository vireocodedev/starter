import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createTemporalTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormTemporalField: {
        styleOverrides: {
          input: { backgroundColor: "rgba(167, 139, 250, 0.08)" },
          openPickerIcon: { color: "#a78bfa" },
          root: { borderInlineStart: "3px solid #a78bfa", paddingInlineStart: 12 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { release: "2026-08-25T14:30:00" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createTemporalTheme}>
        <form.Form sx={{ maxWidth: 480 }}>
          <Stack spacing={2}>
            <form.Field name="release">
              {field => (
                <VireoLabelBox label="Release date and time">
                  <field.TemporalField
                    mode="date-time"
                    slotProps={{ htmlInput: { "aria-label": "Release date and time" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.ResetButton variant="outlined">Reset release</form.ResetButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
