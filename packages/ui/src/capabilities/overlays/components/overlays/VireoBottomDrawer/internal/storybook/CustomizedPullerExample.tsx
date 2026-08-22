import { VireoBottomDrawer, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";

export default function CustomizedPullerExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <Box sx={{ bgcolor: "background.paper", p: 3 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open customer filters
        </Button>
      </Box>
      <VireoBottomDrawer
        open={open}
        onClose={() => setOpen(false)}
        slots={{ puller: "header" }}
        slotProps={{ puller: { "aria-label": "Customized sheet handle", sx: { py: 1.5, "&::after": { width: 56 } } } }}
      >
        <VireoOverlayHeader title="Customized puller" closeLabel="Close filters" onClose={() => setOpen(false)} />
        <Typography sx={{ p: 3 }}>The puller uses a replacement semantic element.</Typography>
      </VireoBottomDrawer>
    </VireoStorybookProvider>
  );
}
