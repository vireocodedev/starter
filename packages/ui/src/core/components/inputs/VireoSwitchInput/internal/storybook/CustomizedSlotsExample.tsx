import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoSwitchInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState(false);
  return (
    <VireoStorybookProvider>
      <VireoSwitchInput
        label="Maintenance mode"
        helperText="Temporarily prevents customer sign-in."
        value={value}
        onChange={setValue}
        slotProps={{
          root: {
            sx: { border: 1, borderColor: "divider", borderRadius: 2, p: 2 },
          },
          control: { color: "warning" },
        }}
      />
    </VireoStorybookProvider>
  );
}
