import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoCounterInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

export default function DefaultExample() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <VireoStorybookProvider>
      <VireoCounterInput label="Seats" value={value} onChange={setValue} min={1} max={10} />
    </VireoStorybookProvider>
  );
}
