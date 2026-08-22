import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const regions = ["Europe", "Asia Pacific", "North America", "South America", "Africa"].map((name, index) => ({
  id: index,
  name,
}));
export default function CompactSelectedOptionsExample() {
  const form = useVireoForm({ defaultValues: { regions: [0, 1, 2, 3] as number[] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Coverage" variant="plain" layout="stack">
          <form.Field name="regions">
            {field => (
              <VireoLabelBox label="Regions">
                <field.AutocompleteMultipleField
                  label={null}
                  maxDisplayedOptions={2}
                  options={regions}
                  getOptionValue={region => region.id}
                  getOptionLabel={region => region.name}
                  slotProps={{ htmlInput: { "aria-label": "Regions" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
