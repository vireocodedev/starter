import { useRgoResizeListener } from "@/hooks/useRgoResizeListener/useRgoResizeListener";
import { Paper, Typography } from "@mui/material";
import React from "react";

export const UseResizeListenerWithDefaultPropsDemo = () => {
  const [dimensions, setDimensions] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useRgoResizeListener(
    React.useCallback(() => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }, []),
  );

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Window Resize Listener
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Resize the browser window to see the dimensions update in real-time.
      </Typography>

      <Typography variant="h4" color="primary" sx={{ textAlign: "center", py: 2 }}>
        {dimensions.width} × {dimensions.height}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
        window.innerWidth × window.innerHeight
      </Typography>
    </Paper>
  );
};

export const UseResizeListenerWithDefaultPropsDemoCode = `import { useRgoResizeListener } from "@vireocodedev/starter-ui";
import React from "react";

function ResponsiveLayout() {
  const [width, setWidth] = React.useState(window.innerWidth);

  useRgoResizeListener(
    React.useCallback(() => {
      setWidth(window.innerWidth);
    }, []),
  );

  return <p>Window width: {width}px</p>;
}`;
