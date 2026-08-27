import { Button } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const currentResults = [
  { id: "maya", name: "Maya Chen" },
  { id: "sora", name: "Sora Tanaka" },
];
const fallback = { id: "niko", name: "Niko Barić" };
export default function AsyncAndUnresolvedSelectionsExample() {
  const [hydrated, setHydrated] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { memberIds: ["niko", "archived-4"] as string[] },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Project members" variant="plain" layout="stack">
          <form.Field name="memberIds">
            {field => (
              <VireoLabelBox label="Members">
                <field.AutocompleteMultipleField
                  label={null}
                  options={hydrated ? [fallback, ...currentResults] : currentResults}
                  selectedOptions={[fallback]}
                  getOptionValue={person => person.id}
                  getOptionLabel={person => person.name}
                  getUnresolvedValueLabel={value => `Archived user (${value})`}
                  slotProps={{ htmlInput: { "aria-label": "Members" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <Button onClick={() => setHydrated(value => !value)}>
            {hydrated ? "Remove hydrated result" : "Hydrate selected result"}
          </Button>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
