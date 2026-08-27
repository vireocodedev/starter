import { Button, Paper, Stack, Typography } from "@mui/material";
import { VireoLoadingRegion, VireoSkeleton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function LoadingTransitionExample() {
  const [loading, setLoading] = React.useState(false);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <Button onClick={() => setLoading(value => !value)} variant="outlined">
          {loading ? "Finish loading" : "Start loading"}
        </Button>
        <VireoLoadingRegion loading={loading} loadingLabel="Refreshing account details">
          {({ loadingVisible }) => (
            <Paper variant="outlined" sx={{ p: 2 }}>
              {loadingVisible ? (
                <>
                  <VireoSkeleton>
                    <Typography variant="h6">Account details</Typography>
                  </VireoSkeleton>
                  <VireoSkeleton>
                    <Typography color="text.secondary">Production workspace · 18 members</Typography>
                  </VireoSkeleton>
                </>
              ) : loading ? null : (
                <>
                  <Typography variant="h6">Account details</Typography>
                  <Typography color="text.secondary">Production workspace · 18 members</Typography>
                </>
              )}
            </Paper>
          )}
        </VireoLoadingRegion>
      </Stack>
    </VireoStorybookProvider>
  );
}
