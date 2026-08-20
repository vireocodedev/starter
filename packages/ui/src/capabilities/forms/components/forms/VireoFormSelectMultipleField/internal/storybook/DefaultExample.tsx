import { Stack, Typography } from "@mui/material";
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
      <form.Form sx={{ maxWidth: 560 }}>
        <Stack spacing={2}>
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
          <Stack direction="row" spacing={1}>
            <form.SubmitButton variant="contained">Save teams</form.SubmitButton>
            <form.ResetButton>Reset</form.ResetButton>
          </Stack>
          {savedTeams.length > 0 && <Typography color="success.main">Saved {savedTeams.join(", ")}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
