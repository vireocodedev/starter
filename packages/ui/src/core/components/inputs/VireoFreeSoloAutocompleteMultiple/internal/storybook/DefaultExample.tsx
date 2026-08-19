import { VireoFreeSoloAutocompleteMultiple } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
];
export default function DefaultExample() {
  const [value, setValue] = React.useState<string[] | null>([]);
  return (
    <VireoStorybookProvider>
      <VireoFreeSoloAutocompleteMultiple
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getStringValue={option => option.id}
        createSyntheticOption={text => ({ id: text, label: text })}
        addLabel={text => `Add “${text}”`}
        textFieldProps={{ label: "Teams or custom groups" }}
      />
    </VireoStorybookProvider>
  );
}
