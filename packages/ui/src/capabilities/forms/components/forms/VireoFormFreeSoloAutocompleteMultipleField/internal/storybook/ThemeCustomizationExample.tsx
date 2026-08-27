import { createTheme, ThemeProvider } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const theme = createTheme({
  palette: { mode: "dark" },
  components: {
    VireoFormFreeSoloAutocompleteMultipleField: {
      styleOverrides: {
        root: { borderInlineStart: "3px solid #ffb74d", paddingInlineStart: 12 },
        selectedOption: { borderRadius: 4 },
      },
    },
  },
});
export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { labels: ["Priority", "Customer"] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <form.Form>
          <form.Section label="Theme defaults" variant="plain" layout="stack">
            <form.Field name="labels">
              {field => (
                <VireoLabelBox label="Labels">
                  <field.FreeSoloAutocompleteMultipleField
                    label={null}
                    options={["Priority", "Customer", "Internal"]}
                    getOptionValue={value => value}
                    getOptionLabel={value => value}
                    slotProps={{ htmlInput: { "aria-label": "Labels" } }}
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
