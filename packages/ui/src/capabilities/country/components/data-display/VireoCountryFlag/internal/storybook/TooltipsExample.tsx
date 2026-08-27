import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/ui/country";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function TooltipsExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: "center",
        }}
      >
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoCountryFlag countryCode="JP" enableTooltip width={36} />
          <Typography variant="caption">Derived English name</Typography>
        </Stack>
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoCountryFlag countryCode="GB-SCT" label="Scottish office" enableTooltip width={36} />
          <Typography variant="caption">Explicit label</Typography>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
