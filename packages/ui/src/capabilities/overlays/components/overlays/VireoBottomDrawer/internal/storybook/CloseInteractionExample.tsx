import { VireoBottomDrawer, VireoOverlayHeader, type VireoBottomDrawerProps } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function CloseInteractionExample({ onClose }: Pick<VireoBottomDrawerProps, "onClose">) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose();
  };
  return (
    <VireoStorybookProvider>
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open customer filters
        </Button>
      </Box>
      <VireoBottomDrawer open={open} onClose={close}>
        <VireoOverlayHeader title="Filter customers" closeLabel="Close filters" onClose={close} />
        <Typography sx={{ p: 3 }}>Press Escape or use the close control.</Typography>
      </VireoBottomDrawer>
    </VireoStorybookProvider>
  );
}
