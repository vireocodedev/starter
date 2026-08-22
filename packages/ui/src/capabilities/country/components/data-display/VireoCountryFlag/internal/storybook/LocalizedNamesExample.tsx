import { Box, Stack, Typography } from "@mui/material";
import { VireoCountryFlag, getCountryName, type CountryCode } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const locales = ["en", "hr", "bs", "cnr", "de", "it", "pt", "sl"] as const;
const countryCodes = ["HR", "JP", "BQ-BO", "GB-SCT", "XA"] as const satisfies readonly CountryCode[];

export default function LocalizedNamesExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "80px repeat(5, minmax(145px, 1fr))", minWidth: 820 }}>
          <Box />
          {countryCodes.map(countryCode => (
            <Stack key={countryCode} direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
              <VireoCountryFlag countryCode={countryCode} />
              <Typography variant="subtitle2">{countryCode}</Typography>
            </Stack>
          ))}
          {locales.flatMap(locale => [
            <Typography key={`${locale}-label`} variant="subtitle2" sx={{ p: 1, textTransform: "uppercase" }}>
              {locale}
            </Typography>,
            ...countryCodes.map(countryCode => {
              const name = getCountryName(countryCode, locale);
              return (
                <Stack
                  key={`${locale}-${countryCode}`}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ p: 1, borderTop: 1, borderColor: "divider" }}
                >
                  <VireoCountryFlag countryCode={countryCode} label={name} enableTooltip />
                  <Typography variant="body2">{name}</Typography>
                </Stack>
              );
            }),
          ])}
        </Box>
      </Box>
    </VireoStorybookProvider>
  );
}
