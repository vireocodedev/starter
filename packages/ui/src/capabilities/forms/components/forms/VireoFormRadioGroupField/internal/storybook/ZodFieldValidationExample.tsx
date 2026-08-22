import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const channels = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push notification" },
] as const;

const channelSchema = z
  .enum(["email", "sms", "push"])
  .nullable()
  .refine(channel => channel !== null, "Choose a notification channel.");

export default function ZodFieldValidationExample() {
  const [savedChannel, setSavedChannel] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { channel: null as string | null },
    onSubmit: ({ value }) => setSavedChannel(value.channel),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Notification channel" variant="plain" layout="stack">
          <form.Field name="channel" validators={{ onDynamic: channelSchema }}>
            {field => (
              <VireoLabelBox label="Notification channel" required>
                <field.RadioGroupField
                  aria-label="Notification channel"
                  required
                  options={channels}
                  getOptionValue={channel => channel.id}
                  renderOption={channel => channel.label}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save channel</form.SubmitButton>
          </form.Actions>
          {savedChannel && <Typography color="success.main">Saved {savedChannel}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
