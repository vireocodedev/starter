import StarRounded from "@mui/icons-material/StarRounded";
import { Checkbox, Stack, type CheckboxProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const environments = [
  { id: "development", label: "Development" },
  { id: "staging", label: "Staging" },
  { id: "production", label: "Production" },
] as const;

const StarCheckbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function StarCheckbox(props, ref) {
  return <Checkbox {...props} ref={ref} checkedIcon={<StarRounded />} icon={<StarRounded color="disabled" />} />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { environments: ["development", "staging"] as string[] },
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 560 }}>
        <Stack spacing={2}>
          <form.Field name="environments">
            {field => (
              <VireoLabelBox label="Deployment environments">
                <field.SelectMultipleField
                  label={null}
                  options={environments}
                  getOptionValue={environment => environment.id}
                  renderOption={environment => environment.label}
                  renderSelectedOptions={({ selectedOptions }) =>
                    `${selectedOptions.length} environments · ${selectedOptions
                      .map(environment => environment.label)
                      .join(" / ")}`
                  }
                  slots={{ optionCheckbox: StarCheckbox }}
                  slotProps={{
                    optionCheckbox: { color: "warning" },
                    select: { SelectDisplayProps: { "aria-label": "Deployment environments" } },
                    selectionSummary: { color: "warning.main", fontWeight: 700 },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset environments</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
