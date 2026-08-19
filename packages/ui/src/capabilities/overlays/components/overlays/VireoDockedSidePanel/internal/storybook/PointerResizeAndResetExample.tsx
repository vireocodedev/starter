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

export default function PointerResizeAndResetExample() {
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
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">Drag to resize; double-click to reset to 420px.</Typography>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
