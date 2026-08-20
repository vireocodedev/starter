import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const priorities = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "urgent", label: "Urgent" },
] as const;

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSelectField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: { maxWidth: 520 },
          select: { backgroundColor: "rgba(139, 92, 246, 0.08)", color: "#c4b5fd" },
          clearButton: { color: "#fbbf24" },
          option: { minHeight: 44 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { priority: "normal" as string | null } });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <Stack spacing={2}>
            <form.Field name="priority">
              {field => (
                <VireoLabelBox label="Priority">
                  <field.SelectField
                    label={null}
                    options={priorities}
                    getOptionValue={priority => priority.id}
                    renderOption={priority => priority.label}
                    slotProps={{ select: { SelectDisplayProps: { "aria-label": "Priority" } } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.ResetButton>Reset priority</form.ResetButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
