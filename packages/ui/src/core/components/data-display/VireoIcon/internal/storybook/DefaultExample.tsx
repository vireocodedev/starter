import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoIcon icon="check-circle" titleAccess="Completed" color="success" />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
