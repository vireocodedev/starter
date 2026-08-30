import {
  VireoInfiniteCanvas,
  VireoInfiniteCanvasBody,
  VireoInfiniteCanvasOverlay,
  useVireoInfiniteCanvas,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Add, CenterFocusStrong, Fullscreen, FullscreenExit, Remove } from "@mui/icons-material";
import { ButtonGroup, IconButton, Paper, Stack, Typography } from "@mui/material";
function CanvasControls() {
  const { isFullscreen, isFullscreenSupported, resetTransform, scale, toggleFullscreen, zoomIn, zoomOut } =
    useVireoInfiniteCanvas();
  return (
    <Paper elevation={4}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
        }}
      >
        <ButtonGroup>
          <IconButton aria-label="Zoom out" onClick={zoomOut}>
            <Remove />
          </IconButton>
          <IconButton aria-label="Reset view" onClick={resetTransform}>
            <CenterFocusStrong />
          </IconButton>
          <IconButton aria-label="Zoom in" onClick={zoomIn}>
            <Add />
          </IconButton>
          <IconButton
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            disabled={!isFullscreenSupported}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </ButtonGroup>
        <Typography variant="caption" sx={{ px: 1.5 }}>
          {Math.round(scale * 100)}%
        </Typography>
      </Stack>
    </Paper>
  );
}
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1.5}>
        <Typography id="infinite-canvas-title" variant="subtitle2">
          Product planning canvas
        </Typography>
        <Typography id="infinite-canvas-instructions" color="text.secondary" variant="body2">
          Focus the canvas, then use Arrow keys to pan, + or - to zoom, and 0 to reset. Pointer dragging is also
          available.
        </Typography>
        <VireoInfiniteCanvas
          aria-describedby="infinite-canvas-instructions"
          aria-labelledby="infinite-canvas-title"
          sx={{ height: 480 }}
          defaultTransform={{ scale: 1, pan: { x: 160, y: 110 } }}
        >
          <VireoInfiniteCanvasBody>
            <Paper sx={{ left: 0, p: 2, position: "absolute", top: 0, width: 220 }}>
              <Typography variant="h6">Research</Typography>
              <Typography color="text.secondary">Drag or use the keyboard to navigate the spatial surface.</Typography>
            </Paper>
            <Paper sx={{ left: 340, p: 2, position: "absolute", top: 170, width: 220 }}>
              <Typography variant="h6">Prototype</Typography>
              <Typography color="text.secondary">World content shares one transform.</Typography>
            </Paper>
          </VireoInfiniteCanvasBody>
          <VireoInfiniteCanvasOverlay position="top-right">
            <CanvasControls />
          </VireoInfiniteCanvasOverlay>
        </VireoInfiniteCanvas>
      </Stack>
    </VireoStorybookProvider>
  );
}
