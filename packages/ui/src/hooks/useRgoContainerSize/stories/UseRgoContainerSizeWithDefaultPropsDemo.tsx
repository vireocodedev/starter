import { useRgoContainerSize } from "@/hooks/useRgoContainerSize/useRgoContainerSize";
import { Box, Paper, Typography } from "@mui/material";
import React from "react";

export const UseContainerSizeWithDefaultPropsDemo = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useRgoContainerSize(ref);

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Container Size Tracker
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Resize the browser window to see the container dimensions update in real-time.
      </Typography>

      <Box
        ref={ref}
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 1,
          p: 3,
          textAlign: "center",
          resize: "both",
          overflow: "auto",
          minWidth: 150,
          minHeight: 100,
        }}
      >
        <Typography variant="h4" color="primary">
          {Math.round(size.width)} × {Math.round(size.height)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          width × height (px)
        </Typography>
      </Box>
    </Paper>
  );
};

export const UseContainerSizeWithDefaultPropsDemoCode = `import { useRgoContainerSize } from "@vireocodedev/starter-ui";
import React from "react";

function ResizablePanel() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { width, height } = useRgoContainerSize(ref);

  return (
    <div ref={ref} style={{ resize: "both", overflow: "auto", border: "1px solid #ccc" }}>
      {Math.round(width)} × {Math.round(height)}
    </div>
  );
}`;
