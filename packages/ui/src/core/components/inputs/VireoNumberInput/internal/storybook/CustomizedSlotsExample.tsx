import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { InputAdornment } from "@mui/material";
import { VireoNumberInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState<number | null>(1250);
  return (
    <VireoStorybookProvider>
      <VireoNumberInput
        label="Monthly budget"
        value={value}
        onChange={setValue}
        min={0}
        slotProps={{
          root: {
            slotProps: { input: { startAdornment: <InputAdornment position="start">€</InputAdornment> } },
            sx: { maxWidth: 320 },
          },
        }}
      />
    </VireoStorybookProvider>
  );
}
