import { Paper, Typography } from "@mui/material";
import { VireoLoadingRegion, VireoSkeleton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function LoadingExample() {
  return (
    <VireoStorybookProvider>
      <VireoLoadingRegion loading loadingLabel="Loading workspace summary">
        {({ loadingVisible }) => (
          <Paper aria-label="Workspace summary" variant="outlined" sx={{ maxWidth: 420, p: 2 }}>
            {loadingVisible ? (
              <>
                <VireoSkeleton>
                  <Typography variant="h6">Workspace summary</Typography>
                </VireoSkeleton>
                <VireoSkeleton>
                  <Typography color="text.secondary">12 active projects · updated just now</Typography>
                </VireoSkeleton>
              </>
            ) : null}
          </Paper>
        )}
      </VireoLoadingRegion>
    </VireoStorybookProvider>
  );
}
