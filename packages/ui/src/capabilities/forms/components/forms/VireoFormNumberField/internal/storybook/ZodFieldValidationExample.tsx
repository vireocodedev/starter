import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
import { z } from "zod";

const quantitySchema = z
  .number()
  .int("Enter a whole number.")
  .min(1, "Enter at least one item.")
  .max(100, "Enter no more than 100 items.")
  .nullable()
  .refine(value => value !== null, "Enter a quantity.");

export default function ZodFieldValidationExample() {
  const [savedQuantity, setSavedQuantity] = React.useState<number | null>();
  const form = useVireoForm({
    defaultValues: { quantity: null as number | null },
    onSubmit: ({ value }) => setSavedQuantity(value.quantity),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Quantity" variant="plain" layout="stack">
          <form.Field name="quantity" validators={{ onDynamic: quantitySchema }}>
            {field => (
              <VireoLabelBox label="Quantity">
                <field.NumberField
                  max={100}
                  min={1}
                  placeholder="12"
                  slotProps={{ htmlInput: { "aria-label": "Quantity" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save quantity</form.SubmitButton>
          </form.Actions>
          {savedQuantity !== undefined && <Typography color="success.main">Saved quantity: {savedQuantity}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
