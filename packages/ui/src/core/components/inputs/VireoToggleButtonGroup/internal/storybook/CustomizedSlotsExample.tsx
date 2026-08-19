import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoToggleButtonGroup } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [value, setValue] = useState<string[]>(["email", "push"]);
  return (
    <VireoStorybookProvider>
      <VireoToggleButtonGroup
        multiple
        options={["email", "push", "sms"]}
        renderOption={option => option.toUpperCase()}
        renderKey={option => option}
        value={value}
        onChange={setValue}
        helperText="Choose every channel customers may use."
        slotProps={{
          root: {
            sx: { border: 1, borderColor: "divider", borderRadius: 2, p: 2 },
          },
          option: { size: "small", sx: { textTransform: "none" } },
        }}
      />
    </VireoStorybookProvider>
  );
}
