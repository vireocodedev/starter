import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const widths = [16, 24, 36, 48] as const;

export default function SizingExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" alignItems="end" spacing={3}>
        {widths.map(width => (
          <Stack key={width} alignItems="center" spacing={1}>
            <VireoCountryFlag countryCode="DE" width={width} label={`Flag of Germany at ${width} pixels`} />
            <Typography variant="caption">{width}px</Typography>
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
