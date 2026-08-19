import { Stack, SvgIcon, type SvgIconProps, Typography } from "@mui/material";
import React from "react";
import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

declare module "@vireocodedev/starter-ui" {
  interface VireoIconRegistry {
    "status-clock": React.ComponentType;
  }
}

function ClockGeometry() {
  return <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm1 4v4.6l3.2 1.9-1 1.7L11 12.7V7Z" />;
}

const RoundedIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(function RoundedIcon(props, ref) {
  const sx = Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : [];
  return <SvgIcon {...props} ref={ref} sx={[{ borderRadius: "50%", bgcolor: "action.hover", p: 0.5 }, ...sx]} />;
});

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider icons={{ "status-clock": ClockGeometry }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <VireoIcon
            icon="status-clock"
            titleAccess="Scheduled"
            slots={{ root: RoundedIcon }}
            slotProps={{ root: ownerState => ({ "data-registry-icon": ownerState.icon }) }}
            color="primary"
            width={40}
            height={40}
          />
          <Typography color="text.primary">Scheduled task</Typography>
        </Stack>
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
