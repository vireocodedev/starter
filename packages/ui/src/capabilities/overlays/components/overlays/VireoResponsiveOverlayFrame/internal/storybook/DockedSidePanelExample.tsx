import { VireoOverlayHeader, VireoResponsiveOverlayFrame } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import {
  VireoResponsiveOverlayFrameCustomerDetails,
  VireoResponsiveOverlayFrameWorkspace,
} from "@vireocodedev/ui/storybook/VireoResponsiveOverlayFrame";
import { useState } from "react";

export default function DockedSidePanelExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <VireoStorybookProvider>
      <VireoResponsiveOverlayFrameWorkspace onOpen={() => setOpen(true)}>
        <VireoResponsiveOverlayFrame
          open={open}
          onClose={close}
          desktopSurface="dockedSidePanel"
          desktopSidePanelWidth={420}
          desktopSidePanelMinContentWidth={360}
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
