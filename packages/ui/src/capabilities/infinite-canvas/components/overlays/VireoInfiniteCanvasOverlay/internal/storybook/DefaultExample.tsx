import { VireoInfiniteCanvas, VireoInfiniteCanvasOverlay } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Paper, Stack } from "@mui/material";
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoInfiniteCanvas aria-label="Infinite canvas overlay example" sx={{ height: 360 }}>
        <VireoInfiniteCanvasOverlay position="top-left">
          <Paper sx={{ p: 1 }}>
            <Stack direction="row" spacing={1}>
              <Button>Layers</Button>
              <Button>Assets</Button>
            </Stack>
          </Paper>
        </VireoInfiniteCanvasOverlay>
        <VireoInfiniteCanvasOverlay position="bottom-right">
          <Paper sx={{ p: 1 }}>Fixed minimap</Paper>
        </VireoInfiniteCanvasOverlay>
      </VireoInfiniteCanvas>
    </VireoStorybookProvider>
  );
}
