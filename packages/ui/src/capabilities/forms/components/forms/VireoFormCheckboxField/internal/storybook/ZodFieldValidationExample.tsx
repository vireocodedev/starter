import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
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
        <form.Section label="Checkbox example" variant="plain" layout="stack">
          <form.Field name="termsAccepted" validators={{ onDynamic: termsSchema }}>
            {field => <field.CheckboxField label="I accept the terms" />}
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
