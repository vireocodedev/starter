import { VireoDateTimeInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<number | null>(Date.UTC(2026, 7, 19, 14, 30));
  return (
    <VireoStorybookProvider>
      <VireoDateTimeInput
        value={value}
        onChange={setValue}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Deployment schedule", sx: { border: 1, borderColor: "divider", p: 2 } } }}
        pickerProps={{ label: "Deploy at" }}
      />
    </VireoStorybookProvider>
  );
}
