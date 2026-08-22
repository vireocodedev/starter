import { Avatar } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const environments = [
  { id: "dev", name: "Development" },
  { id: "stage", name: "Staging" },
  { id: "prod", name: "Production" },
];
export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { environmentId: "dev" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Deployment" variant="plain" layout="stack">
          <form.Field name="environmentId">
            {field => (
              <VireoLabelBox label="Environment">
                <field.AutocompleteField
                  label={null}
                  options={environments}
                  getOptionValue={environment => environment.id}
                  getOptionLabel={environment => environment.name}
                  renderOption={environment => (
                    <>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{environment.name[0]}</Avatar>
                      {environment.name}
                    </>
                  )}
                  slotProps={{
                    root: { "data-analytics-field": "environment" },
                    option: { sx: { display: "flex" } },
                    htmlInput: { "aria-label": "Environment" },
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
