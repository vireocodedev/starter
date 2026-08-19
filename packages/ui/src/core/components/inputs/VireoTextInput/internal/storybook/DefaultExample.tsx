import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoTextInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState("Northstar Analytics");
  return (
    <VireoStorybookProvider>
      <VireoTextInput label="Customer name" value={value} onChange={setValue} fullWidth />
    </VireoStorybookProvider>
  );
}
