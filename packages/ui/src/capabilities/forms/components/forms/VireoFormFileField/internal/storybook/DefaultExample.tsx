import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedFileName, setSavedFileName] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { attachment: null as File | null },
    onSubmit: ({ value }) => setSavedFileName(value.attachment?.name),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Support attachment" variant="plain" layout="stack">
          <form.Field name="attachment">
            {field => (
              <VireoLabelBox label="Attachment">
                <field.FileField
                  helperText="Choose one file to attach to the support request."
                  slotProps={{ input: { "aria-label": "Attachment" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save attachment</form.SubmitButton>
          </form.Actions>
          {savedFileName && <Typography color="success.main">Saved {savedFileName}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
