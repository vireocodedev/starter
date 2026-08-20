import { Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedAmount, setSavedAmount] = React.useState<number | null>();
  const form = useVireoForm({
    defaultValues: { amount: null as number | null },
    onSubmit: ({ value }) => setSavedAmount(value.amount),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field
            name="amount"
            validators={{ onDynamic: ({ value }) => (value === null ? "Enter an amount." : undefined) }}
          >
            {field => (
              <field.NumberField
                helperText="Decimal commas are normalized; values stay between 0 and 1,000."
                label="Amount"
                max={1000}
                min={0}
                placeholder="125.50"
              />
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save amount</form.SubmitButton>
          {savedAmount !== undefined && (
            <Typography color="success.main">Saved {savedAmount ?? "an empty value"}</Typography>
          )}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
