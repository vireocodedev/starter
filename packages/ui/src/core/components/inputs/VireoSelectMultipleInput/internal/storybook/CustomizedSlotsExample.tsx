import { VireoSelectMultipleInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: 1, label: "Email" },
  { id: 2, label: "SMS" },
  { id: 3, label: "Push" },
];
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<number[]>([1, 3]);
  return (
    <VireoStorybookProvider>
      <VireoSelectMultipleInput
        value={value}
        onChange={setValue}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        label="Channels"
        slots={{ root: "section" }}
        slotProps={{
          root: { "aria-label": "Notification channels", sx: { p: 2, border: 1, borderColor: "divider" } },
          option: { dense: true },
        }}
      />
    </VireoStorybookProvider>
  );
}
