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

export default function ActiveResizeFeedbackExample() {
  const resize = useSidePanelResize({ enabled: true, initialWidth: 420, minWidth: 280, maxWidth: 620 });

  return (
    <VireoStorybookProvider>
      <VireoDockedSidePanelWorkspaceFrame>
        <VireoDockedSidePanel
          ref={resize.rootRef}
          open
          isResizing
          width={`var(${SIDE_PANEL_WIDTH_CSS_VAR})`}
          minWidth={280}
          maxWidth={620}
          style={{ [SIDE_PANEL_WIDTH_CSS_VAR]: `${resize.width}px` } as CSSProperties}
          resizeHandle={
            <VireoSidePanelResizeHandle
              isResizing
              onResizeStart={resize.onResizeStart}
              onResizeKeyDown={resize.onResizeKeyDown}
              onResizeDoubleClick={resize.onResizeDoubleClick}
              valueMin={280}
              valueMax={620}
              valueNow={resize.width}
            />
          }
        >
          <VireoOverlayHeader title="Invoice details" actions={<Chip label="Active resize" size="small" />} />
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">The panel and handle expose their active resize feedback.</Typography>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
