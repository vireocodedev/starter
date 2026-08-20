import { VireoBottomDrawer, VireoOverlayHeader, type VireoBottomDrawerProps } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function DefaultExample({ onClose }: Pick<VireoBottomDrawerProps, "onClose">) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose();
  };

  return (
    <VireoStorybookProvider>
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Typography variant="h5">Customer workspace</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open customer filters
        </Button>
      </Box>
      <VireoBottomDrawer open={open} onClose={close}>
        <VireoOverlayHeader title="Filter customers" closeLabel="Close filters" onClose={close} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography>Choose customer states.</Typography>
          <Button variant="contained">Apply filters</Button>
        </Stack>
      </VireoBottomDrawer>
    </VireoStorybookProvider>
  );
}
