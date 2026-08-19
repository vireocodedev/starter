import { VireoDateTimeInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
export default function DefaultExample() {
  const [value, setValue] = React.useState<number | null>(null);
  return (
    <VireoStorybookProvider>
      <VireoDateTimeInput value={value} onChange={setValue} pickerProps={{ label: "Scheduled for" }} />
    </VireoStorybookProvider>
  );
}
