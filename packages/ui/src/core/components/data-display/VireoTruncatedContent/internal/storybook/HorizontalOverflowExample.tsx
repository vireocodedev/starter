import { VireoTruncatedContent } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box } from "@mui/material";

export default function HorizontalOverflowExample() {
  return (
    <VireoStorybookProvider>
      <Box
        sx={{
          maxWidth: "100%",
          width: 280,
        }}
      >
        <VireoTruncatedContent
          collapsedHeight={40}
          expandLabel="Show more"
          collapseLabel="Show less"
          slotProps={{ content: { sx: { fontFamily: "monospace", whiteSpace: "nowrap" } } }}
        >
          INV-2026-000184-CUSTOMER-REFERENCE-WITHOUT-BREAK-OPPORTUNITIES
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
