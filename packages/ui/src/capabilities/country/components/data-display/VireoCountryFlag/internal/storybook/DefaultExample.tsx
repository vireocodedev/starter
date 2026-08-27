import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/ui/country";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: "center",
        }}
      >
        <VireoCountryFlag countryCode="HR" label="Flag of Croatia" />
        <Typography>Croatia</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
