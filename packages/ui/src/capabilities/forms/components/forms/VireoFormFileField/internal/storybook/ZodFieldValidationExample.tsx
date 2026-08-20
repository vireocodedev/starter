import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const requiredPdfSchema = z
  .custom<File | null>(value => value === null || value instanceof File)
  .refine((file): file is File => file !== null, "Choose a PDF contract.")
  .refine(file => file?.type === "application/pdf", "The contract must be a PDF.");

export default function ZodFieldValidationExample() {
  const [savedFileName, setSavedFileName] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { contract: null as File | null },
    onSubmit: ({ value }) => setSavedFileName(value.contract?.name),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Contract" variant="plain" layout="stack">
          <form.Field name="contract" validators={{ onDynamic: requiredPdfSchema }}>
            {field => (
              <VireoLabelBox label="Signed contract" required>
                <field.FileField
                  accept="application/pdf,.pdf"
                  required
                  slotProps={{ input: { "aria-label": "Signed contract" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save contract</form.SubmitButton>
          </form.Actions>
          {savedFileName && <Typography color="success.main">Saved {savedFileName}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
