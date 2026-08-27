import { createTheme, ThemeProvider } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const theme = createTheme({
  palette: { mode: "dark" },
  components: {
    VireoFormFreeSoloAutocompleteField: {
      styleOverrides: {
        root: { borderInlineStart: "3px solid #ab7cff", paddingInlineStart: 12 },
        option: { borderRadius: 8, marginInline: 6 },
      },
    },
  },
});
export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { label: "Important" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <form.Form>
          <form.Section label="Theme defaults" variant="plain" layout="stack">
            <form.Field name="label">
              {field => (
                <VireoLabelBox label="Label">
                  <field.FreeSoloAutocompleteField
                    label={null}
                    options={["Important", "Optional"]}
                    getOptionValue={value => value}
                    getOptionLabel={value => value}
                    slotProps={{ htmlInput: { "aria-label": "Label" } }}
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
