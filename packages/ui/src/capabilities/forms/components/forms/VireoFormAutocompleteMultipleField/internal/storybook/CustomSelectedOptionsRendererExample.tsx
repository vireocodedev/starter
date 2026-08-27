import { Badge, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const labels = [
  { id: "bug", name: "Bug" },
  { id: "urgent", name: "Urgent" },
  { id: "customer", name: "Customer" },
];
export default function CustomSelectedOptionsRendererExample() {
  const form = useVireoForm({ defaultValues: { labels: ["bug", "urgent"] as string[] }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Issue" variant="plain" layout="stack">
          <form.Field name="labels">
            {field => (
              <VireoLabelBox label="Labels">
                <field.AutocompleteMultipleField
                  label={null}
                  options={labels}
                  getOptionValue={label => label.id}
                  getOptionLabel={label => label.name}
                  renderSelectedOptions={({ selections }) => (
                    <Badge badgeContent={selections.length} color="secondary">
                      <Typography sx={{ px: 1 }}>{selections.map(item => item.label).join(" · ")}</Typography>
                    </Badge>
                  )}
                  slotProps={{ htmlInput: { "aria-label": "Labels" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
