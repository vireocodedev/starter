import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoPasswordInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState("correct horse battery staple");
  return (
    <VireoStorybookProvider>
      <VireoPasswordInput label="Password" value={value} onChange={setValue} fullWidth />
    </VireoStorybookProvider>
  );
}
