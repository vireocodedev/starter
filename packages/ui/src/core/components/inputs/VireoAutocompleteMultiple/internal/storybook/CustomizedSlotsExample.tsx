import { VireoAutocompleteMultiple } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: "ops", label: "Operations" },
  { id: "eng", label: "Engineering" },
  { id: "sales", label: "Sales" },
];
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<(typeof options)[number][]>([options[1]]);
  return (
    <VireoStorybookProvider>
      <VireoAutocompleteMultiple
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Department access", sx: { p: 2, border: 1, borderColor: "divider" } } }}
        textFieldProps={{ label: "Departments" }}
      />
    </VireoStorybookProvider>
  );
}
