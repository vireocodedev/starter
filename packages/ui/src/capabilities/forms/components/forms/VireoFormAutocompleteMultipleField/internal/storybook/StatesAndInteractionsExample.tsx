import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const tags = [
  { id: "active", name: "Active" },
  { id: "review", name: "Needs review" },
  { id: "blocked", name: "Blocked" },
];
export default function StatesAndInteractionsExample() {
  const form = useVireoForm({
    defaultValues: { editable: ["active"] as string[], locked: ["review"] as string[] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Selection states" variant="plain" layout="stack">
          <Stack spacing={2}>
            <form.Field name="editable">
              {field => (
                <VireoLabelBox label="Editable tags">
                  <field.AutocompleteMultipleField
                    label={null}
                    options={tags}
                    getOptionValue={tag => tag.id}
                    getOptionLabel={tag => tag.name}
                    slotProps={{ htmlInput: { "aria-label": "Editable tags" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Field name="locked">
              {field => (
                <VireoLabelBox label="Read-only tags">
                  <field.AutocompleteMultipleField
                    label={null}
                    readOnly
                    options={tags}
                    getOptionValue={tag => tag.id}
                    getOptionLabel={tag => tag.name}
                    slotProps={{ htmlInput: { "aria-label": "Read-only tags" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
          </Stack>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
