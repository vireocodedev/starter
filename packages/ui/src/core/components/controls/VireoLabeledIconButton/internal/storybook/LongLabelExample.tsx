import { VireoIconRegistryProvider, VireoLabeledIconButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function LongLabelExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoLabeledIconButton label="Workspace administration" icon="check-circle" title="Workspace administration" />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
