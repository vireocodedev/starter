import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Card, CardContent, Typography } from "@mui/material";

export default function DefaultExample({ delay }: { delay?: number }) {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender delay={delay}>
        <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={700}>Fallback content mounted</Typography>
            <Typography color="text.secondary" variant="body2">
              Fast operations can finish before this content enters the DOM.
            </Typography>
          </CardContent>
        </Card>
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
