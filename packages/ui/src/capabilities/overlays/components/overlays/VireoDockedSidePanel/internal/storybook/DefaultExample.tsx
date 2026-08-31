import {
  SIDE_PANEL_WIDTH_CSS_VAR,
  VireoDockedSidePanel,
  VireoOverlayHeader,
  VireoSidePanelResizeHandle,
  useSidePanelResize,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/ui/storybook/VireoDockedSidePanel";
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
              onResizeKeyDown={resize.onResizeKeyDown}
              onResizeDoubleClick={resize.onResizeDoubleClick}
              valueMin={280}
              valueMax={620}
              valueNow={resize.width}
            />
          }
        >
          <VireoOverlayHeader
            title="Invoice details"
            actions={<Chip label={`${resize.width}px wide`} size="small" />}
          />
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
            <Typography component="h3" variant="h5">
              Northstar Analytics
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Drag the panel edge or focus it and use the arrow keys to resize. Double-click restores its initial width.
            </Typography>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
