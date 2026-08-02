import { RgoDrawer } from "@/components/feedback/RgoDrawer/RgoDrawer";
import { RgoPageBody } from "@/components/layout/RgoPageBody/RgoPageBody";
import { Button, Card, CardContent, Typography } from "@mui/material";
import React from "react";

export function RgoPageBodyWithDrawerDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <RgoPageBody
      drawer={
        <RgoDrawer open={open} onClose={() => setOpen(false)}>
          <Typography p={2}>Drawer content</Typography>
        </RgoDrawer>
      }
    >
      <Card>
        <CardContent>
          <Typography gutterBottom>Page body with a side drawer.</Typography>
          <Button variant="outlined" onClick={() => setOpen(true)}>
            Open Drawer
          </Button>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}

export const RgoPageBodyWithDrawerDemoCode = `
import { RgoDrawer, RgoPageBody } from "@vireocodedev/starter-ui";
import { Button, Card, CardContent, Typography } from "@mui/material";
import React from "react";

export function RgoPageBodyWithDrawerDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <RgoPageBody
      drawer={
        <RgoDrawer open={open} onClose={() => setOpen(false)}>
          <Typography p={2}>Drawer content</Typography>
        </RgoDrawer>
      }
    >
      <Card>
        <CardContent>
          <Typography gutterBottom>Page body with a side drawer.</Typography>
          <Button variant="outlined" onClick={() => setOpen(true)}>
            Open Drawer
          </Button>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}`;
