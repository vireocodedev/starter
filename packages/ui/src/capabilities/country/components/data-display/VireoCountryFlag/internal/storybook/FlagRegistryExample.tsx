import { COUNTRY_CODES, VireoCountryFlag, getCountryName } from "@vireocodedev/ui/country";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

export default function FlagRegistryExample() {
  return (
    <VireoStorybookProvider>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 1,
          maxHeight: 520,
          overflow: "auto",
          pr: 1,
        }}
      >
        {COUNTRY_CODES.map(countryCode => (
          <Stack
            key={countryCode}
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              p: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <VireoCountryFlag countryCode={countryCode} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {getCountryName(countryCode, "en")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {countryCode}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </VireoStorybookProvider>
  );
}
