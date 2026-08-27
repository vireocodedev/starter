import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
] as const;

export default function ZodFieldValidationExample() {
  const form = useVireoForm({
    defaultValues: { priority: null as string | null },
    validationLogic: revalidateLogic(),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Ticket" variant="plain" layout="stack">
          <form.Field
            name="priority"
            validators={{ onDynamic: z.string().nullable().refine(Boolean, "Choose a priority.") }}
          >
            {field => (
              <VireoLabelBox label="Priority" required>
                <field.ToggleButtonGroupField required aria-label="Priority" options={priorities} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Create ticket</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
