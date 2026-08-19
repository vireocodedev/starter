import { VireoTruncatedContent, type VireoTruncatedContentProps } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

export default function OverflowingRichContentExample({
  onExpandedChange,
}: Pick<VireoTruncatedContentProps, "onExpandedChange">) {
  return (
    <VireoStorybookProvider>
      <Box width={360} maxWidth="100%">
        <VireoTruncatedContent
          collapsedHeight={72}
          expandLabel="Show more"
          collapseLabel="Show less"
          onExpandedChange={onExpandedChange}
        >
          <Stack spacing={1}>
            <Typography fontWeight={700}>Rich React content is supported.</Typography>
            <Typography variant="body2">
              The component measures rendered typography and other compact read-only content.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Resize the canvas to see overflow detection respond to the available width.
            </Typography>
          </Stack>
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
