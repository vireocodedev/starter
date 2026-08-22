import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { regions: ["Europe"] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Coverage" variant="plain" layout="stack">
          <form.Field name="regions">
            {field => (
              <VireoLabelBox label="Regions">
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  options={["Europe", "Asia", "Americas"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{
                    root: { "data-analytics-field": "regions" },
                    selectedOption: { color: "secondary" },
                    option: { sx: { fontWeight: 700 } },
                    htmlInput: { "aria-label": "Regions" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
