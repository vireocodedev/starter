import { VireoStopwatch } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoStopwatch />
    </VireoStorybookProvider>
  );
}
