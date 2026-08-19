import { VireoIconRegistryProvider, VireoLabeledIconButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoLabeledIconButton label="Approved" icon="check-circle" onClick={() => undefined} />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
