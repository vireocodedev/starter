import { RgoInfiniteCanvas } from "@/components/layout/RgoInfiniteCanvas/RgoInfiniteCanvas";
import { RgoInfiniteCanvasBody } from "@/components/layout/RgoInfiniteCanvas/components/RgoInfiniteCanvasBody/RgoInfiniteCanvasBody";
import { useRgoInfiniteCanvas } from "@/hooks/useRgoInfiniteCanvas/useRgoInfiniteCanvas";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";

const CanvasInfo = () => {
  const { scale, pan, setTransform } = useRgoInfiniteCanvas();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 10,
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Chip label={`Scale: ${scale.toFixed(2)}`} size="small" color="primary" />
      <Chip label={`Pan: (${Math.round(pan.x)}, ${Math.round(pan.y)})`} size="small" variant="outlined" />
      <Button size="small" variant="outlined" onClick={() => setTransform(1, { x: 0, y: 0 })}>
        Reset
      </Button>
    </Box>
  );
};

export const UseInfiniteCanvasWithDefaultPropsDemo = () => {
  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h6" gutterBottom>
        useRgoInfiniteCanvas Hook
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Accesses the infinite canvas context for reading/writing transform state. Drag to pan, scroll to zoom.
      </Typography>

      <Box sx={{ height: 400, border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
        <RgoInfiniteCanvas>
          <CanvasInfo />
          <RgoInfiniteCanvasBody>
            <Paper
              elevation={2}
              sx={{
                position: "absolute",
                left: 50,
                top: 50,
                p: 2,
                width: 180,
              }}
            >
              <Typography variant="subtitle2">Card A</Typography>
              <Typography variant="body2" color="text.secondary">
                Positioned at (50, 50)
              </Typography>
            </Paper>

            <Paper
              elevation={2}
              sx={{
                position: "absolute",
                left: 300,
                top: 150,
                p: 2,
                width: 180,
              }}
            >
              <Typography variant="subtitle2">Card B</Typography>
              <Typography variant="body2" color="text.secondary">
                Positioned at (300, 150)
              </Typography>
            </Paper>
          </RgoInfiniteCanvasBody>
        </RgoInfiniteCanvas>
      </Box>
    </Paper>
  );
};

export const UseInfiniteCanvasWithDefaultPropsDemoCode = `import { useRgoInfiniteCanvas, RgoInfiniteCanvas, RgoInfiniteCanvasBody } from "@vireocodedev/starter-ui";

function CanvasControls() {
  const { scale, pan, setTransform } = useRgoInfiniteCanvas();

  return (
    <div>
      <p>Scale: {scale.toFixed(2)}</p>
      <p>Pan: ({Math.round(pan.x)}, {Math.round(pan.y)})</p>
      <button onClick={() => setTransform(1, { x: 0, y: 0 })}>Reset</button>
    </div>
  );
}

function MyCanvas() {
  return (
    <RgoInfiniteCanvas>
      <CanvasControls />
      <RgoInfiniteCanvasBody>
        {/* Your canvas content */}
      </RgoInfiniteCanvasBody>
    </RgoInfiniteCanvas>
  );
}`;
