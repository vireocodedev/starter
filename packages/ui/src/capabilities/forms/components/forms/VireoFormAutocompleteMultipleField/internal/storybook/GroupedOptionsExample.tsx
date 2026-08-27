import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const permissions = [
  { id: "read", name: "Read", group: "Content" },
  { id: "write", name: "Write", group: "Content" },
  { id: "invite", name: "Invite users", group: "Administration" },
  { id: "billing", name: "Manage billing", group: "Administration" },
];
export default function GroupedOptionsExample() {
  const form = useVireoForm({ defaultValues: { permissions: ["read"] as string[] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Permissions" variant="plain" layout="stack">
          <form.Field name="permissions">
            {field => (
              <VireoLabelBox label="Granted permissions">
                <field.AutocompleteMultipleField
                  label={null}
                  options={permissions}
                  getOptionValue={permission => permission.id}
                  getOptionLabel={permission => permission.name}
                  groupBy={permission => permission.group}
                  slotProps={{ htmlInput: { "aria-label": "Granted permissions" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
