import { RgoDrawer, type RgoDrawerProps } from "@/components/feedback/RgoDrawer/RgoDrawer";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithLeftAnchorDemoProps = Partial<Omit<RgoDrawerProps, "children" | "anchor">>;

export function RgoDrawerWithLeftAnchorDemo(props: RgoDrawerWithLeftAnchorDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Left Drawer
      </Button>
      <RgoDrawer {...props} anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Left Drawer</Typography>
          <Typography>This drawer opens from the left side.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}

export const RgoDrawerWithLeftAnchorDemoCode = `
import { RgoDrawer, type RgoDrawerProps } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithLeftAnchorDemoProps = Partial<Omit<RgoDrawerProps, "children" | "anchor">>;

export function RgoDrawerWithLeftAnchorDemo(props: RgoDrawerWithLeftAnchorDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Left Drawer
      </Button>
      <RgoDrawer {...props} anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Left Drawer</Typography>
          <Typography>This drawer opens from the left side.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}`;
