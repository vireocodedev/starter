import { Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedPreference, setSavedPreference] = React.useState<boolean>();
  const form = useVireoForm({
    defaultValues: { notificationsEnabled: false },
    onSubmit: ({ value }) => setSavedPreference(value.notificationsEnabled),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Switch example" variant="plain" layout="stack">
          <form.Field name="notificationsEnabled">
            {field => (
              <field.SwitchField
                helperText="Controls product and account update notifications."
                label="Enable notifications"
              />
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save preference</form.SubmitButton>
          </form.Actions>
          {savedPreference !== undefined && (
            <Typography color="success.main">Notifications {savedPreference ? "enabled" : "disabled"}</Typography>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
