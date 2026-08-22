import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const accessLevels = [
  { id: 1, label: "Read only" },
  { id: 2, label: "Editor" },
  { id: 3, label: "Administrator" },
] as const;

const memberSchema = z.object({
  memberName: z.string().min(3, "Enter at least three characters."),
  accessLevel: z
    .number()
    .nullable()
    .refine(level => level !== null, "Choose an access level."),
});

export default function ZodFormValidationExample() {
  const [savedMember, setSavedMember] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { memberName: "", accessLevel: null as number | null },
    onSubmit: ({ value }) => setSavedMember(`${value.memberName} (level ${value.accessLevel})`),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: memberSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Team member" variant="plain" layout="stack">
          <form.Field name="memberName">
            {field => (
              <VireoLabelBox label="Member name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Member name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="accessLevel">
            {field => (
              <VireoLabelBox label="Access level" required>
                <field.RadioGroupField
                  aria-label="Access level"
                  required
                  row
                  options={accessLevels}
                  getOptionValue={level => level.id}
                  renderOption={level => level.label}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Add member</form.SubmitButton>
          </form.Actions>
          {savedMember && <Typography color="success.main">Added {savedMember}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
