import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
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
      <form.Form>
        <form.Section label="Amount" variant="plain" layout="stack">
          <form.Field
            name="amount"
            validators={{ onDynamic: ({ value }) => (value === null ? "Enter an amount." : undefined) }}
          >
            {field => (
              <VireoLabelBox label="Amount">
                <field.NumberField
                  helperText="Decimal commas are normalized; values stay between 0 and 1,000."
                  max={1000}
                  min={0}
                  placeholder="125.50"
                  slotProps={{ htmlInput: { "aria-label": "Amount" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save amount</form.SubmitButton>
          </form.Actions>
          {savedAmount !== undefined && (
            <Typography color="success.main">Saved {savedAmount ?? "an empty value"}</Typography>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
