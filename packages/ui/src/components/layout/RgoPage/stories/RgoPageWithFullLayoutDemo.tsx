import { RgoPage } from "@/components/layout/RgoPage/RgoPage";
import { RgoPageBody } from "@/components/layout/RgoPageBody/RgoPageBody";
import { RgoPageHeader } from "@/components/layout/RgoPageHeader/RgoPageHeader";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageWithFullLayoutDemo() {
  return (
    <RgoPage>
      <RgoPageHeader title="Page Title" />
      <RgoPageBody>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Full page layout
            </Typography>
            <Typography>
              This demo shows RgoPage used together with RgoPageHeader and RgoPageBody to form a complete page layout.
            </Typography>
          </CardContent>
        </Card>
      </RgoPageBody>
    </RgoPage>
  );
}

export const RgoPageWithFullLayoutDemoCode = `
import { RgoPage, RgoPageBody, RgoPageHeader } from "@vireocodedev/starter-ui";
import { Card, CardContent, Typography } from "@mui/material";

export function RgoPageWithFullLayoutDemo() {
  return (
    <RgoPage>
      <RgoPageHeader title="Page Title" />
      <RgoPageBody>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Full page layout</Typography>
            <Typography>
              This demo shows RgoPage used together with RgoPageHeader and RgoPageBody.
            </Typography>
          </CardContent>
        </Card>
      </RgoPageBody>
    </RgoPage>
  );
}`;
