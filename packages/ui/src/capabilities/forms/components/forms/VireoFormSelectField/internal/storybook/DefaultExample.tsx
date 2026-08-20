import { Stack, Typography } from "@mui/material";
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
      <form.Form sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
          <form.Field name="teamId">
            {field => (
              <field.SelectField
                label="Owning team"
                placeholder="Choose a team"
                options={teams}
                getOptionValue={team => team.id}
                renderOption={team => team.name}
              />
            )}
          </form.Field>
          <Stack direction="row" spacing={1}>
            <form.SubmitButton>Save assignment</form.SubmitButton>
            <form.ResetButton>Reset</form.ResetButton>
          </Stack>
          {savedTeam && <Typography color="success.main">Saved {savedTeam}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
