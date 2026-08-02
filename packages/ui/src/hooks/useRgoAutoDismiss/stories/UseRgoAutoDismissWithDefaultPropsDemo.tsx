import { useRgoAutoDismiss } from "@/hooks/useRgoAutoDismiss/useRgoAutoDismiss";
import { Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export const UseAutoDismissWithDefaultPropsDemo = () => {
  const [visible, setVisible] = React.useState(false);

  const { startDismissTimer, clearDismissTimer, pauseDismissTimer, resumeDismissTimer, progress } = useRgoAutoDismiss({
    onDismiss: () => setVisible(false),
    dismissDelayMs: 5000,
  });

  const handleShow = () => {
    setVisible(true);
    startDismissTimer();
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Auto Dismiss Timer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Shows a notification that auto-dismisses after 5 seconds. Hover the notification to pause the timer.
      </Typography>

      <Button variant="contained" size="small" onClick={handleShow} disabled={visible} sx={{ mb: 2 }}>
        Show Notification
      </Button>

      {visible && (
        <Box
          onMouseEnter={pauseDismissTimer}
          onMouseLeave={resumeDismissTimer}
          sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2">This will dismiss automatically</Typography>
            <Button
              size="small"
              color="error"
              onClick={() => {
                clearDismissTimer();
                setVisible(false);
              }}
            >
              Dismiss
            </Button>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress ?? 0}
            sx={{ "& .MuiLinearProgress-bar": { transition: "none" } }}
          />
        </Box>
      )}
    </Paper>
  );
};

export const UseAutoDismissWithDefaultPropsDemoCode = `import { useRgoAutoDismiss } from "@vireocodedev/starter-ui";
import React from "react";

function Notification() {
  const [visible, setVisible] = React.useState(true);

  const { pauseDismissTimer, resumeDismissTimer, progress } = useRgoAutoDismiss({
    onDismiss: () => setVisible(false),
    dismissDelayMs: 5000,
    autoStart: true,
  });

  if (!visible) return null;

  return (
    <div onMouseEnter={pauseDismissTimer} onMouseLeave={resumeDismissTimer}>
      <p>This will auto-dismiss in 5 seconds</p>
      <progress value={progress ?? 0} max={100} />
    </div>
  );
}`;
