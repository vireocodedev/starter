import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function TooltipsExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" alignItems="center" spacing={3}>
        <Stack alignItems="center" spacing={1}>
          <VireoCountryFlag countryCode="JP" enableTooltip width={36} />
          <Typography variant="caption">Derived English name</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <VireoCountryFlag countryCode="GB-SCT" label="Scottish office" enableTooltip width={36} />
          <Typography variant="caption">Explicit label</Typography>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
