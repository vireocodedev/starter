import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Card, CardContent, Typography } from "@mui/material";

export default function ImmediateExample() {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender delay={0}>
        <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={700}>Immediately mounted fallback</Typography>
            <Typography color="text.secondary" variant="body2">
              A zero delay mounts the content in the next effect cycle.
            </Typography>
          </CardContent>
        </Card>
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
