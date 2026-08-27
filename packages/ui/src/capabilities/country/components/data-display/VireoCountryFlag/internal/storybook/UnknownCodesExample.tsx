import { Stack, Typography } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/ui/country";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function UnknownCodesExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoCountryFlag countryCode="ZZ" enableTooltip />
          <Typography>Unsupported code: ZZ</Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoCountryFlag countryCode="" enableTooltip />
          <Typography>Empty code</Typography>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
