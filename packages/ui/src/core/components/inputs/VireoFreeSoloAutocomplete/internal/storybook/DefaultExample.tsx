import { VireoFreeSoloAutocomplete } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
];
export default function DefaultExample() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <VireoStorybookProvider>
      <VireoFreeSoloAutocomplete
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getStringValue={option => option.id}
        createSyntheticOption={text => ({ id: text, label: text })}
        addLabel={text => `Add “${text}”`}
        textFieldProps={{ label: "Team or custom group" }}
      />
    </VireoStorybookProvider>
  );
}
