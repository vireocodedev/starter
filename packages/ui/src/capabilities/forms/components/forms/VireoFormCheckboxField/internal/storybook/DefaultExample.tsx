import { Stack, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedPreference, setSavedPreference] = React.useState<boolean>();
  const form = useVireoForm({
    defaultValues: { includeArchived: false },
    onSubmit: ({ value }) => setSavedPreference(value.includeArchived),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="includeArchived">
            {field => (
              <field.CheckboxField
                helperText="Archived projects are excluded unless explicitly selected."
                label="Include archived projects"
              />
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save preference</form.SubmitButton>
          {savedPreference !== undefined && (
            <Typography color="success.main">Archived projects {savedPreference ? "included" : "excluded"}</Typography>
          )}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
