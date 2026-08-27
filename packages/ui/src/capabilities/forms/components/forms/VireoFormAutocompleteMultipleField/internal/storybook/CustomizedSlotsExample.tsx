import { Avatar } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const teams = [
  { id: "platform", name: "Platform" },
  { id: "design", name: "Design" },
  { id: "ops", name: "Operations" },
];
export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { teams: ["platform", "design"] as string[] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Routing" variant="plain" layout="stack">
          <form.Field name="teams">
            {field => (
              <VireoLabelBox label="Teams">
                <field.AutocompleteMultipleField
                  label={null}
                  options={teams}
                  getOptionValue={team => team.id}
                  getOptionLabel={team => team.name}
                  renderOption={team => (
                    <>
                      <Avatar sx={{ width: 22, height: 22, mr: 1 }}>{team.name[0]}</Avatar>
                      {team.name}
                    </>
                  )}
                  slotProps={{
                    option: { sx: { display: "flex" } },
                    hiddenOptionsButton: { color: "secondary" },
                    htmlInput: { "aria-label": "Teams" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
