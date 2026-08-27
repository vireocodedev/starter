import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const regions = [
  { code: "eu", label: "Europe" },
  { code: "na", label: "North America" },
  { code: "apac", label: "Asia Pacific" },
  { code: "latam", label: "Latin America" },
  { code: "mea", label: "Middle East and Africa" },
] as const;

export default function CompactSummaryExample() {
  const form = useVireoForm({
    defaultValues: { regions: ["apac", "eu", "latam", "na"] as string[] },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Compact selection summary" variant="plain" layout="stack">
          <form.Field name="regions">
            {field => (
              <VireoLabelBox label="Service regions">
                <field.SelectMultipleField
                  label={null}
                  options={regions}
                  getOptionValue={region => region.code}
                  renderOption={region => region.label}
                  maxDisplayedOptions={2}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Service regions" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <Typography color="text.secondary" variant="body2">
            The closed field stays one line tall while the open menu shows every selected option.
          </Typography>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
