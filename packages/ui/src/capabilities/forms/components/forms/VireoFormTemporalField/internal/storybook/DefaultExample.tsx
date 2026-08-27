import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function DateModeExample() {
  const [savedValue, setSavedValue] = React.useState<string | null>();
  const form = useVireoForm({
    defaultValues: { birthday: "1994-05-16" as string | null },
    onSubmit: ({ value }) => setSavedValue(value.birthday),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Birthday" variant="plain" layout="stack">
          <form.Field name="birthday">
            {field => (
              <VireoLabelBox label="Birthday">
                <field.TemporalField mode="date" slotProps={{ htmlInput: { "aria-label": "Birthday" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save birthday</form.SubmitButton>
          </form.Actions>
          {savedValue !== undefined && <Typography color="success.main">Saved {savedValue ?? "empty"}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
