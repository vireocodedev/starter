import { RgoDrawer, type RgoDrawerProps } from "@/components/feedback/RgoDrawer/RgoDrawer";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithDefaultPropsDemoProps = Partial<Omit<RgoDrawerProps, "children">>;

export function RgoDrawerWithDefaultPropsDemo(props: RgoDrawerWithDefaultPropsDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Drawer
      </Button>
      <RgoDrawer {...props} open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Drawer Content</Typography>
          <Typography>This is a persistent drawer on the right side.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}

export const RgoDrawerWithDefaultPropsDemoCode = `
import { RgoDrawer, type RgoDrawerProps } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithDefaultPropsDemoProps = Partial<Omit<RgoDrawerProps, "children">>;

export function RgoDrawerWithDefaultPropsDemo(props: RgoDrawerWithDefaultPropsDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Drawer
      </Button>
      <RgoDrawer {...props} open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Drawer Content</Typography>
          <Typography>This is a persistent drawer on the right side.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}`;
