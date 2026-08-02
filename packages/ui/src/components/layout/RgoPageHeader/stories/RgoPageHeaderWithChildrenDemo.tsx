import { RgoPageHeader } from "@/components/layout/RgoPageHeader/RgoPageHeader";
import { Button, Chip } from "@mui/material";

export function RgoPageHeaderWithChildrenDemo() {
  return (
    <RgoPageHeader title="Page Title">
      <Chip label="Status: Active" color="success" size="small" />
      <Button variant="outlined" size="small">
        Action
      </Button>
    </RgoPageHeader>
  );
}

export const RgoPageHeaderWithChildrenDemoCode = `
import { RgoPageHeader } from "@vireocodedev/starter-ui";
import { Button, Chip } from "@mui/material";

export function RgoPageHeaderWithChildrenDemo() {
  return (
    <RgoPageHeader title="Page Title">
      <Chip label="Status: Active" color="success" size="small" />
      <Button variant="outlined" size="small">Action</Button>
    </RgoPageHeader>
  );
}`;
