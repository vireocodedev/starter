import { Button } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function CustomSelectedOptionsRendererExample() {
  const form = useVireoForm({
    defaultValues: { audiences: ["Developers", "Designers", "Operators"] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Audience" variant="plain" layout="stack">
          <form.Field name="audiences">
            {field => (
              <VireoLabelBox label="Audiences">
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  options={["Developers", "Designers", "Operators"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  renderSelectedOptions={({ selections, getRemoveButtonProps }) => (
                    <>
                      {selections.map(selection => (
                        <Button key={selection.value} size="small" {...getRemoveButtonProps(selection.value)}>
                          {selection.label} ×
                        </Button>
                      ))}
                    </>
                  )}
                  slotProps={{ htmlInput: { "aria-label": "Audiences" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
