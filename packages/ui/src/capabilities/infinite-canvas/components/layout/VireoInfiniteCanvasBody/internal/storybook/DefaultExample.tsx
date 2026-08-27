import { VireoInfiniteCanvas, VireoInfiniteCanvasBody } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Typography } from "@mui/material";
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoInfiniteCanvas defaultTransform={{ scale: 1.2, pan: { x: 120, y: 80 } }} sx={{ height: 360 }}>
        <VireoInfiniteCanvasBody>
          <Paper sx={{ left: 40, p: 2, position: "absolute", top: 30 }}>
            <Typography>Transformed world content</Typography>
          </Paper>
        </VireoInfiniteCanvasBody>
      </VireoInfiniteCanvas>
    </VireoStorybookProvider>
  );
}
