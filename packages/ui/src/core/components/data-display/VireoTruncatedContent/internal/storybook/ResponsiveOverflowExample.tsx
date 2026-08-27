import { VireoTruncatedContent } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import React from "react";

export default function ResponsiveOverflowExample() {
  const [compact, setCompact] = React.useState(true);

  return (
    <VireoStorybookProvider>
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <ButtonGroup aria-label="Preview width">
          <Button variant={compact ? "contained" : "outlined"} onClick={() => setCompact(true)}>
            Compact
          </Button>
          <Button variant={compact ? "outlined" : "contained"} onClick={() => setCompact(false)}>
            Roomy
          </Button>
        </ButtonGroup>
        <Box
          sx={{
            maxWidth: "100%",
            width: compact ? 260 : 560,
            transition: theme => theme.transitions.create("width"),
          }}
        >
          <VireoTruncatedContent collapsedHeight={24} expandLabel="Show more" collapseLabel="Show less">
            <Typography variant="body2">
              Container measurements decide whether this account summary needs disclosure.
            </Typography>
          </VireoTruncatedContent>
        </Box>
      </Stack>
    </VireoStorybookProvider>
  );
}
