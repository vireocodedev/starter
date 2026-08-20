import { Stack, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedPreference, setSavedPreference] = React.useState<boolean>();
  const form = useVireoForm({
    defaultValues: { notificationsEnabled: false },
    onSubmit: ({ value }) => setSavedPreference(value.notificationsEnabled),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="notificationsEnabled">
            {field => (
              <field.SwitchField
                helperText="Controls product and account update notifications."
                label="Enable notifications"
              />
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save preference</form.SubmitButton>
          {savedPreference !== undefined && (
            <Typography color="success.main">Notifications {savedPreference ? "enabled" : "disabled"}</Typography>
          )}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
