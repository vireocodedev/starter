import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoTextInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState("");
  return (
    <VireoStorybookProvider>
      <VireoTextInput
        label="Workspace slug"
        value={value}
        onChange={setValue}
        helperText="Lowercase letters and hyphens work best."
        slotProps={{
          root: {
            inputProps: { "aria-label": "Workspace slug" },
            sx: { maxWidth: 420 },
          },
        }}
      />
    </VireoStorybookProvider>
  );
}
