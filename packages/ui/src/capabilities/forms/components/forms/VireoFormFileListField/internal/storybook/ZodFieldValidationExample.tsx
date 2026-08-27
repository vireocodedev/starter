import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
import { z } from "zod";

const supportingDocumentsSchema = z
  .custom<File[]>(value => Array.isArray(value) && value.every(file => file instanceof File))
  .refine(files => files.length >= 2, "Choose at least two supporting documents.")
  .refine(files => files.every(file => file.type === "application/pdf"), "Every document must be a PDF.");

export default function ZodFieldValidationExample() {
  const [savedCount, setSavedCount] = React.useState<number>();
  const form = useVireoForm({
    defaultValues: { documents: [] as File[] },
    onSubmit: ({ value }) => setSavedCount(value.documents.length),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Supporting documents" variant="plain" layout="stack">
          <form.Field name="documents" validators={{ onDynamic: supportingDocumentsSchema }}>
            {field => (
              <VireoLabelBox label="Documents" required>
                <field.FileListField
                  accept="application/pdf,.pdf"
                  required
                  slotProps={{ input: { "aria-label": "Supporting documents" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save documents</form.SubmitButton>
          </form.Actions>
          {savedCount !== undefined && <Typography color="success.main">Saved {savedCount} documents</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
