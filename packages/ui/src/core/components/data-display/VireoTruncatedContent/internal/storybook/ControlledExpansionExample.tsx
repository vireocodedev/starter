import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Stack, Typography } from "@mui/material";
import React from "react";

export default function ControlledExpansionExample() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        <Button variant="outlined" onClick={() => setExpanded(current => !current)}>
          {expanded ? "Collapse summary" : "Expand summary"}
        </Button>
        <Box width={420} maxWidth="100%">
          <VireoTruncatedContent
            collapsedHeight={64}
            expanded={expanded}
            expandLabel="Show more"
            collapseLabel="Show less"
            onExpandedChange={setExpanded}
          >
            <Stack spacing={1}>
              <Typography fontWeight={700}>Application-owned disclosure state</Typography>
              <Typography variant="body2">
                The external action and the component toggle update the same state. This lets a surrounding workflow
                coordinate expansion without replacing Vireo's disclosure behavior.
              </Typography>
            </Stack>
          </VireoTruncatedContent>
        </Box>
      </Stack>
    </VireoStorybookProvider>
  );
}
