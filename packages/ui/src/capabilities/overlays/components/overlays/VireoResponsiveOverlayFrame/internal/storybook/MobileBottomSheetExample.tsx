import { VireoOverlayHeader, VireoResponsiveOverlayFrame } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import {
  VireoResponsiveOverlayFrameCustomerDetails,
  VireoResponsiveOverlayFrameWorkspace,
} from "@vireocodedev/ui/storybook/VireoResponsiveOverlayFrame";
import { useState } from "react";

export default function MobileBottomSheetExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <VireoStorybookProvider>
      <VireoResponsiveOverlayFrameWorkspace onOpen={() => setOpen(true)}>
        <VireoResponsiveOverlayFrame
          aria-label="Customer details"
          open={open}
          onClose={close}
          mobileSurface="bottomDrawer"
          mobileMaxHeight="88dvh"
        >
          <VireoResponsiveOverlayFrameCustomerDetails
            header={<VireoOverlayHeader title="Customer details" closeLabel="Close customer details" onClose={close} />}
            onClose={close}
          />
        </VireoResponsiveOverlayFrame>
      </VireoResponsiveOverlayFrameWorkspace>
    </VireoStorybookProvider>
  );
}
