import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { LockOpenRounded, LockRounded } from "@mui/icons-material";
import { VireoPasswordInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState("api-token");
  return (
    <VireoStorybookProvider>
      <VireoPasswordInput
        label="API token"
        value={value}
        onChange={setValue}
        visibilityIcon={<LockRounded />}
        visibilityOffIcon={<LockOpenRounded />}
        slotProps={{
          root: {
            helperText: "Reveal only when nobody else can see your screen.",
            sx: { maxWidth: 420 },
          },
          visibilityButton: { color: "primary" },
        }}
      />
    </VireoStorybookProvider>
  );
}
