import { VireoOverlayHeader, VireoResponsiveOverlayFrame } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import {
  VireoResponsiveOverlayFrameCustomerDetails,
  VireoResponsiveOverlayFrameWorkspace,
} from "@vireocodedev/starter-ui/storybook/VireoResponsiveOverlayFrame";
import { ThemeProvider, createTheme } from "@mui/material";
import { useState } from "react";

const theme = createTheme({
  palette: { primary: { main: "#a78bfa" } },
  components: {
    VireoResponsiveOverlayFrame: {
      defaultProps: {
        desktopSurface: "overlaySidePanel",
        desktopSidePanelWidth: 460,
        desktopSidePanelSx: { borderLeft: "3px solid #a78bfa" },
      },
    },
  },
});

export default function ThemeCustomizationExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={outerTheme => createTheme(outerTheme, theme)}>
        <VireoResponsiveOverlayFrameWorkspace onOpen={() => setOpen(true)}>
          <VireoResponsiveOverlayFrame open={open} onClose={close}>
            <VireoResponsiveOverlayFrameCustomerDetails
              header={
                <VireoOverlayHeader title="Customer details" closeLabel="Close customer details" onClose={close} />
              }
              onClose={close}
            />
          </VireoResponsiveOverlayFrame>
        </VireoResponsiveOverlayFrameWorkspace>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
