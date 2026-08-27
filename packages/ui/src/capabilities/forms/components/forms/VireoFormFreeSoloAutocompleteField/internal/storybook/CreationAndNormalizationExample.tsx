import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const suggestions = ["alpha", "beta", "stable"];
export default function CreationAndNormalizationExample() {
  const form = useVireoForm({ defaultValues: { channel: "stable" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release channel" variant="plain" layout="stack">
          <form.Field name="channel">
            {field => (
              <VireoLabelBox label="Channel">
                <field.FreeSoloAutocompleteField
                  label={null}
                  options={suggestions}
                  getOptionValue={option => option}
                  getOptionLabel={option => option}
                  normalizeValue={value => value.trim().toLowerCase()}
                  createOptionLabel={value => (
                    <>
                      Create <strong>{value}</strong>
                    </>
                  )}
                  slotProps={{ htmlInput: { "aria-label": "Channel" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <Typography color="text.secondary">Type a new value and press Enter, or click away to commit it.</Typography>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
