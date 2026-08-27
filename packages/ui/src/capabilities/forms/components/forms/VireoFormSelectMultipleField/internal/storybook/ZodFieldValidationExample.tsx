import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const channels = [
  { id: "email", label: "Email" },
  { id: "push", label: "Push notification" },
  { id: "sms", label: "SMS" },
] as const;

const channelSchema = z.array(z.enum(["email", "push", "sms"])).min(2, "Choose at least two channels.");

export default function ZodFieldValidationExample() {
  const [saved, setSaved] = React.useState<string[]>([]);
  const form = useVireoForm({
    defaultValues: { channels: [] as string[] },
    onSubmit: ({ value }) => setSaved(value.channels),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Notification channels" variant="plain" layout="stack">
          <form.Field name="channels" validators={{ onDynamic: channelSchema }}>
            {field => (
              <VireoLabelBox label="Notification channels" required>
                <field.SelectMultipleField
                  label={null}
                  required
                  placeholder="Choose at least two"
                  options={channels}
                  getOptionValue={channel => channel.id}
                  renderOption={channel => channel.label}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Notification channels" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save channels</form.SubmitButton>
          </form.Actions>
          {saved.length > 0 && <Typography color="success.main">Saved {saved.join(", ")}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
