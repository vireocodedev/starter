import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const applicationSchema = z.object({
  applicantName: z.string().trim().min(2, "Enter the applicant name."),
  portfolio: z
    .custom<File | null>(value => value === null || value instanceof File)
    .refine((file): file is File => file !== null, "Choose a portfolio file."),
});

export default function ZodFormValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { applicantName: "", portfolio: null as File | null },
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
          <form.Field name="portfolio">
            {field => (
              <VireoLabelBox label="Portfolio" required>
                <field.FileField required slotProps={{ input: { "aria-label": "Portfolio" } }} />
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
