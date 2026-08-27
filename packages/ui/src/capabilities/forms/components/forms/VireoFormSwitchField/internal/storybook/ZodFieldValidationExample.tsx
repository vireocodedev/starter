import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
import { z } from "zod";

const termsSchema = z.boolean().refine(value => value, "Accept the terms to continue.");

export default function ZodFieldValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { termsAccepted: false },
    onSubmit: () => setSaved(true),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Switch example" variant="plain" layout="stack">
          <form.Field name="termsAccepted" validators={{ onDynamic: termsSchema }}>
            {field => <field.SwitchField label="I accept the terms" />}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Continue</form.SubmitButton>
          </form.Actions>
          {saved && <Typography color="success.main">Terms accepted</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
