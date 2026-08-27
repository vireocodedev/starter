import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [submittedEmail, setSubmittedEmail] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => setSubmittedEmail(value.email),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Profile" description="Contact details used for account notifications." layout="stack">
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
        </form.Section>
        <form.Actions>
          <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
        </form.Actions>
        {submittedEmail && <Typography color="success.main">Saved {submittedEmail}</Typography>}
      </form.Form>
    </VireoStorybookProvider>
  );
}
