import { RgoTimeWithDateDisplayInline } from "@/components/data-display/RgoTimeWithDateDisplayInline/RgoTimeWithDateDisplayInline";
import { Stack, Typography } from "@mui/material";

const NOW = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;

export function RgoTimeWithDateDisplayInlineWithDefaultPropsDemo() {
  return (
    <Stack spacing={3} alignItems="flex-start">
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Default (bullet separator, secondary color)
        </Typography>
        <RgoTimeWithDateDisplayInline timestamp={NOW} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Custom separator
        </Typography>
        <RgoTimeWithDateDisplayInline timestamp={NOW - ONE_DAY} separator="—" />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Custom Typography props (variant + color)
        </Typography>
        <RgoTimeWithDateDisplayInline timestamp={NOW} variant="h6" color="text.primary" />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Null timestamp with custom fallback
        </Typography>
        <RgoTimeWithDateDisplayInline timestamp={null} fallback="—" />
      </Stack>
    </Stack>
  );
}

export const RgoTimeWithDateDisplayInlineWithDefaultPropsDemoCode = `
import { RgoTimeWithDateDisplayInline } from "@vireocodedev/starter-ui";

function Example({ ts }: { ts: number | null }) {
  return (
    <>
      {/* Default: "12:34 • 01/01/2025", text.secondary */}
      <RgoTimeWithDateDisplayInline timestamp={ts} />

      {/* Custom separator and Typography props (variant, color, sx, …) */}
      <RgoTimeWithDateDisplayInline timestamp={ts} separator="—" variant="h6" color="text.primary" />

      {/* Custom fallback for nullable timestamps */}
      <RgoTimeWithDateDisplayInline timestamp={null} fallback="—" />
    </>
  );
}`;
