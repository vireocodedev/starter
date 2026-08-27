import { createTheme, ThemeProvider } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const theme = createTheme({
  palette: { mode: "dark" },
  components: {
    VireoFormAutocompleteMultipleField: {
      styleOverrides: {
        root: { borderInlineStart: "3px solid #43d7a5", paddingInlineStart: 12 },
        selectedOption: { backgroundColor: "rgba(67, 215, 165, 0.18)" },
      },
    },
  },
});
const topics = [
  { id: "security", name: "Security" },
  { id: "quality", name: "Quality" },
  { id: "delivery", name: "Delivery" },
];
export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { topics: ["quality", "delivery"] as string[] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <form.Form>
          <form.Section label="Theme defaults" variant="plain" layout="stack">
            <form.Field name="topics">
              {field => (
                <VireoLabelBox label="Topics">
                  <field.AutocompleteMultipleField
                    label={null}
                    options={topics}
                    getOptionValue={topic => topic.id}
                    getOptionLabel={topic => topic.name}
                    slotProps={{ htmlInput: { "aria-label": "Topics" } }}
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
