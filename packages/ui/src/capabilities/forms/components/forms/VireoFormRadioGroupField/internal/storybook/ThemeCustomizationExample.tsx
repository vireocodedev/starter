import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const priorities = [
  { id: "routine", label: "Routine" },
  { id: "important", label: "Important" },
  { id: "critical", label: "Critical" },
] as const;

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormRadioGroupField: {
        defaultProps: { row: true },
        styleOverrides: {
          root: { maxWidth: 520 },
          radioGroup: { backgroundColor: "rgba(139, 92, 246, 0.08)", borderRadius: 8, padding: 8 },
          radio: { color: "#a78bfa" },
          optionLabel: { color: "#ddd6fe", fontWeight: 600 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { priority: "important" as string | null } });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Section label="Priority" variant="plain" layout="stack">
            <form.Field name="priority">
              {field => (
                <VireoLabelBox label="Review priority">
                  <field.RadioGroupField
                    aria-label="Review priority"
                    options={priorities}
                    getOptionValue={priority => priority.id}
                    renderOption={priority => priority.label}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Actions>
              <form.ResetButton>Reset priority</form.ResetButton>
            </form.Actions>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
