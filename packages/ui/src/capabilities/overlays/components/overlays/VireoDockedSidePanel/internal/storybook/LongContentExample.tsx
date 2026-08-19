import {
  SIDE_PANEL_WIDTH_CSS_VAR,
  VireoDockedSidePanel,
  VireoOverlayHeader,
  VireoSidePanelResizeHandle,
  useSidePanelResize,
} from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/starter-ui/storybook/VireoDockedSidePanel";
import { Box, Stack, Typography } from "@mui/material";
import type { CSSProperties } from "react";

export default function LongContentExample() {
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
          <VireoOverlayHeader title="Invoice details" />
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
            <Stack spacing={2}>
              {Array.from({ length: 12 }, (_, index) => (
                <Typography key={index}>Invoice activity item {index + 1}</Typography>
              ))}
            </Stack>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
