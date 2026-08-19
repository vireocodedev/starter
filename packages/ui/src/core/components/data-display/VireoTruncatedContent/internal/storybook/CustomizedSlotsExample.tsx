import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Box width={360} maxWidth="100%">
        <VireoTruncatedContent
          collapsedHeight={72}
          expandLabel="Show more"
          collapseLabel="Show less"
          slots={{ root: "section", viewport: "article" }}
          slotProps={{
            root: {
              "aria-label": "Customized expandable summary",
              sx: { border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
            },
            viewport: ownerState => ({
              "data-expanded": String(ownerState.expanded),
              sx: { borderInlineStart: 3, borderColor: "primary.light", paddingInlineStart: 1.5 },
            }),
            content: { sx: { color: "text.secondary" } },
            toggle: { color: "secondary" },
          }}
        >
          <Stack spacing={1}>
            <Typography fontWeight={700}>Customized rich content</Typography>
            <Typography variant="body2">
              The public slots expose each semantic region without replacing behavior.
            </Typography>
            <Typography variant="body2">Additional content ensures the disclosure control remains visible.</Typography>
          </Stack>
        </VireoTruncatedContent>
      </Box>
    </VireoStorybookProvider>
  );
}
