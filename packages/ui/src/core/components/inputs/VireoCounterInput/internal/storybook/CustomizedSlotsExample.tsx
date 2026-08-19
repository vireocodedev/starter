import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoCounterInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState<number | null>(10);
  return (
    <VireoStorybookProvider>
      <VireoCounterInput
        label="Batch size"
        value={value}
        onChange={setValue}
        min={5}
        max={50}
        step={5}
        slotProps={{
          root: {
            helperText: "Changes in increments of five.",
            sx: { maxWidth: 280 },
          },
          decrementButton: { color: "secondary" },
          incrementButton: { color: "secondary" },
        }}
      />
    </VireoStorybookProvider>
  );
}
