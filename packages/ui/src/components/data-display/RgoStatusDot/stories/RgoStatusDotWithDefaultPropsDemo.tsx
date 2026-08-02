import { RgoStatusDot } from "@/components/data-display/RgoStatusDot/RgoStatusDot";
import { Stack, Typography } from "@mui/material";

const COLORS = ["success", "error", "warning", "info", "standard"] as const;

export function RgoStatusDotWithDefaultPropsDemo() {
  return (
    <Stack direction="row" spacing={4} alignItems="center">
      {COLORS.map(color => (
        <Stack key={color} alignItems="center" spacing={1}>
          <RgoStatusDot color={color} />
          <Typography variant="caption">{color}</Typography>
        </Stack>
      ))}
      <Stack alignItems="center" spacing={1} sx={{ p: 1, backgroundColor: "primary.main", borderRadius: 1 }}>
        <RgoStatusDot color="success" selected />
        <Typography variant="caption" color="primary.contrastText">
          selected
        </Typography>
      </Stack>
    </Stack>
  );
}

export const RgoStatusDotWithDefaultPropsDemoCode = `
import { RgoStatusDot } from "@vireocodedev/starter-ui";

function Example() {
  return (
    <>
      <RgoStatusDot color="success" />
      <RgoStatusDot color="error" />
      <RgoStatusDot color="warning" />
      <RgoStatusDot color="info" />
      <RgoStatusDot color="standard" />

      {/* Inverted color when rendered on a dark/colored background */}
      <RgoStatusDot color="success" selected />
    </>
  );
}`;
