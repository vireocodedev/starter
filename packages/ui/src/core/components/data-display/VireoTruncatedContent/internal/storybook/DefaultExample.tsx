import { VireoTruncatedContent, type VireoTruncatedContentProps } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

export default function DefaultExample({ onExpandedChange }: Pick<VireoTruncatedContentProps, "onExpandedChange">) {
  return (
    <VireoStorybookProvider>
      <Box width={420} maxWidth="100%">
        <VireoTruncatedContent
          collapsedHeight={64}
          expandLabel="Show more"
          collapseLabel="Show less"
          onExpandedChange={onExpandedChange}
        >
          <Stack spacing={1}>
            <Typography fontWeight={700}>Quarterly account review</Typography>
            <Typography variant="body2">
              The customer completed onboarding and is ready for the analytics rollout. The implementation team still
              needs to confirm data-retention settings and schedule administrator training.
            </Typography>
          </Stack>
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
