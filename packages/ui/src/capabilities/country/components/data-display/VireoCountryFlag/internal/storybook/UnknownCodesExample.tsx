import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function UnknownCodesExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <VireoCountryFlag countryCode="ZZ" enableTooltip />
          <Typography>Unsupported code: ZZ</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <VireoCountryFlag countryCode="" enableTooltip />
          <Typography>Empty code</Typography>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
