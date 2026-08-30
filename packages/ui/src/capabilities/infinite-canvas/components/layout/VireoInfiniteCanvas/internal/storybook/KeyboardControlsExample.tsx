import {
  VireoInfiniteCanvas,
  VireoInfiniteCanvasBody,
  VireoInfiniteCanvasOverlay,
  useVireoInfiniteCanvas,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

function TransformStatus() {
  const { pan, scale } = useVireoInfiniteCanvas();

  return (
    <Paper aria-live="polite" sx={{ px: 1.5, py: 1 }}>
      <Typography variant="caption">
        Pan {Math.round(pan.x)}, {Math.round(pan.y)} · Zoom {Math.round(scale * 100)}%
      </Typography>
    </Paper>
  );
}

export default function KeyboardControlsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1.5}>
        <Typography id="keyboard-canvas-title" variant="subtitle2">
          Keyboard navigation canvas
        </Typography>
        <Typography id="keyboard-canvas-instructions" color="text.secondary" variant="body2">
          Tab to the canvas. Arrow keys pan the viewport, + and - zoom around its center, and 0 restores the initial
          view.
        </Typography>
        <VireoInfiniteCanvas
          aria-describedby="keyboard-canvas-instructions"
          aria-labelledby="keyboard-canvas-title"
          sx={{ height: 360 }}
        >
          <VireoInfiniteCanvasBody>
            <Paper sx={{ left: 120, p: 2, position: "absolute", top: 100, width: 220 }}>
              <Typography variant="h6">Keyboard-ready surface</Typography>
              <Typography color="text.secondary">The focus ring remains visible while the world moves.</Typography>
            </Paper>
          </VireoInfiniteCanvasBody>
          <VireoInfiniteCanvasOverlay position="top-right">
            <TransformStatus />
          </VireoInfiniteCanvasOverlay>
        </VireoInfiniteCanvas>
      </Stack>
    </VireoStorybookProvider>
  );
}
