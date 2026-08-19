import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoSwitchInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState(true);
  return (
    <VireoStorybookProvider>
      <VireoSwitchInput label="Email notifications" value={value} onChange={setValue} />
    </VireoStorybookProvider>
  );
}
