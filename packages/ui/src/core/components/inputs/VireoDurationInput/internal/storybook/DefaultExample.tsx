import { VireoDurationInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
export default function DefaultExample() {
  const [value, setValue] = React.useState<number | null>(90);
  return (
    <VireoStorybookProvider>
      <VireoDurationInput value={value} onChange={setValue} fieldProps={{ label: "Duration" }} />
    </VireoStorybookProvider>
  );
}
