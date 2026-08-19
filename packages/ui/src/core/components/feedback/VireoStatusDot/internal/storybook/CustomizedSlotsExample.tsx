import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, Typography } from "@mui/material";
import { forwardRef, type HTMLAttributes } from "react";

const PulsingDot = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function PulsingDot(props, ref) {
  return <span {...props} ref={ref} data-custom-root="true" />;
});

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={1} alignItems="center">
        <VireoStatusDot
          color="info"
          slots={{ root: PulsingDot }}
          slotProps={{
            root: ({ color }) => ({
              "data-status-color": color,
              sx: { boxShadow: "0 0 0 4px rgba(41, 182, 246, 0.18)" },
            }),
          }}
        />
        <Typography>Synchronization in progress</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
