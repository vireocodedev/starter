import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const options = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export default function DisableClearableExample() {
  const form = useVireoForm({
    defaultValues: { cadence: "weekly" as string | null, reports: ["daily"] as string[] },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Protected selections" variant="plain" layout="stack">
          <Stack spacing={2}>
            <form.Field name="cadence">
              {field => (
                <VireoLabelBox label="Exclusive cadence">
                  <field.ToggleButtonGroupField disableClearable aria-label="Exclusive cadence" options={options} />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Field name="reports">
              {field => (
                <VireoLabelBox label="Required report cadences">
                  <field.ToggleButtonGroupField
                    multiple
                    disableClearable
                    aria-label="Required report cadences"
                    options={options}
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
