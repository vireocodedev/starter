import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [submittedEmail, setSubmittedEmail] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => setSubmittedEmail(value.email),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => (value.includes("@") ? undefined : "Enter a valid email address."),
            }}
          >
            {field => (
              <VireoLabelBox label="Email">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
          {submittedEmail && <Typography>Saved {submittedEmail}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
