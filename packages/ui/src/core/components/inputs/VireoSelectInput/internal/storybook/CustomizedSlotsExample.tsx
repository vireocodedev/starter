import { VireoSelectInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: 1, label: "Standard" },
  { id: 2, label: "Priority" },
];
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<number | null>(1);
  return (
    <VireoStorybookProvider>
      <VireoSelectInput
        value={value}
        onChange={setValue}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        label="Queue"
        slots={{ root: "section" }}
        slotProps={{
          root: { "aria-label": "Queue selection", sx: { p: 2, border: 1, borderColor: "divider" } },
          option: { dense: true },
        }}
      />
    </VireoStorybookProvider>
  );
}
