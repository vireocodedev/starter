import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const inventorySchema = z.object({
  packages: z
    .number()
    .int("Choose a whole package quantity.")
    .min(1, "Choose a package quantity.")
    .nullable()
    .refine(value => value !== null, "Choose a package quantity."),
  reserve: z.number().int("Choose a whole reserve quantity.").min(2, "Reserve at least two units."),
});

export default function ZodFormValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { packages: null as number | null, reserve: 0 as number | null },
    onSubmit: () => setSaved(true),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: inventorySchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Inventory policy" variant="plain">
          <form.Field name="packages">
            {field => (
              <VireoLabelBox label="Packages" required>
                <field.CounterField aria-label="Packages" min={1} required />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="reserve">
            {field => (
              <VireoLabelBox label="Reserve units" required>
                <field.CounterField aria-label="Reserve units" min={0} required />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SectionItem span="full">
            <form.Actions>
              <form.SubmitButton variant="contained">Save inventory</form.SubmitButton>
            </form.Actions>
          </form.SectionItem>
          {saved && (
            <form.SectionItem span="full">
              <Typography color="success.main">Inventory policy saved.</Typography>
            </form.SectionItem>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
