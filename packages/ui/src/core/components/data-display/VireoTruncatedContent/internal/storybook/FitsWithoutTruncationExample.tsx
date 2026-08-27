import { VireoTruncatedContent } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box } from "@mui/material";

export default function FitsWithoutTruncationExample() {
  return (
    <VireoStorybookProvider>
      <Box
        sx={{
          maxWidth: "100%",
          width: 420,
        }}
      >
        <VireoTruncatedContent expandLabel="Show more" collapseLabel="Show less">
          Onboarding completed successfully.
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
