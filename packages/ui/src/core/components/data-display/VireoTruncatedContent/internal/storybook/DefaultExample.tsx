import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Box width={360} maxWidth="100%">
        <VireoTruncatedContent expandLabel="Show more" collapseLabel="Show less">
          A short piece of content remains fully visible and does not render an unnecessary disclosure control.
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
