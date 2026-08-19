import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VolumeUpRounded } from "@mui/icons-material";
import { VireoSliderInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState<number | null>(40);
  return (
    <VireoStorybookProvider>
      <VireoSliderInput
        aria-label="Volume"
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        step={1}
        sliderInputIcon={<VolumeUpRounded />}
        numberInputIcon="%"
        slotProps={{
          root: {
            sx: { border: 1, borderColor: "divider", borderRadius: 2, p: 2 },
          },
          slider: { color: "secondary" },
        }}
      />
    </VireoStorybookProvider>
  );
}
