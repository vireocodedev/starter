import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const OrganizationFlag = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function OrganizationFlag(props, ref) {
    return (
      <svg viewBox="0 0 24 16" {...props} ref={ref}>
        <rect width="24" height="16" fill="#172554" />
        <path d="M0 16 12 2l12 14Z" fill="#38bdf8" />
        <circle cx="12" cy="9" r="3" fill="#f8fafc" />
      </svg>
    );
  },
);

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <VireoCountryFlag
          countryCode="NORTHSTAR"
          label="Northstar organization flag"
          width={40}
          slots={{ flag: OrganizationFlag }}
          slotProps={{ root: { "data-analytics-flag": "northstar", sx: { borderRadius: 1 } } }}
        />
        <Typography>Application-defined flag asset</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
