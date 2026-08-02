import { RgoPage, type RgoPageProps } from "@/components/layout/RgoPage/RgoPage";
import { Typography } from "@mui/material";

export function RgoPageWithDefaultPropsDemo(props: Partial<RgoPageProps> = {}) {
  return (
    <RgoPage {...props}>
      <Typography p={2}>Page content goes here</Typography>
    </RgoPage>
  );
}

export const RgoPageWithDefaultPropsDemoCode = `
import { RgoPage } from "@vireocodedev/starter-ui";
import { Typography } from "@mui/material";

export function RgoPageWithDefaultPropsDemo() {
  return (
    <RgoPage>
      <Typography p={2}>Page content goes here</Typography>
    </RgoPage>
  );
}`;
