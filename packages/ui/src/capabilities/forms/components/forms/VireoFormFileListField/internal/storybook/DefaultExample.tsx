import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedCount, setSavedCount] = React.useState<number>();
  const form = useVireoForm({
    defaultValues: { attachments: [] as File[] },
    onSubmit: ({ value }) => setSavedCount(value.attachments.length),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Support attachments" variant="plain" layout="stack">
          <form.Field name="attachments">
            {field => (
              <VireoLabelBox label="Attachments">
                <field.FileListField
                  helperText="Choose one or more files to attach to the support request."
                  slotProps={{ input: { "aria-label": "Attachments" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save attachments</form.SubmitButton>
            <form.ResetButton>Reset</form.ResetButton>
          </form.Actions>
          {savedCount !== undefined && <Typography color="success.main">Saved {savedCount} files</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
