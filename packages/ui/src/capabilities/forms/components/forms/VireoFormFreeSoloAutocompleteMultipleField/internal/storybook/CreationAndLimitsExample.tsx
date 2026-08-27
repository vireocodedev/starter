import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function CreationAndLimitsExample() {
  const form = useVireoForm({
    defaultValues: { tags: ["frontend", "design-system", "documentation"] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release tags" variant="plain" layout="stack">
          <form.Field name="tags">
            {field => (
              <VireoLabelBox label="Tags">
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  options={["frontend", "backend", "design-system"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  normalizeValue={value => value.trim().toLowerCase()}
                  maxDisplayedOptions={2}
                  maxSelectedOptions={5}
                  createOptionLabel={value => (
                    <>
                      Create <strong>{value}</strong>
                    </>
                  )}
                  slotProps={{ htmlInput: { "aria-label": "Tags" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <Typography color="text.secondary">
            Up to five unique normalized tags; extra selections collapse behind the count.
          </Typography>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
