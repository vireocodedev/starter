import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <VireoCountryFlag countryCode="HR" label="Flag of Croatia" />
        <Typography>Croatia</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
