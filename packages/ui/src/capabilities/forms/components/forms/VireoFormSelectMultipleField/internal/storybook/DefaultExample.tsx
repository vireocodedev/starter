import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const teams = [
  { id: "platform", name: "Platform" },
  { id: "product", name: "Product" },
  { id: "support", name: "Customer support" },
  { id: "design", name: "Design systems" },
] as const;

export default function DefaultExample() {
  const [savedTeams, setSavedTeams] = React.useState<string[]>([]);
  const form = useVireoForm({
    defaultValues: { teamIds: [] as string[] },
    onSubmit: ({ value }) => setSavedTeams(value.teamIds),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Team access" variant="plain" layout="stack">
          <form.Field name="teamIds">
            {field => (
              <VireoLabelBox label="Collaborating teams">
                <field.SelectMultipleField
                  label={null}
                  placeholder="Choose teams"
                  options={teams}
                  getOptionValue={team => team.id}
                  renderOption={team => team.name}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Collaborating teams" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton>Reset</form.ResetButton>
            <form.SubmitButton variant="contained">Save teams</form.SubmitButton>
          </form.Actions>
          {savedTeams.length > 0 && <Typography color="success.main">Saved {savedTeams.join(", ")}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
