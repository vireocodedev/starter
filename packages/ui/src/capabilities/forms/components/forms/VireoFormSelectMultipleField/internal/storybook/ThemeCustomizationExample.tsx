import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const priorities = [
  { id: "reliability", label: "Reliability" },
  { id: "performance", label: "Performance" },
  { id: "accessibility", label: "Accessibility" },
] as const;

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSelectMultipleField: {
        defaultProps: { maxDisplayedOptions: 1 },
        styleOverrides: {
          input: { backgroundColor: outerTheme.palette.action.hover },
          optionCheckbox: { color: "#a78bfa" },
          selectionSummary: { color: "#a78bfa", fontWeight: 700 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { priorities: ["reliability", "performance", "accessibility"] as string[] },
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form sx={{ maxWidth: 560 }}>
          <Stack spacing={2}>
            <form.Field name="priorities">
              {field => (
                <VireoLabelBox label="Engineering priorities">
                  <field.SelectMultipleField
                    label={null}
                    options={priorities}
                    getOptionValue={priority => priority.id}
                    renderOption={priority => priority.label}
                    slotProps={{ select: { SelectDisplayProps: { "aria-label": "Engineering priorities" } } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.ResetButton>Reset priorities</form.ResetButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
