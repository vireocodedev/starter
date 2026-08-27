import { useVireoFullscreen } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { isFullscreen, isSupported, toggleFullscreen } = useVireoFullscreen(target);

  const handleToggle = () => {
    setError(null);
    void toggleFullscreen({ navigationUI: "hide" }).catch(reason => {
      setError(reason instanceof Error ? reason.message : "Fullscreen request failed.");
    });
  };

  return (
    <VireoStorybookProvider>
      <Paper ref={setTarget} sx={{ display: "grid", minHeight: 240, p: 3, placeItems: "center" }}>
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Presentation surface</Typography>
          <Typography color="text.secondary">
            {isFullscreen ? "This surface owns fullscreen." : "This surface is embedded in the page."}
          </Typography>
          <Button disabled={!isSupported} variant="contained" onClick={handleToggle}>
            {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          </Button>
          {error !== null && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </Paper>
    </VireoStorybookProvider>
  );
}
