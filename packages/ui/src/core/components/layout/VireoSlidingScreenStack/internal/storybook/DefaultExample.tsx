import { Button, Stack, Typography } from "@mui/material";
import { VireoSlidingScreenStack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { useState } from "react";

export default function DefaultExample() {
  const [activeScreen, setActiveScreen] = useState("overview");
  const screens = [
    {
      id: "overview",
      children: (
        <Stack spacing={2}>
          <Typography variant="h6">Project overview</Typography>
          <Typography color="text.secondary">Review the summary before opening its details.</Typography>
          <Button onClick={() => setActiveScreen("details")}>Open details</Button>
        </Stack>
      ),
    },
    {
      id: "details",
      children: (
        <Stack spacing={2}>
          <Typography variant="h6">Project details</Typography>
          <Typography color="text.secondary">This screen stayed mounted while it was out of view.</Typography>
          <Button onClick={() => setActiveScreen("overview")}>Back to overview</Button>
        </Stack>
      ),
    },
  ];

  return (
    <VireoStorybookProvider>
      <VireoSlidingScreenStack activeScreen={activeScreen} screens={screens} sx={{ minHeight: 220, p: 3 }} />
    </VireoStorybookProvider>
  );
}
