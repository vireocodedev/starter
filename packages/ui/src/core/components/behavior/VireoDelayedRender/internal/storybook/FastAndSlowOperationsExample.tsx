import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Button, ButtonGroup, CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { VireoDelayedRender } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

type OperationState = "idle" | "running" | "complete";

export default function FastAndSlowOperationsExample() {
  const [operationState, setOperationState] = React.useState<OperationState>("idle");
  const [completedQuickly, setCompletedQuickly] = React.useState(false);
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const runOperation = (duration: number) => {
    window.clearTimeout(timerRef.current);
    setCompletedQuickly(duration < 300);
    setOperationState("running");
    timerRef.current = window.setTimeout(() => setOperationState("complete"), duration);
  };

  const reset = () => {
    window.clearTimeout(timerRef.current);
    setOperationState("idle");
  };

  return (
    <VireoStorybookProvider>
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <ButtonGroup aria-label="Operation duration">
          <Button onClick={() => runOperation(100)}>Run fast operation</Button>
          <Button onClick={() => runOperation(900)}>Run slow operation</Button>
        </ButtonGroup>

        {operationState === "idle" && (
          <Typography color="text.secondary">Choose a duration to compare fallback behavior.</Typography>
        )}
        {operationState === "running" && (
          <VireoDelayedRender delay={300}>
            <Stack
              direction="row"
              spacing={1.5}
              role="status"
              sx={{
                alignItems: "center",
              }}
            >
              <CircularProgress size={20} />
              <Typography>Still loading…</Typography>
            </Stack>
          </VireoDelayedRender>
        )}
        {operationState === "complete" && (
          <Stack
            direction="row"
            spacing={1}
            color="success.main"
            sx={{
              alignItems: "center",
            }}
          >
            <CheckCircleRoundedIcon aria-hidden />
            <Typography>
              {completedQuickly ? "Completed before fallback mounted" : "Completed after fallback mounted"}
            </Typography>
          </Stack>
        )}

        <Button disabled={operationState === "idle"} onClick={reset}>
          Reset demonstration
        </Button>
      </Stack>
    </VireoStorybookProvider>
  );
}
