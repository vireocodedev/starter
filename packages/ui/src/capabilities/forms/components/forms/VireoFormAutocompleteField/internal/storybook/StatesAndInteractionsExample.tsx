import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const plans = [
  { id: 1, name: "Starter" },
  { id: 2, name: "Business" },
  { id: 3, name: "Enterprise" },
];
export default function StatesAndInteractionsExample() {
  const form = useVireoForm({
    defaultValues: { active: 2 as number | null, locked: 1 as number | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Field states" variant="plain" layout="stack">
          <Stack spacing={2}>
            <form.Field name="active">
              {field => (
                <VireoLabelBox label="Clearable plan">
                  <field.AutocompleteField
                    label={null}
                    options={plans}
                    getOptionValue={plan => plan.id}
                    getOptionLabel={plan => plan.name}
                    slotProps={{ htmlInput: { "aria-label": "Clearable plan" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Field name="locked">
              {field => (
                <VireoLabelBox label="Read-only plan">
                  <field.AutocompleteField
                    label={null}
                    readOnly
                    options={plans}
                    getOptionValue={plan => plan.id}
                    getOptionLabel={plan => plan.name}
                    slotProps={{ htmlInput: { "aria-label": "Read-only plan" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Field name="locked">
              {field => (
                <VireoLabelBox label="Disabled plan">
                  <field.AutocompleteField
                    label={null}
                    disabled
                    options={plans}
                    getOptionValue={plan => plan.id}
                    getOptionLabel={plan => plan.name}
                    slotProps={{ htmlInput: { "aria-label": "Disabled plan" } }}
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
