import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const channels = [
  { id: "email", name: "Email" },
  { id: "sms", name: "SMS" },
  { id: "push", name: "Push" },
  { id: "webhook", name: "Webhook" },
];
export default function MaximumSelectedOptionsExample() {
  const form = useVireoForm({ defaultValues: { channels: ["email", "push"] as string[] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Notifications" variant="plain" layout="stack">
          <form.Field name="channels">
            {field => (
              <VireoLabelBox label="Channels">
                <field.AutocompleteMultipleField
                  label={null}
                  maxSelectedOptions={2}
                  helperText="Choose up to two channels."
                  options={channels}
                  getOptionValue={channel => channel.id}
                  getOptionLabel={channel => channel.name}
                  slotProps={{ htmlInput: { "aria-label": "Channels" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
