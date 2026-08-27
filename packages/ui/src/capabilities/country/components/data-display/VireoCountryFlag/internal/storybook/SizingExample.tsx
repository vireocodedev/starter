import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/ui/country";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const widths = [16, 24, 36, 48] as const;

export default function SizingExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: "end",
        }}
      >
        {widths.map(width => (
          <Stack
            key={width}
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <VireoCountryFlag countryCode="DE" width={width} label={`Flag of Germany at ${width} pixels`} />
            <Typography variant="caption">{width}px</Typography>
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
