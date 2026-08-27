import { Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedPreference, setSavedPreference] = React.useState<boolean>();
  const form = useVireoForm({
    defaultValues: { includeArchived: false },
    onSubmit: ({ value }) => setSavedPreference(value.includeArchived),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Checkbox example" variant="plain" layout="stack">
          <form.Field name="includeArchived">
            {field => (
              <field.CheckboxField
                helperText="Archived projects are excluded unless explicitly selected."
                label="Include archived projects"
              />
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save preference</form.SubmitButton>
          </form.Actions>
          {savedPreference !== undefined && (
            <Typography color="success.main">Archived projects {savedPreference ? "included" : "excluded"}</Typography>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
