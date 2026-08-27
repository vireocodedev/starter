import {
  VireoOverlayHeader,
  VireoResponsiveOverlayFrame,
  type VireoResponsiveOverlayFrameProps,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import {
  VireoResponsiveOverlayFrameCustomerDetails,
  VireoResponsiveOverlayFrameWorkspace,
} from "@vireocodedev/ui/storybook/VireoResponsiveOverlayFrame";
import { useState } from "react";

export default function DefaultExample({ onClose }: Pick<VireoResponsiveOverlayFrameProps, "onClose">) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose();
  };

  return (
    <VireoStorybookProvider>
      <VireoResponsiveOverlayFrameWorkspace onOpen={() => setOpen(true)}>
        <VireoResponsiveOverlayFrame open={open} onClose={close}>
          <VireoResponsiveOverlayFrameCustomerDetails
            header={<VireoOverlayHeader title="Customer details" closeLabel="Close customer details" onClose={close} />}
            onClose={close}
          />
        </VireoResponsiveOverlayFrame>
      </VireoResponsiveOverlayFrameWorkspace>
    </VireoStorybookProvider>
  );
}
