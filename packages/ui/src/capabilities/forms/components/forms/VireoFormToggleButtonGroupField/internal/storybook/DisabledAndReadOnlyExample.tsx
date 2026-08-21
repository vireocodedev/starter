import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "owner", label: "Owner" },
] as const;

export default function DisabledAndReadOnlyExample() {
  const form = useVireoForm({
    defaultValues: { disabledRole: "viewer" as string | null, readOnlyRole: "editor" as string | null },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Non-editable states" variant="plain" layout="stack">
          <Stack spacing={2}>
            <form.Field name="disabledRole">
              {field => (
                <VireoLabelBox label="Disabled">
                  <field.ToggleButtonGroupField disabled aria-label="Disabled role" options={roles} />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Field name="readOnlyRole">
              {field => (
                <VireoLabelBox label="Read only">
                  <field.ToggleButtonGroupField readOnly aria-label="Read-only role" options={roles} />
                </VireoLabelBox>
              )}
            </form.Field>
          </Stack>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
