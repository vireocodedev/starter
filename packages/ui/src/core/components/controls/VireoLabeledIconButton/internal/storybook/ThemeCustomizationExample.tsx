import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabeledIconButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
const theme = (outer: Theme) =>
  createTheme(outer, {
    components: {
      VireoLabeledIconButton: {
        styleOverrides: {
          root: { backgroundColor: "rgba(167, 139, 250, 0.14)" },
          visual: { color: "#a78bfa" },
          label: { fontWeight: 700 },
        },
      },
    },
  });
export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoLabeledIconButton label="Settings" icon={<SettingsRoundedIcon />} onClick={() => undefined} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
