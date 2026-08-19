import { Button, Paper, Stack, Typography } from "@mui/material";
import { VireoSlidingScreenStack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { useState } from "react";

export default function CustomizedSlotsExample() {
  const [activeScreen, setActiveScreen] = useState("queue");
  const screens = [
    {
      id: "queue",
      children: <Button onClick={() => setActiveScreen("review")}>Review selected request</Button>,
    },
    {
      id: "review",
      children: (
        <Stack spacing={2}>
          <Typography variant="h6">Request #1842</Typography>
          <Button onClick={() => setActiveScreen("queue")}>Return to queue</Button>
        </Stack>
      ),
    },
  ];

  return (
    <VireoStorybookProvider>
      <VireoSlidingScreenStack
        activeScreen={activeScreen}
        screens={screens}
        slots={{ screen: Paper }}
        slotProps={{ screen: { sx: { p: 3, border: 1, borderColor: "divider" } } }}
        sx={{ minHeight: 180 }}
      />
    </VireoStorybookProvider>
  );
}
