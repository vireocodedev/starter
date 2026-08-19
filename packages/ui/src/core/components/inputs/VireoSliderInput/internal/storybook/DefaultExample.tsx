import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoSliderInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState<number | null>(65);
  return (
    <VireoStorybookProvider>
      <VireoSliderInput
        aria-label="Completion threshold"
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        step={5}
        helperText="Percentage required before completion."
      />
    </VireoStorybookProvider>
  );
}
