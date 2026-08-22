import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function FitsWithoutTruncationExample() {
  return (
    <VireoStorybookProvider>
      <Box width={420} maxWidth="100%">
        <VireoTruncatedContent expandLabel="Show more" collapseLabel="Show less">
          Onboarding completed successfully.
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
