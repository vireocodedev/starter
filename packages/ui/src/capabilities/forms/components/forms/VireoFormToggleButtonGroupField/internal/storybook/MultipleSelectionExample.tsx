import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
] as const;

export default function MultipleSelectionExample() {
  const form = useVireoForm({ defaultValues: { channels: [] as string[] } });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Notifications" variant="plain" layout="stack">
          <form.Field name="channels">
            {field => (
              <VireoLabelBox label="Delivery channels">
                <field.ToggleButtonGroupField multiple aria-label="Delivery channels" options={channels} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Subscribe selector={state => state.values.channels}>
            {value => <Typography color="text.secondary">Selected: {value.join(", ") || "none"}</Typography>}
          </form.Subscribe>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
