import { Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const inventorySchema = z.object({
  productName: z.string().trim().min(2, "Enter at least two characters."),
  units: z
    .number()
    .int("Enter a whole number.")
    .min(1, "Enter at least one unit.")
    .max(500, "Enter no more than 500 units.")
    .nullable()
    .refine(value => value !== null, "Enter the available units."),
});

export default function ZodFormValidationExample() {
  const [savedInventory, setSavedInventory] = React.useState<{
    productName: string;
    units: number | null;
  }>();
  const form = useVireoForm({
    defaultValues: { productName: "", units: null as number | null },
    onSubmit: ({ value }) => setSavedInventory(value),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: inventorySchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="productName">
            {field => (
              <VireoLabelBox label="Product name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Product name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="units">
            {field => (
              <VireoLabelBox label="Available units">
                <field.NumberField max={500} min={1} slotProps={{ htmlInput: { "aria-label": "Available units" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save inventory</form.SubmitButton>
          {savedInventory && (
            <Typography color="success.main">
              Saved {savedInventory.productName}: {savedInventory.units} units
            </Typography>
          )}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
