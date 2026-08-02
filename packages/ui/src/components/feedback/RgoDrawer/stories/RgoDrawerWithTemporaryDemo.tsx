import { RgoDrawer, type RgoDrawerProps } from "@/components/feedback/RgoDrawer/RgoDrawer";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithTemporaryDemoProps = Partial<Omit<RgoDrawerProps, "children" | "temporary">>;

export function RgoDrawerWithTemporaryDemo(props: RgoDrawerWithTemporaryDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Temporary Drawer
      </Button>
      <RgoDrawer {...props} temporary open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Temporary Drawer</Typography>
          <Typography>This drawer has a backdrop overlay and closes on outside click.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}

export const RgoDrawerWithTemporaryDemoCode = `
import { RgoDrawer, type RgoDrawerProps } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

type RgoDrawerWithTemporaryDemoProps = Partial<Omit<RgoDrawerProps, "children" | "temporary">>;

export function RgoDrawerWithTemporaryDemo(props: RgoDrawerWithTemporaryDemoProps = {}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Temporary Drawer
      </Button>
      <RgoDrawer {...props} temporary open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Temporary Drawer</Typography>
          <Typography>This drawer has a backdrop overlay and closes on outside click.</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </RgoDrawer>
    </Box>
  );
}`;
