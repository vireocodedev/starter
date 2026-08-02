import { RgoStatusText } from "@/components/data-display/RgoStatusText/RgoStatusText";
import { Stack, Typography } from "@mui/material";

export function RgoStatusTextWithDefaultPropsDemo() {
  return (
    <Stack spacing={3} alignItems="flex-start">
      <RgoStatusText color="success" label="Online" />
      <RgoStatusText color="warning" label="Reconnecting" />
      <RgoStatusText color="error" label="Disconnected" />
      <RgoStatusText color="info" label="Idle" />

      <Typography variant="caption" color="text.secondary">
        Hover the items below to see the popover tooltip:
      </Typography>
      <RgoStatusText color="success" label="Connected" tooltip="Last heartbeat 2s ago" />
      <RgoStatusText
        color="error"
        label="Down"
        tooltip={
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Connection lost</Typography>
            <Typography variant="body2" color="text.secondary">
              Retrying every 5 seconds.
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
}

export const RgoStatusTextWithDefaultPropsDemoCode = `
import { RgoStatusText } from "@vireocodedev/starter-ui";

function ConnectionStatus() {
  return (
    <>
      <RgoStatusText color="success" label="Connected" />

      {/* String tooltip */}
      <RgoStatusText color="success" label="Connected" tooltip="Last heartbeat 2s ago" />

      {/* React-node tooltip for richer content */}
      <RgoStatusText
        color="error"
        label="Down"
        tooltip={
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Connection lost</Typography>
            <Typography variant="body2">Retrying every 5 seconds.</Typography>
          </Stack>
        }
      />
    </>
  );
}`;
