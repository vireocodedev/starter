import { RgoInfiniteCanvas } from "@/components/layout/RgoInfiniteCanvas/RgoInfiniteCanvas";
import { RgoInfiniteCanvasBody } from "@/components/layout/RgoInfiniteCanvas/components/RgoInfiniteCanvasBody/RgoInfiniteCanvasBody";
import { RgoInfiniteCanvasOverlay } from "@/components/layout/RgoInfiniteCanvas/components/RgoInfiniteCanvasOverlay/RgoInfiniteCanvasOverlay";
import { Box, Chip, Paper, Typography } from "@mui/material";

const ITEMS = [
  { id: "1", label: "Component A", x: 50, y: 50, color: "#e3f2fd" },
  { id: "2", label: "Component B", x: 300, y: 100, color: "#f3e5f5" },
  { id: "3", label: "Component C", x: 150, y: 250, color: "#e8f5e9" },
];

export function RgoInfiniteCanvasWithDefaultPropsDemo() {
  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <RgoInfiniteCanvas>
        <RgoInfiniteCanvasBody>
          {ITEMS.map(item => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{
                position: "absolute",
                left: item.x,
                top: item.y,
                p: 2,
                minWidth: 120,
                backgroundColor: item.color,
                cursor: "default",
              }}
            >
              <Typography variant="subtitle2">{item.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                ({item.x}, {item.y})
              </Typography>
            </Paper>
          ))}
        </RgoInfiniteCanvasBody>
        <RgoInfiniteCanvasOverlay position="top-right">
          <Chip label="Scroll to zoom • Drag to pan" size="small" />
        </RgoInfiniteCanvasOverlay>
      </RgoInfiniteCanvas>
    </Box>
  );
}

export const RgoInfiniteCanvasWithDefaultPropsDemoCode = `
import {
  RgoInfiniteCanvas,
  RgoInfiniteCanvasBody,
  RgoInfiniteCanvasOverlay,
} from "@vireocodedev/starter-ui";
import { Box, Chip, Paper, Typography } from "@mui/material";

const ITEMS = [
  { id: "1", label: "Component A", x: 50, y: 50, color: "#e3f2fd" },
  { id: "2", label: "Component B", x: 300, y: 100, color: "#f3e5f5" },
  { id: "3", label: "Component C", x: 150, y: 250, color: "#e8f5e9" },
];

export function RgoInfiniteCanvasWithDefaultPropsDemo() {
  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <RgoInfiniteCanvas>
        <RgoInfiniteCanvasBody>
          {ITEMS.map(item => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{
                position: "absolute",
                left: item.x,
                top: item.y,
                p: 2,
                minWidth: 120,
                backgroundColor: item.color,
              }}
            >
              <Typography variant="subtitle2">{item.label}</Typography>
            </Paper>
          ))}
        </RgoInfiniteCanvasBody>
        <RgoInfiniteCanvasOverlay position="top-right">
          <Chip label="Scroll to zoom • Drag to pan" size="small" />
        </RgoInfiniteCanvasOverlay>
      </RgoInfiniteCanvas>
    </Box>
  );
}`;
