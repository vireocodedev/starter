import { VireoSnack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoSnack message="Changes saved" />
    </VireoStorybookProvider>
  );
}
