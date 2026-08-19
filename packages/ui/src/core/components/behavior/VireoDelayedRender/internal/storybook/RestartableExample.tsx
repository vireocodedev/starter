import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function RestartableExample({ delay = 1200 }: { delay?: number }) {
  const [attempt, setAttempt] = useState(0);

  return (
    <VireoStorybookProvider>
      <Stack alignItems="flex-start" gap={2}>
        <Button variant="contained" onClick={() => setAttempt(current => current + 1)}>
          Restart delay
        </Button>
        <Typography color="text.secondary" variant="body2">
          The content below mounts {delay} ms after each restart.
        </Typography>
        <VireoDelayedRender key={attempt} delay={delay}>
          <Card variant="outlined">
            <CardContent>Fallback content mounted</CardContent>
          </Card>
        </VireoDelayedRender>
      </Stack>
    </VireoStorybookProvider>
  );
}
