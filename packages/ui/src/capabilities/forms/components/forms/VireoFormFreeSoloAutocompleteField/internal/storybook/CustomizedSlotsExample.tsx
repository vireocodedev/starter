import { Avatar } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const environments = ["Development", "Staging", "Production"];
export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { environment: "Development" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Deployment" variant="plain" layout="stack">
          <form.Field name="environment">
            {field => (
              <VireoLabelBox label="Environment">
                <field.FreeSoloAutocompleteField
                  label={null}
                  options={environments}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  renderOption={value => (
                    <>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{value[0]}</Avatar>
                      {value}
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
