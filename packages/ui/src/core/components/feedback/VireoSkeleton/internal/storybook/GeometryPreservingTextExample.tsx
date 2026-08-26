import { Paper, Stack, Typography } from "@mui/material";
import { VireoSkeleton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const title = "Geometry-preserving heading";
const description = "The placeholder inherits the exact typography, wrapping, and spacing of its loaded counterpart.";

export default function GeometryPreservingTextExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ maxWidth: 760 }}>
        <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="overline">Loaded</Typography>
          <Typography variant="h5">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Paper>
        <Paper aria-label="Same card while loading" variant="outlined" sx={{ flex: 1, p: 2 }}>
          <VireoSkeleton>
            <Typography variant="overline">Loaded</Typography>
          </VireoSkeleton>
          <VireoSkeleton>
            <Typography variant="h5">{title}</Typography>
          </VireoSkeleton>
          <VireoSkeleton>
            <Typography color="text.secondary">{description}</Typography>
          </VireoSkeleton>
        </Paper>
      </Stack>
    </VireoStorybookProvider>
  );
}
