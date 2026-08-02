import { RgoPageBody, type RgoPageBodyProps } from "@/components/layout/RgoPageBody/RgoPageBody";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageBodyWithDefaultPropsDemo(props: Partial<Omit<RgoPageBodyProps, "children">> = {}) {
  return (
    <RgoPageBody {...props}>
      <Card>
        <CardContent>
          <Typography>Page body content</Typography>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}

export const RgoPageBodyWithDefaultPropsDemoCode = `
import { RgoPageBody } from "@vireocodedev/starter-ui";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageBodyWithDefaultPropsDemo() {
  return (
    <RgoPageBody>
      <Card>
        <CardContent>
          <Typography>Page body content</Typography>
        </CardContent>
      </Card>
    </RgoPageBody>
  );
}`;
