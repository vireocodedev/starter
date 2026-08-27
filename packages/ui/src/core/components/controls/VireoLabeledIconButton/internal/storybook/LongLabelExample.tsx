import { VireoIconRegistryProvider, VireoLabeledIconButton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function LongLabelExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoLabeledIconButton label="Workspace administration" icon="check-circle" title="Workspace administration" />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
