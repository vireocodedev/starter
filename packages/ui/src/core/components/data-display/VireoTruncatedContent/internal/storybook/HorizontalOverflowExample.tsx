import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function HorizontalOverflowExample() {
  return (
    <VireoStorybookProvider>
      <Box width={280} maxWidth="100%">
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
