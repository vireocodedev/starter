import { VireoPage, VireoPageBody, VireoPageHeader, VireoResponsiveCard } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, CardContent, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoPage sx={{ border: 1, borderColor: "divider", height: 420 }}>
        <VireoPageHeader title="Customers" actions={<Button variant="contained">Add customer</Button>} />
        <VireoPageBody>
          <VireoResponsiveCard>
            <CardContent>
              <Typography variant="h6">Northstar Analytics</Typography>
              <Typography color="text.secondary">
                The page measures its own container and shares the resulting layout mode.
              </Typography>
            </CardContent>
          </VireoResponsiveCard>
        </VireoPageBody>
      </VireoPage>
    </VireoStorybookProvider>
  );
}
