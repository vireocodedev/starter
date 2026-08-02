import { RgoTimeWithDateDisplay } from "@/components/data-display/RgoTimeWithDateDisplay/RgoTimeWithDateDisplay";
import { Box, Stack, Typography } from "@mui/material";

const NOW = Date.now();
const ONE_HOUR = 60 * 60 * 1000;

export function RgoTimeWithDateDisplayWithDefaultPropsDemo() {
  return (
    <Stack spacing={3} alignItems="flex-start">
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Now
        </Typography>
        <RgoTimeWithDateDisplay timestamp={NOW} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          One hour ago
        </Typography>
        <RgoTimeWithDateDisplay timestamp={NOW - ONE_HOUR} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Null timestamp (default fallback)
        </Typography>
        <Box>
          <RgoTimeWithDateDisplay timestamp={null} />
        </Box>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Null timestamp with custom fallback
        </Typography>
        <RgoTimeWithDateDisplay timestamp={null} fallback={<em style={{ opacity: 0.6 }}>not available</em>} />
      </Stack>
    </Stack>
  );
}

export const RgoTimeWithDateDisplayWithDefaultPropsDemoCode = `
import { RgoTimeWithDateDisplay } from "@vireocodedev/starter-ui";

function Example({ ts }: { ts: number | null }) {
  return (
    <>
      {/* Time on top, date below in a smaller, dimmed style */}
      <RgoTimeWithDateDisplay timestamp={ts} />

      {/* Custom fallback for nullable timestamps */}
      <RgoTimeWithDateDisplay timestamp={null} fallback={<em>not available</em>} />
    </>
  );
}`;
