import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const teams = [
  { id: "platform", name: "Platform" },
  { id: "product", name: "Product" },
  { id: "support", name: "Customer support" },
] as const;

export default function DefaultExample() {
  const [savedTeam, setSavedTeam] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { teamId: null as string | null },
    onSubmit: ({ value }) => setSavedTeam(value.teamId),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Assignment" variant="plain" layout="stack">
          <form.Field name="teamId">
            {field => (
              <VireoLabelBox label="Owning team">
                <field.SelectField
                  label={null}
                  placeholder="Choose a team"
                  options={teams}
                  getOptionValue={team => team.id}
                  renderOption={team => team.name}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Owning team" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save assignment</form.SubmitButton>
          </form.Actions>
          {savedTeam && <Typography color="success.main">Saved {savedTeam}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
