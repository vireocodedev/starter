import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoSnack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const theme = (outer: Theme) =>
  createTheme(outer, {
    components: {
      VireoSnack: {
        defaultProps: { variant: "info" },
        styleOverrides: {
          root: { border: "1px solid #38bdf8", backgroundColor: "rgba(14, 116, 144, 0.22)" },
          message: { fontWeight: 700 },
        },
      },
    },
  });

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoSnack message="A new version is available" startAdornment={<InfoOutlinedIcon fontSize="small" />} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
