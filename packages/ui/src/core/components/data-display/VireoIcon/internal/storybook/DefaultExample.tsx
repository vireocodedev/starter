import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoIcon icon="check-circle" titleAccess="Completed" color="success" />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
