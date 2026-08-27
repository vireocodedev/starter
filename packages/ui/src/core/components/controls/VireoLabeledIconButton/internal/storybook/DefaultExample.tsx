import { VireoIconRegistryProvider, VireoLabeledIconButton, type VireoLabeledIconButtonProps } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample({ onClick }: Pick<VireoLabeledIconButtonProps, "onClick">) {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <VireoLabeledIconButton label="Approvals" icon="check-circle" onClick={onClick} />
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
