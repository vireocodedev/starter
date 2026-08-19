import { VireoBottomDrawer, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function WithoutBackdropExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open customer filters
        </Button>
      </Box>
      <VireoBottomDrawer open={open} useBackdrop={false} onClose={() => setOpen(false)}>
        <VireoOverlayHeader
          title="Filters without backdrop"
          closeLabel="Close filters"
          onClose={() => setOpen(false)}
        />
        <Typography sx={{ p: 3 }}>The workspace remains unobscured.</Typography>
      </VireoBottomDrawer>
    </VireoStorybookProvider>
  );
}
