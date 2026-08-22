import { Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { VireoCountryFlag } from "@vireocodedev/starter-ui/country";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoCountryFlag: {
        defaultProps: { width: 36 },
        styleOverrides: {
          root: {
            borderRadius: 6,
            boxShadow: "0 0 0 2px #a78bfa",
          },
          unknown: {
            "--VireoCountryFlag-unknownBackground": "#312e81",
            "--VireoCountryFlag-unknownForeground": "#c4b5fd",
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <VireoCountryFlag countryCode="IT" />
            <Typography>Known</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <VireoCountryFlag countryCode="ZZ" />
            <Typography>Unknown</Typography>
          </Stack>
        </Stack>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
