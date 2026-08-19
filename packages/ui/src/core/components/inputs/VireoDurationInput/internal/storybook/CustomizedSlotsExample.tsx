import { VireoDurationInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<number | null>(3665);
  return (
    <VireoStorybookProvider>
      <VireoDurationInput
        value={value}
        onChange={setValue}
        durationUnit="seconds"
        durationViews={["hours", "minutes", "seconds"]}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Processing duration", sx: { border: 1, borderColor: "divider", p: 2 } } }}
        fieldProps={{ label: "Duration (seconds)" }}
      />
    </VireoStorybookProvider>
  );
}
