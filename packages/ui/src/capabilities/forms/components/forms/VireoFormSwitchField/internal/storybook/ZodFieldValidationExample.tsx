import { Stack, Typography } from "@mui/material";
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
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="termsAccepted" validators={{ onDynamic: termsSchema }}>
            {field => <field.SwitchField label="I accept the terms" />}
          </form.Field>
          <form.SubmitButton variant="contained">Continue</form.SubmitButton>
          {saved && <Typography color="success.main">Terms accepted</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
