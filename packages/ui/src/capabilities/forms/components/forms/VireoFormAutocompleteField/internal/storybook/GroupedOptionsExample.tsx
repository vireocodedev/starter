import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const locations = [
  { id: "berlin", city: "Berlin", region: "Europe" },
  { id: "zagreb", city: "Zagreb", region: "Europe" },
  { id: "osaka", city: "Osaka", region: "Asia" },
  { id: "tokyo", city: "Tokyo", region: "Asia" },
];
export default function GroupedOptionsExample() {
  const form = useVireoForm({ defaultValues: { locationId: null as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Office" variant="plain" layout="stack">
          <form.Field name="locationId">
            {field => (
              <VireoLabelBox label="Location">
                <field.AutocompleteField
                  label={null}
                  options={locations}
                  getOptionValue={location => location.id}
                  getOptionLabel={location => location.city}
                  groupBy={location => location.region}
                  renderGroupLabel={region => `${region} offices`}
                  slotProps={{ htmlInput: { "aria-label": "Location" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
