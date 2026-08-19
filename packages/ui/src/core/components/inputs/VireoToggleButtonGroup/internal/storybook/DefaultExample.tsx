import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoToggleButtonGroup } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState<string | null>("weekly");
  return (
    <VireoStorybookProvider>
      <VireoToggleButtonGroup
        options={["daily", "weekly", "monthly"]}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
      />
    </VireoStorybookProvider>
  );
}
