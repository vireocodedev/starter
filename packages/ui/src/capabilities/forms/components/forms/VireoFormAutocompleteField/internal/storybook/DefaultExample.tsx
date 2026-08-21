import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const people = [
  { id: "maya", name: "Maya Chen", team: "Platform" },
  { id: "niko", name: "Niko Barić", team: "Design" },
  { id: "sora", name: "Sora Tanaka", team: "Operations" },
] as const;

export default function DefaultExample() {
  const [saved, setSaved] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { assigneeId: null as string | null },
    onSubmit: ({ value }) => setSaved(value.assigneeId),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Task ownership" variant="plain" layout="stack">
          <form.Field name="assigneeId">
            {field => (
              <VireoLabelBox label="Assignee">
                <field.AutocompleteField
                  label={null}
                  options={people}
                  getOptionValue={person => person.id}
                  getOptionLabel={person => person.name}
                  renderOption={person => `${person.name} · ${person.team}`}
                  placeholder="Search people"
                  slotProps={{ htmlInput: { "aria-label": "Assignee" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save assignment</form.SubmitButton>
          </form.Actions>
          {saved && <Typography color="success.main">Assigned to {saved}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
