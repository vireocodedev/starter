import { RgoPageBody } from "@/components/layout/RgoPageBody/RgoPageBody";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageBodyWithMaxWidthDemo() {
  return (
    <RgoPageBody maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Constrained width
          </Typography>
          <Typography>This page body is constrained to a medium (md) max width.</Typography>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}

export const RgoPageBodyWithMaxWidthDemoCode = `
import { RgoPageBody } from "@vireocodedev/starter-ui";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageBodyWithMaxWidthDemo() {
  return (
    <RgoPageBody maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Constrained width</Typography>
          <Typography>This page body is constrained to a medium (md) max width.</Typography>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}`;
