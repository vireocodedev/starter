import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least two characters."),
  email: z.string().trim().min(1, "Enter an email address.").email("Enter a valid email address."),
});

export default function ZodFormValidationExample() {
  const [savedProfile, setSavedProfile] = React.useState<z.infer<typeof profileSchema>>();
  const form = useVireoForm({
    defaultValues: { displayName: "", email: "" },
    onSubmit: ({ value }) => setSavedProfile(value),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Profile" variant="plain">
          <form.Field name="displayName">
            {field => (
              <VireoLabelBox label="Display name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Display name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="email">
            {field => (
              <VireoLabelBox label="Email">
                <field.TextField
                  autoComplete="email"
                  placeholder="developer@example.com"
                  slotProps={{ htmlInput: { "aria-label": "Email" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SectionItem span="full">
            <form.Actions>
              <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
            </form.Actions>
          </form.SectionItem>
          {savedProfile && (
            <form.SectionItem span="full">
              <Typography color="success.main">
                Saved {savedProfile.displayName} ({savedProfile.email})
              </Typography>
            </form.SectionItem>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
