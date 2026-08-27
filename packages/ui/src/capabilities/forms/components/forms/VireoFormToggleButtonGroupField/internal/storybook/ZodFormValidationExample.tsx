import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const visibilityOptions = [
  { value: "private", label: "Private" },
  { value: "team", label: "Team" },
  { value: "public", label: "Public" },
] as const;
const channelOptions = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push" },
] as const;
const settingsSchema = z.object({
  visibility: z.string().nullable().refine(Boolean, "Choose visibility."),
  channels: z.array(z.string()).min(1, "Choose at least one channel."),
});

export default function ZodFormValidationExample() {
  const form = useVireoForm({
    defaultValues: { visibility: null as string | null, channels: [] as string[] },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: settingsSchema },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Workspace settings" variant="plain" layout="stack">
          <form.Field name="visibility">
            {field => (
              <VireoLabelBox label="Visibility" required>
                <field.ToggleButtonGroupField required aria-label="Visibility" options={visibilityOptions} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="channels">
            {field => (
              <VireoLabelBox label="Channels" required>
                <field.ToggleButtonGroupField multiple required aria-label="Channels" options={channelOptions} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save settings</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
