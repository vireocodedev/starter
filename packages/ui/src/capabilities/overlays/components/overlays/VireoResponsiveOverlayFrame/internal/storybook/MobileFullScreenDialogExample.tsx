import { VireoOverlayHeader, VireoResponsiveOverlayFrame } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import {
  VireoResponsiveOverlayFrameCustomerDetails,
  VireoResponsiveOverlayFrameWorkspace,
} from "@vireocodedev/starter-ui/storybook/VireoResponsiveOverlayFrame";
import { useState } from "react";

export default function MobileFullScreenDialogExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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
