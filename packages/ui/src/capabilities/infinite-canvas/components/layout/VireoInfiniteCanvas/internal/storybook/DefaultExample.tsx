import {
  VireoInfiniteCanvas,
  VireoInfiniteCanvasBody,
  VireoInfiniteCanvasOverlay,
  useVireoInfiniteCanvas,
} from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Add, CenterFocusStrong, Fullscreen, Remove } from "@mui/icons-material";
import { ButtonGroup, IconButton, Paper, Stack, Typography } from "@mui/material";
function CanvasControls() {
  const { resetTransform, scale, toggleFullscreen, zoomIn, zoomOut } = useVireoInfiniteCanvas();
  return (
    <Paper elevation={4}>
      <Stack direction="row" alignItems="center">
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
          <IconButton aria-label="Toggle fullscreen" onClick={() => void toggleFullscreen()}>
            <Fullscreen />
          </IconButton>
        </ButtonGroup>
        <Typography sx={{ px: 1.5 }} variant="caption">
          {Math.round(scale * 100)}%
        </Typography>
      </Stack>
    </Paper>
  );
}
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoInfiniteCanvas sx={{ height: 480 }} defaultTransform={{ scale: 1, pan: { x: 160, y: 110 } }}>
        <VireoInfiniteCanvasBody>
          <Paper sx={{ left: 0, p: 2, position: "absolute", top: 0, width: 220 }}>
            <Typography variant="h6">Research</Typography>
            <Typography color="text.secondary">Drag the canvas and use the mouse wheel to navigate.</Typography>
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
    </VireoStorybookProvider>
  );
}
