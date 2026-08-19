import { VireoBottomDrawer, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function DefaultExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Typography variant="h5">Customer workspace</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open customer filters
        </Button>
      </Box>
      <VireoBottomDrawer open={open} onClose={() => setOpen(false)}>
        <VireoOverlayHeader title="Filter customers" closeLabel="Close filters" onClose={() => setOpen(false)} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography>Choose customer states.</Typography>
          <Button variant="contained">Apply filters</Button>
        </Stack>
      </VireoBottomDrawer>
    </VireoStorybookProvider>
  );
}
