import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const suggestions = ["Design", "Engineering", "Operations", "Research"].map(value => ({ value, label: value }));

export default function DefaultExample() {
  const [saved, setSaved] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { team: null as string | null },
    onSubmit: ({ value }) => setSaved(value.team),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Team assignment" variant="plain" layout="stack">
          <form.Field name="team">
            {field => (
              <VireoLabelBox label="Team">
                <field.FreeSoloAutocompleteField
                  label={null}
                  options={suggestions}
                  getOptionValue={option => option.value}
                  getOptionLabel={option => option.label}
                  placeholder="Choose or create a team"
                  slotProps={{ htmlInput: { "aria-label": "Team" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save team</form.SubmitButton>
          </form.Actions>
          {saved && <Typography color="success.main">Saved {saved}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
