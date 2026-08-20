import { Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least two characters."),
  productUpdates: z.boolean().refine(value => value, "Enable product updates."),
});

export default function ZodFormValidationExample() {
  const [savedProfile, setSavedProfile] = React.useState<z.infer<typeof profileSchema>>();
  const form = useVireoForm({
    defaultValues: { displayName: "", productUpdates: false },
    onSubmit: ({ value }) => setSavedProfile(value),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: profileSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="displayName">{field => <field.TextField label="Display name" />}</form.Field>
          <form.Field name="productUpdates">
            {field => <field.SwitchField label="Receive product updates" />}
          </form.Field>
          <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
          {savedProfile && (
            <Typography color="success.main">Saved {savedProfile.displayName} with product updates enabled</Typography>
          )}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
