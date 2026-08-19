import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoNumberInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState<number | null>(18.5);
  return (
    <VireoStorybookProvider>
      <VireoNumberInput label="Hourly rate" value={value} onChange={setValue} min={0} max={100} />
    </VireoStorybookProvider>
  );
}
