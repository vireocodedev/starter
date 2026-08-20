import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const applicationSchema = z.object({
  applicantName: z.string().trim().min(2, "Enter the applicant name."),
  documents: z
    .custom<File[]>(value => Array.isArray(value) && value.every(file => file instanceof File))
    .refine(files => files.length >= 2, "Choose at least two supporting documents."),
});

export default function ZodFormValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { applicantName: "", documents: [] as File[] },
    onSubmit: () => setSaved(true),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: applicationSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Application" variant="plain">
          <form.Field name="applicantName">
            {field => (
              <VireoLabelBox label="Applicant name" required>
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Applicant name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="documents">
            {field => (
              <VireoLabelBox label="Supporting documents" required>
                <field.FileListField required slotProps={{ input: { "aria-label": "Supporting documents" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SectionItem span="full">
            <form.Actions>
              <form.SubmitButton variant="contained">Save application</form.SubmitButton>
            </form.Actions>
          </form.SectionItem>
          {saved && (
            <form.SectionItem span="full">
              <Typography color="success.main">The complete application passed one Zod object schema.</Typography>
            </form.SectionItem>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
