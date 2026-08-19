import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

export default function InitiallyExpandedExample() {
  return (
    <VireoStorybookProvider>
      <Box width={360} maxWidth="100%">
        <VireoTruncatedContent collapsedHeight={72} defaultExpanded expandLabel="Show more" collapseLabel="Show less">
          <Stack spacing={1}>
            <Typography fontWeight={700}>Rich React content is supported.</Typography>
            <Typography variant="body2">
              Initially expanded content remains completely visible while retaining its disclosure control.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Consumers can still collapse it when compact presentation becomes useful.
            </Typography>
          </Stack>
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
