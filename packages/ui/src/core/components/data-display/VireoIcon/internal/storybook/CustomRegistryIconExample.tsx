import { Stack, Typography } from "@mui/material";
import React from "react";
import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

declare module "@vireocodedev/ui" {
  interface VireoIconRegistry {
    "status-clock": React.ComponentType;
  }
}

function ClockGeometry() {
  return <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm1 4v4.6l3.2 1.9-1 1.7L11 12.7V7Z" />;
}

export default function CustomRegistryIconExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider icons={{ "status-clock": ClockGeometry }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoIcon icon="status-clock" color="info" aria-hidden />
          <Typography>Scheduled task</Typography>
        </Stack>
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
