import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const emailSchema = z.string().trim().min(1, "Enter an email address.").email("Enter a valid email address.");

export default function ZodFieldValidationExample() {
  const [savedEmail, setSavedEmail] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => setSavedEmail(value.email),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Email" variant="plain" layout="stack">
          <form.Field name="email" validators={{ onDynamic: emailSchema }}>
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
          <form.Actions>
            <form.SubmitButton variant="contained">Save email</form.SubmitButton>
          </form.Actions>
          {savedEmail && <Typography color="success.main">Saved {savedEmail}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
