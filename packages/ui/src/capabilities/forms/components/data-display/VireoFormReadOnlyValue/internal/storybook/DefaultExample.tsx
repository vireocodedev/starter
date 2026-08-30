import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { VireoFormReadOnlyValue } from "@vireocodedev/ui/forms";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormReadOnlyValue label="Account owner">Ada Lovelace</VireoFormReadOnlyValue>
    </VireoStorybookProvider>
  );
}
