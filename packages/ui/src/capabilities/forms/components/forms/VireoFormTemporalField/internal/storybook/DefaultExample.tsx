import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DateModeExample() {
  const [savedValue, setSavedValue] = React.useState<string | null>();
  const form = useVireoForm({
    defaultValues: { birthday: "1994-05-16" as string | null },
    onSubmit: ({ value }) => setSavedValue(value.birthday),
  });
  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="birthday">
            {field => (
              <VireoLabelBox label="Birthday">
                <field.TemporalField mode="date" slotProps={{ htmlInput: { "aria-label": "Birthday" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save birthday</form.SubmitButton>
          {savedValue !== undefined && <Typography color="success.main">Saved {savedValue ?? "empty"}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
