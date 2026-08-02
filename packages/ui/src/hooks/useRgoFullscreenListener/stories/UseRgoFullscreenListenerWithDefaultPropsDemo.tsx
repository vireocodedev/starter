import { useRgoFullscreenListener } from "@/hooks/useRgoFullscreenListener/useRgoFullscreenListener";
import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";

export const UseFullscreenListenerWithDefaultPropsDemo = () => {
  const [isFullscreen, setIsFullscreen] = React.useState(!!document.fullscreenElement);

  useRgoFullscreenListener(() => {
    setIsFullscreen(!!document.fullscreenElement);
  });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Fullscreen Listener
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click the button to toggle fullscreen mode. The hook listens for the <code>fullscreenchange</code> event.
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button variant="contained" onClick={toggleFullscreen}>
          {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </Button>
        <Typography variant="body2">
          Status:{" "}
          <strong style={{ color: isFullscreen ? "green" : "inherit" }}>
            {isFullscreen ? "Fullscreen" : "Normal"}
          </strong>
        </Typography>
      </Box>
    </Paper>
  );
};

export const UseFullscreenListenerWithDefaultPropsDemoCode = `import { useRgoFullscreenListener } from "@vireocodedev/starter-ui";
import React from "react";

function FullscreenAwareComponent() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useRgoFullscreenListener(() => {
    setIsFullscreen(!!document.fullscreenElement);
  });

  return <p>{isFullscreen ? "Fullscreen" : "Normal"}</p>;
}`;
