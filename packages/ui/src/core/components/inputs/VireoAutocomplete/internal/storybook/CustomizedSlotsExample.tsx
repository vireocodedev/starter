import { VireoAutocomplete } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: "hr", label: "Human resources" },
  { id: "eng", label: "Engineering" },
];
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<(typeof options)[number] | null>(options[1]);
  return (
    <VireoStorybookProvider>
      <VireoAutocomplete
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Department picker", sx: { p: 2, border: 1, borderColor: "divider" } } }}
        textFieldProps={{ label: "Department" }}
      />
    </VireoStorybookProvider>
  );
}
