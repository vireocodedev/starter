import { VireoAutocomplete } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: 1, label: "Northstar Analytics" },
  { id: 2, label: "Harbor Systems" },
  { id: 3, label: "Atlas Studio" },
];
export default function DefaultExample() {
  const [value, setValue] = React.useState<(typeof options)[number] | null>(null);
  return (
    <VireoStorybookProvider>
      <VireoAutocomplete
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        textFieldProps={{ label: "Customer" }}
      />
    </VireoStorybookProvider>
  );
}
