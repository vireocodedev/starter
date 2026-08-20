import { Stack, Typography } from "@mui/material";
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
      <form.Form sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
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
          <form.SubmitButton>Save channel</form.SubmitButton>
          {savedChannel && <Typography color="success.main">Saved {savedChannel}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
