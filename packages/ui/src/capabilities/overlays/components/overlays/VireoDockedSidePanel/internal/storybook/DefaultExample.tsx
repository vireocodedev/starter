import {
  SIDE_PANEL_WIDTH_CSS_VAR,
  VireoDockedSidePanel,
  VireoOverlayHeader,
  VireoSidePanelResizeHandle,
  useSidePanelResize,
} from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/starter-ui/storybook/VireoDockedSidePanel";
import { Box, Chip, Typography } from "@mui/material";
import type { CSSProperties } from "react";

export default function DefaultExample() {
  const resize = useSidePanelResize({ enabled: true, initialWidth: 420, minWidth: 280, maxWidth: 620 });

  return (
    <VireoStorybookProvider>
      <VireoDockedSidePanelWorkspaceFrame>
        <VireoDockedSidePanel
          ref={resize.rootRef}
          open
          width={`var(${SIDE_PANEL_WIDTH_CSS_VAR})`}
          minWidth={280}
          maxWidth={620}
          isResizing={resize.isResizing}
          style={{ [SIDE_PANEL_WIDTH_CSS_VAR]: `${resize.width}px` } as CSSProperties}
          resizeHandle={
            <VireoSidePanelResizeHandle
              isResizing={resize.isResizing}
              onResizeStart={resize.onResizeStart}
              onResizeDoubleClick={resize.onResizeDoubleClick}
            />
          }
        >
          <VireoOverlayHeader
            title="Invoice details"
            actions={<Chip label={`${resize.width}px wide`} size="small" />}
          />
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
            <Typography variant="h5">Northstar Analytics</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Drag the panel edge to resize it. Double-click the handle to restore its initial width.
            </Typography>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
