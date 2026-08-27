import { VireoPageLayoutProvider, VireoResponsiveCard, createVireoPageLayout } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { CardContent, Stack, Typography } from "@mui/material";
function ExampleCard() {
  return (
    <VireoResponsiveCard variant="outlined">
      <CardContent>
        <Typography variant="h6">Customer summary</Typography>
        <Typography color="text.secondary">
          Markup remains stable while compact mode removes the card surface.
        </Typography>
      </CardContent>
    </VireoResponsiveCard>
  );
}
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={3}>
        <VireoPageLayoutProvider value={createVireoPageLayout("regular")}>
          <ExampleCard />
        </VireoPageLayoutProvider>
        <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
          <ExampleCard />
        </VireoPageLayoutProvider>
      </Stack>
    </VireoStorybookProvider>
  );
}
