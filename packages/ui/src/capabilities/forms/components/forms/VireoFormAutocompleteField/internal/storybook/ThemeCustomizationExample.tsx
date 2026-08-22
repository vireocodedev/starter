import { createTheme, ThemeProvider } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const theme = createTheme({
  palette: { mode: "dark" },
  components: {
    VireoFormAutocompleteField: {
      styleOverrides: {
        root: { borderInlineStart: "3px solid #ab7cff", paddingInlineStart: 12 },
        option: { borderRadius: 8, marginInline: 6 },
      },
    },
  },
});
const priorities = [
  { id: "normal", name: "Normal" },
  { id: "high", name: "High" },
  { id: "urgent", name: "Urgent" },
];
export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { priorityId: "normal" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <form.Form>
          <form.Section label="Theme defaults" variant="plain" layout="stack">
            <form.Field name="priorityId">
              {field => (
                <VireoLabelBox label="Priority">
                  <field.AutocompleteField
                    label={null}
                    options={priorities}
                    getOptionValue={priority => priority.id}
                    getOptionLabel={priority => priority.name}
                    slotProps={{ htmlInput: { "aria-label": "Priority" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
