import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function UnresolvedValueExample() {
  const form = useVireoForm({
    defaultValues: { ownerId: "usr-archived-18" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Archived reference" variant="plain" layout="stack">
          <form.Field name="ownerId">
            {field => (
              <VireoLabelBox label="Owner">
                <field.AutocompleteField
                  label={null}
                  options={[]}
                  getOptionValue={(option: { id: string }) => option.id}
                  getOptionLabel={option => option.id}
                  getUnresolvedValueLabel={value => `Archived user (${value})`}
                  slotProps={{ htmlInput: { "aria-label": "Owner" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
